<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->month);
        $year = (int) $request->get('year', now()->year);
        $view = $request->get('view', 'monthly');
        $date = Carbon::createFromDate($year, $month, 1);

        // Get monthly total
        $monthlyTotal = Expense::whereYear('date', $year)
            ->whereMonth('date', $month)
            ->sum('amount');

        // Get previous month's total for growth calculation
        $previousMonthTotal = Expense::whereYear('date', $date->copy()->subMonth()->year)
            ->whereMonth('date', $date->copy()->subMonth()->month)
            ->sum('amount');

        // Calculate growth percentage
        $growth = $previousMonthTotal > 0
            ? (($monthlyTotal - $previousMonthTotal) / $previousMonthTotal) * 100
            : 0;

        // Get previous year's same month total for comparison
        $previousYearTotal = Expense::whereYear('date', $year - 1)
            ->whereMonth('date', $month)
            ->sum('amount');

        $previousYearComparison = [
            'amount' => $previousYearTotal,
            'percentage' => $previousYearTotal > 0
                ? (($monthlyTotal - $previousYearTotal) / $previousYearTotal) * 100
                : 0
        ];

        // Get year to date statistics
        $yearToDate = $this->getYearToDateStats($year);

        // Get daily average for current month
        $dailyAverage = $monthlyTotal / $date->daysInMonth;

        // Get monthly trend (last 12 months)
        $monthlyTrend = $this->getMonthlyTrend($date, $view);

        // Get category breakdown
        $categoryDetails = $this->getCategoryBreakdown($date);

        // Get category trends
        $categoryTrends = $this->getCategoryTrends($date);

        return Inertia::render('Reports/Index', [
            'monthlyTotal' => $monthlyTotal,
            'monthlyTrend' => $monthlyTrend,
            'categoryDetails' => $categoryDetails,
            'categoryTrends' => $categoryTrends,
            'yearToDate' => $yearToDate,
            'previousYearComparison' => $previousYearComparison,
            'dailyAverage' => $dailyAverage,
            'growth' => [
                'amount' => $growth
            ]
        ]);
    }

    private function getYearToDateStats(int $year): array
    {
        $startOfYear = Carbon::createFromDate($year, 1, 1)->startOfYear();
        $now = Carbon::now();

        // Get total expenses for the year
        $total = Expense::whereYear('date', $year)->sum('amount');

        // Get monthly average
        $monthCount = $now->year === $year
            ? $now->month
            : 12;
        $averageMonthly = $total / $monthCount;

        // Get highest spending month
        $highestMonth = Expense::selectRaw('MONTH(date) as month, SUM(amount) as total')
            ->whereYear('date', $year)
            ->groupBy(DB::raw('MONTH(date)'))
            ->orderByDesc('total')
            ->first();

        // Get top category
        $topCategory = Expense::select('categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->join('categories', 'categories.id', '=', 'expenses.category_id')
            ->whereYear('expenses.date', $year)
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->first();

        return [
            'total' => $total,
            'averageMonthly' => $averageMonthly,
            'highestMonth' => [
                'month' => $highestMonth ? Carbon::createFromDate($year, $highestMonth->month, 1)->format('F') : null,
                'amount' => $highestMonth ? $highestMonth->total : 0,
            ],
            'topCategory' => [
                'name' => $topCategory ? $topCategory->name : null,
                'amount' => $topCategory ? $topCategory->total : 0,
            ],
        ];
    }

    private function getMonthlyTrend(Carbon $date, string $view = 'monthly'): array
    {
        $query = Expense::query();

        switch ($view) {
            case 'yearly':
                $query->selectRaw('YEAR(date) as period, SUM(amount) as amount')
                    ->where('date', '>=', $date->copy()->subYears(5)->startOfYear())
                    ->where('date', '<=', $date->endOfYear())
                    ->groupBy(DB::raw('YEAR(date)'));
                break;
            case 'quarterly':
                $query->selectRaw('YEAR(date) as year, QUARTER(date) as quarter, SUM(amount) as amount')
                    ->where('date', '>=', $date->copy()->subYear()->startOfQuarter())
                    ->where('date', '<=', $date->endOfQuarter())
                    ->groupBy(DB::raw('YEAR(date)'), DB::raw('QUARTER(date)'))
                    ->orderBy('year')
                    ->orderBy('quarter');
                break;
            default: // monthly
                $query->selectRaw('DATE_FORMAT(date, "%Y-%m") as period, SUM(amount) as amount')
                    ->where('date', '>=', $date->copy()->subMonths(11)->startOfMonth())
                    ->where('date', '<=', $date->endOfMonth())
                    ->groupBy('period');
        }

        return $query->get()
            ->map(function ($item) use ($view) {
                $period = match($view) {
                    'yearly' => $item->period,
                    'quarterly' => "Q{$item->quarter} {$item->year}",
                    default => Carbon::createFromFormat('Y-m', $item->period)->format('M Y')
                };

                return [
                    'period' => $period,
                    'amount' => $item->amount,
                ];
            })
            ->toArray();
    }

    private function getCategoryBreakdown(Carbon $date): array
    {
        $total = Expense::whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->sum('amount');

        $previousDate = $date->copy()->subMonth();

        $results = DB::table('categories')
            ->select([
                'categories.name',
                DB::raw('COALESCE(SUM(CASE
                    WHEN YEAR(expenses.date) = ? AND MONTH(expenses.date) = ?
                    THEN expenses.amount ELSE 0 END), 0) as current_amount'),
                DB::raw('COALESCE(SUM(CASE
                    WHEN YEAR(expenses.date) = ? AND MONTH(expenses.date) = ?
                    THEN expenses.amount ELSE 0 END), 0) as previous_amount')
            ])
            ->leftJoin('expenses', 'categories.id', '=', 'expenses.category_id')
            ->whereRaw('(
                (YEAR(expenses.date) = ? AND MONTH(expenses.date) = ?) OR
                (YEAR(expenses.date) = ? AND MONTH(expenses.date) = ?) OR
                expenses.id IS NULL
            )', [
                $date->year, $date->month,
                $previousDate->year, $previousDate->month,
                $date->year, $date->month,
                $previousDate->year, $previousDate->month
            ])
            ->groupBy('categories.id', 'categories.name')
            ->get();

        return $results->map(function ($item) use ($total) {
            $currentAmount = (float) $item->current_amount;
            $previousAmount = (float) $item->previous_amount;

            $growth = $previousAmount > 0
                ? (($currentAmount - $previousAmount) / $previousAmount) * 100
                : ($currentAmount > 0 ? 100 : 0);

            return [
                'name' => $item->name,
                'amount' => $currentAmount,
                'percentage' => $total > 0 ? ($currentAmount / $total) * 100 : 0,
                'previous_amount' => $previousAmount,
                'growth' => round($growth, 1)
            ];
        })
        ->sortByDesc('amount')
        ->values()
        ->toArray();
    }

    private function getCategoryTrends(Carbon $date): array
    {
        $categories = Expense::select('categories.name', 'categories.id')
            ->join('categories', 'categories.id', '=', 'expenses.category_id')
            ->distinct()
            ->get();

        return $categories->map(function ($category) use ($date) {
            $trends = Expense::selectRaw('DATE_FORMAT(date, "%Y-%m") as period, SUM(amount) as amount')
                ->where('category_id', $category->id)
                ->where('date', '>=', $date->copy()->subMonths(11)->startOfMonth())
                ->where('date', '<=', $date->endOfMonth())
                ->groupBy('period')
                ->orderBy('period')
                ->get();

            return [
                'name' => $category->name,
                'data' => $trends->map(fn ($trend) => [
                    'period' => Carbon::createFromFormat('Y-m', $trend->period)->format('M Y'),
                    'amount' => $trend->amount,
                ])->toArray(),
            ];
        })->toArray();
    }
}

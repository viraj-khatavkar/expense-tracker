import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryTrendsChart from '@/components/CategoryTrendsChart';
import { useState, useEffect, useRef } from 'react';
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon, CalendarIcon, BarChart3Icon, TagIcon, LucideIcon } from 'lucide-react';

interface CategoryBreakdown {
    name: string;
    amount: number;
    percentage: number;
    previous_amount: number;
    growth: number;
}

interface MonthlyTrend {
    period: string;
    amount: number;
}

interface Props {
    monthlyTotal: number;
    monthlyTrend: MonthlyTrend[];
    categoryDetails: CategoryBreakdown[];
    categoryTrends: Array<{
        name: string;
        data: Array<{
            period: string;
            amount: number;
        }>;
    }>;
    yearToDate: {
        total: number;
        averageMonthly: number;
        highestMonth: {
            month: string;
            amount: number;
        };
        topCategory: {
            name: string;
            amount: number;
        };
    };
    previousYearComparison: {
        amount: number;
        percentage: number;
    };
    dailyAverage: number;
    growth?: {
        amount: number;
    };
}

export default function Index({
    monthlyTotal,
    monthlyTrend,
    categoryDetails,
    categoryTrends,
    yearToDate,
    previousYearComparison,
    dailyAverage,
    growth
}: Props) {
    const isInitialMount = useRef(true);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedView, setSelectedView] = useState('monthly');

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(route('reports.index'), {
                month: selectedMonth,
                year: selectedYear,
                view: selectedView
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedYear, selectedMonth, selectedView]);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const growthAmount = growth?.amount || 0;

    const filteredTrends = selectedCategory === 'all'
        ? categoryTrends
        : categoryTrends.filter(trend => trend.name === selectedCategory);

    const StatCard = ({ title, value, icon: Icon, subValue, subText }: {
        title: string;
        value: string;
        icon: LucideIcon;
        subValue?: string;
        subText?: string;
    }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h2 className="text-2xl font-bold mt-2">{value}</h2>
                        {subValue && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {subValue} {subText}
                            </p>
                        )}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout>
            <Head title="Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Period Selector */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Select Period</h2>
                                <div className="flex gap-4">
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map(month => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(year => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Year to Date"
                            value={formatCurrency(yearToDate.total)}
                            icon={CalendarIcon}
                            subValue={`Avg. ${formatCurrency(yearToDate.averageMonthly)}`}
                            subText="per month"
                        />
                        <StatCard
                            title="Highest Spending"
                            value={formatCurrency(yearToDate.highestMonth.amount)}
                            icon={TrendingUpIcon}
                            subValue={yearToDate.highestMonth.month}
                            subText="this year"
                        />
                        <StatCard
                            title="Top Category"
                            value={yearToDate.topCategory.name}
                            icon={TagIcon}
                            subValue={formatCurrency(yearToDate.topCategory.amount)}
                            subText="spent"
                        />
                        <StatCard
                            title="Monthly Average"
                            value={formatCurrency(yearToDate.averageMonthly)}
                            icon={BarChart3Icon}
                            subValue={`${formatCurrency(dailyAverage)}`}
                            subText="per day"
                        />
                    </div>

                    {/* Monthly Total with Enhanced Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-medium">Monthly Total</h2>
                                    <p className="text-3xl font-bold mt-4">
                                        {formatCurrency(monthlyTotal)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {growthAmount > 0 ? (
                                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            {Math.abs(growthAmount).toFixed(1)}% from last month
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {previousYearComparison.percentage > 0 ? (
                                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            {Math.abs(previousYearComparison.percentage).toFixed(1)}% vs last year
                                        </p>
                                    </div>
                                </div>
                                <div className="w-[200px] h-[60px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyTrend.slice(-6)}>
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend with View Options */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">Monthly Trend</h2>
                                <Select value={selectedView} onValueChange={setSelectedView}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select view" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="mt-4" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            labelFormatter={(label) => `Period: ${label}`}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#8884d8"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Analysis */}
                    <div className="space-y-6">
                        {/* Category Details Table */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-medium mb-4">Category Details</h2>
                                <div className="mt-4 relative w-full overflow-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium">Amount</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium">%</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium">vs Last Month</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryDetails.map((category, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="p-4 align-middle">{category.name}</td>
                                                    <td className="p-4 align-middle text-right">
                                                        {formatCurrency(category.amount)}
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        {category.percentage.toFixed(1)}%
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {category.growth > 0 ? (
                                                                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                                                            ) : category.growth < 0 ? (
                                                                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                                            ) : null}
                                                            <span>{category.growth}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Trends Chart */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">Category Trends</h2>
                                <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categoryTrends.map(trend => (
                                            <SelectItem key={trend.name} value={trend.name}>
                                                {trend.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="mt-4">
                                <CategoryTrendsChart trends={filteredTrends} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

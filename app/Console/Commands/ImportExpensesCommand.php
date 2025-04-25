<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportExpensesCommand extends Command
{
    protected $signature = 'import:expenses';

    protected $description = 'Import expenses and categories from CSV file';

    public function handle(): void
    {
        $this->info('Starting import...');

        // Read the CSV file
        $csvFile = storage_path('Expenses.csv');
        if (!file_exists($csvFile)) {
            $this->error('CSV file not found!');
            return;
        }

        $file = fopen($csvFile, 'r');

        // Skip header row
        fgetcsv($file);

        // Get unique categories first
        $categories = [];
        $position = ftell($file);

        while (($data = fgetcsv($file)) !== false) {
            if (isset($data[3]) && !empty($data[3])) {
                $categories[] = $data[3];
            }
        }

        $categories = array_unique($categories);

        // Create categories
        $categoryMap = [];
        foreach ($categories as $categoryName) {
            $category = Category::firstOrCreate([
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
            ]);
            $categoryMap[$categoryName] = $category->id;
            $this->info("Category processed: {$categoryName}");
        }

        // Reset file pointer to start importing expenses
        fseek($file, $position);

        // Import expenses
        $count = 0;
        while (($data = fgetcsv($file)) !== false) {
            if (count($data) >= 4) {
                $date = $data[0];
                $amount = str_replace(',', '', $data[1]); // Remove any commas in amount
                $description = $data[2];
                $categoryName = $data[3];

                if (isset($categoryMap[$categoryName])) {
                    Expense::create([
                        'date' => $date,
                        'amount' => $amount,
                        'description' => $description,
                        'category_id' => $categoryMap[$categoryName],
                    ]);
                    $count++;

                    if ($count % 100 === 0) {
                        $this->info("{$count} expenses processed...");
                    }
                }
            }
        }

        fclose($file);

        $this->info('Import completed!');
        $this->info("Total categories created: " . count($categories));
        $this->info("Total expenses imported: {$count}");
    }
}

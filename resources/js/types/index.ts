export interface Category {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: number;
    amount: number;
    description: string;
    category_id: number;
    date: string;
    created_at: string;
    updated_at: string;
    category?: Category;
}

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TrendPoint {
    period: string;
    amount: number;
}

interface CategoryTrend {
    name: string;
    data: TrendPoint[];
}

interface Props {
    trends: CategoryTrend[];
}

const colors = [
    'rgb(255, 99, 132)',
    'rgb(53, 162, 235)',
    'rgb(75, 192, 192)',
    'rgb(255, 206, 86)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
];

export default function CategoryTrendsChart({ trends }: Props) {
    if (!trends.length) return null;

    const periods = trends[0].data.map(point => point.period);

    const data = {
        labels: periods,
        datasets: trends.map((trend, index) => ({
            label: trend.name,
            data: trend.data.map(point => point.amount),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length],
            tension: 0.4,
        })),
    };

    const options = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Category Trends',
            },
        },
        scales: {
            y: {
                type: 'linear' as const,
                beginAtZero: true,
                ticks: {
                    callback: function(tickValue: number | string) {
                        return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(Number(tickValue));
                    },
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <Line options={options} data={data} />
        </div>
    );
}

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowUpRight,
    Maximize2,
    MoreVertical,
    TrendingUp,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface StatCardProps {
    title: string;
    amount: string;
    change: string;
    changeAmount: string;
    color: string;
    chartData: number[];
}

const StatCard = ({
    title,
    amount,
    change,
    changeAmount,
    color,
    chartData,
}: StatCardProps) => {
    return (
        <div className="group relative flex items-end justify-between overflow-hidden rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-4">
                <p className="font-medium text-neutral-500 dark:text-neutral-400">
                    {title}
                </p>
                <h3 className="text-3xl font-bold tracking-tight">{amount}</h3>
                <div className="flex items-center gap-2">
                    <span className="flex items-center text-sm font-bold text-green-500">
                        {change} <TrendingUp className="ml-1 size-3" />
                    </span>
                    <span className="text-sm text-neutral-400">
                        {changeAmount}
                    </span>
                </div>
            </div>

            <div className="flex h-12 items-end gap-1">
                {chartData.map((val, i) => (
                    <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-500 group-hover:scale-y-110`}
                        style={{
                            height: `${val}%`,
                            backgroundColor: color,
                            opacity: 0.3 + (i / chartData.length) * 0.7,
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

const ClientGrowthCard = () => {
    return (
        <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold">Client Growth</h3>
                    <p className="text-sm text-neutral-400">1 Jan - Today</p>
                </div>
                <div className="flex gap-2">
                    <button className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <Maximize2 className="size-4" />
                    </button>
                    <button className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <MoreVertical className="size-4" />
                    </button>
                </div>
            </div>

            <div className="relative flex flex-col items-center py-8">
                {/* SVG Semi-circle gauge */}
                <svg className="h-24 w-48" viewBox="0 0 100 50">
                    <path
                        d="M 5,50 A 45,45 0 0,1 95,50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-neutral-100 dark:text-neutral-800"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 5,50 A 45,45 0 0,1 95,50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        className="text-blue-500"
                        strokeDasharray="141.37"
                        strokeDashoffset={141.37 * (1 - 0.64)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                    <h2 className="text-4xl font-black">64%</h2>
                    <div className="mt-1 flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-green-500">
                            10%
                        </span>
                        <ArrowUpRight className="size-3 text-green-500" />
                        <span className="text-[10px] text-neutral-400">
                            +$834 today
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatisticCard = () => {
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
    ];
    const incomeData = [40, 30, 60, 45, 55, 100, 40, 50, 45, 30];
    const expenseData = [20, 15, 40, 25, 35, 60, 25, 30, 25, 20];

    return (
        <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h3 className="text-xl font-bold">Statistic</h3>
                    <p className="text-sm text-neutral-400">
                        Income vs expenses
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
                        <button className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                            Monthly
                        </button>
                        <button className="px-5 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                            Weekly
                        </button>
                        <button className="px-5 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
                            Daily
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-2xl bg-neutral-100 p-3 text-neutral-400 dark:bg-neutral-800">
                            <Maximize2 className="size-4" />
                        </button>
                        <button className="rounded-2xl bg-neutral-100 p-3 text-neutral-400 dark:bg-neutral-800">
                            <MoreVertical className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-12 flex gap-8">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-500 dark:bg-blue-500/10">
                        $
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-400">
                            Income
                        </p>
                        <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-bold">$72,428</h4>
                            <span className="flex items-center text-xs font-bold text-green-500">
                                10% <TrendingUp className="ml-0.5 size-3" />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-500 dark:bg-orange-500/10">
                        -
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-400">
                            Expenses
                        </p>
                        <div className="flex items-center gap-2">
                            <h4 className="text-2xl font-bold">$25,641</h4>
                            <span className="flex items-center text-xs font-bold text-green-500">
                                10% <TrendingUp className="ml-0.5 size-3" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative mt-8 h-[300px] w-full">
                {/* Grid Lines */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-full flex-col justify-between">
                    {[1200, 1000, 800, 600, 400, 200, 0].map((val) => (
                        <div
                            key={val}
                            className="flex w-full items-center gap-4"
                        >
                            <span className="w-8 text-[10px] font-bold text-neutral-400">
                                $
                                {val === 1200
                                    ? '1.2k'
                                    : val === 1000
                                      ? '1k'
                                      : val}
                            </span>
                            <div className="flex-1 border-t border-dashed border-neutral-100 dark:border-neutral-800"></div>
                        </div>
                    ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-x-0 top-0 bottom-0 left-12 flex items-end justify-between px-4">
                    {months.map((month, i) => (
                        <div
                            key={month}
                            className="group relative flex w-[6%] flex-col items-center gap-4"
                        >
                            <div className="flex h-full w-full items-end gap-1">
                                <div
                                    className="w-full rounded-t-lg bg-orange-500/90 transition-all duration-500"
                                    style={{ height: `${expenseData[i]}%` }}
                                ></div>
                                <div
                                    className="w-full rounded-t-lg bg-blue-500/90 transition-all duration-500 group-hover:bg-blue-600"
                                    style={{ height: `${incomeData[i]}%` }}
                                >
                                    {/* Tooltip on Hover */}
                                    {i === 5 && (
                                        <div className="absolute -top-16 left-1/2 z-10 w-32 -translate-x-1/2 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 whitespace-nowrap text-white shadow-2xl">
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[10px] font-bold">
                                                    Label : $680
                                                </span>
                                                <TrendingUp className="ml-auto size-3 text-green-500" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-orange-500"></div>
                                                <span className="text-[10px] font-bold">
                                                    Label : $280
                                                </span>
                                                <TrendingUp className="ml-auto size-3 text-green-500" />
                                            </div>
                                            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-neutral-700 bg-neutral-900"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-400">
                                {month}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left 6 Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
                        <StatCard
                            title="Total Income"
                            amount="$72,428"
                            change="10%"
                            changeAmount="+$142"
                            color="#3b82f6"
                            chartData={[40, 60, 30, 80, 50, 90, 70]}
                        />
                        <StatCard
                            title="Total Sale"
                            amount="24,210"
                            change="10%"
                            changeAmount="+$142"
                            color="#f59e0b"
                            chartData={[30, 50, 70, 40, 80, 50, 60]}
                        />
                        <StatCard
                            title="Total Profit"
                            amount="$46,787"
                            change="10%"
                            changeAmount="+$142"
                            color="#22c55e"
                            chartData={[50, 30, 60, 40, 70, 40, 80]}
                        />
                        <StatCard
                            title="New Orders"
                            amount="7,428"
                            change="10%"
                            changeAmount="+$142"
                            color="#a855f7"
                            chartData={[60, 40, 80, 50, 90, 60, 40]}
                        />
                        <StatCard
                            title="Pending Orders"
                            amount="4,210"
                            change="10%"
                            changeAmount="+$142"
                            color="#06b6d4"
                            chartData={[40, 70, 40, 60, 30, 80, 50]}
                        />
                        <StatCard
                            title="Cancel Orders"
                            amount="6,787"
                            change="10%"
                            changeAmount="+$142"
                            color="#f97316"
                            chartData={[70, 50, 60, 80, 40, 60, 30]}
                        />
                    </div>

                    {/* Right Client Growth */}
                    <div className="lg:col-span-1">
                        <ClientGrowthCard />
                    </div>
                </div>
                {/* <StatisticCard /> */}
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    DollarSign,
    Download,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Laporan',
        href: '/reports',
    },
];

interface Transaction {
    id: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
}

interface Stats {
    total_revenue: number;
    total_orders: number;
    new_customers: number;
    avg_order_value: number;
}

interface Filters {
    period: string;
    status: string;
}

interface SalesData {
    name: string;
    revenue: number;
    orders: number;
}

interface TopProduct {
    name: string;
    sales: number;
    color: string;
}

interface ReportProps {
    recentTransactions: Transaction[];
    stats: Stats;
    filters: Filters;
    salesData: SalesData[];
    topProducts: TopProduct[];
}

export default function Reports({
    recentTransactions,
    stats,
    filters,
    salesData,
    topProducts,
}: ReportProps) {
  
    const handleExportPdf = () => {
        
        const period = filters.period || 'all';
        const status = filters.status || 'all';

        const url = `/reports/export-pdf?period=${period}&status=${status}`;

       
        window.open(url, '_blank');
    };

    const handleFilterChange = (key: keyof Filters, value: string) => {
    
        const newFilters = { ...filters, [key]: value };

        router.get('/reports', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true, 
            only: [
                'recentTransactions',
                'stats',
                'filters',
                'salesData',
                'topProducts',
            ],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Analistik" />
            <div className="space-y-8 pb-10">
                {/* Header Container */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Laporan Analistik
                        </h1>
                        <p className="text-muted-foreground">
                            Pantau performa bisnis dan pertumbuhan penjualan
                            Anda.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleExportPdf}
                        >
                            <Download className="size-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Periode:
                            </span>
                        </div>
                        <Select
                            value={filters.period}
                            onValueChange={(v) =>
                                handleFilterChange('period', v)
                            }
                        >
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Waktu</SelectItem>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="yesterday">
                                    Kemarin
                                </SelectItem>
                                <SelectItem value="this-month">
                                    Bulan Ini
                                </SelectItem>
                                <SelectItem value="last-month">
                                    Bulan Lalu
                                </SelectItem>
                                <SelectItem value="this-year">
                                    Tahun Ini
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="mx-2 hidden h-6 w-px bg-muted md:block" />

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(v) =>
                                handleFilterChange('status', v)
                            }
                        >
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="pending">
                                    Processing
                                </SelectItem>
                                <SelectItem value="completed">
                                    Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Stat Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Pendapatan"
                        value={formatCurrency(stats.total_revenue)}
                        icon={<DollarSign className="size-4" />}
                        color="blue"
                    />
                    <StatCard
                        title="Jumlah Pesanan"
                        value={stats.total_orders.toString()}
                        icon={<ShoppingBag className="size-4" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Pelanggan Baru"
                        value={`+${stats.new_customers}`}
                        icon={<Users className="size-4" />}
                        color="orange"
                    />
                    <StatCard
                        title="Avg. Order Value"
                        value={formatCurrency(stats.avg_order_value)}
                        icon={<TrendingUp className="size-4" />}
                        color="purple"
                    />
                </div>

                {/* main Charts Section */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Revenue Area Chart */}
                    <Card className="border-none shadow-sm ring-1 ring-muted lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Tren Penjualan</CardTitle>
                            <CardDescription>
                                Data pendapatan 6 bulan terakhir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={salesData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorRev"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#374151"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: '#9ca3af',
                                                fontSize: 12,
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: '#9ca3af',
                                                fontSize: 12,
                                            }}
                                            tickFormatter={(value) =>
                                                `Rp ${value.toLocaleString()}`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                            }}
                                            itemStyle={{ color: '#3b82f6' }}
                                            formatter={(value: any) => [
                                                `Rp ${value.toLocaleString()}`,
                                                'Pendapatan',
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRev)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Products Bar Chart */}
                    <Card className="border-none shadow-sm ring-1 ring-muted lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Produk Terlaris</CardTitle>
                            <CardDescription>
                                Berdasarkan kuantitas sewa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={topProducts}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 40,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                            stroke="#374151"
                                        />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: '#9ca3af',
                                                fontSize: 12,
                                            }}
                                            width={100}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: any) => [
                                                `${value} Unit`,
                                                'Tersewa',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            radius={[0, 4, 4, 0]}
                                            barSize={24}
                                        >
                                            {topProducts.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transaction Table */}
                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <CardHeader>
                        <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">
                                        ID Order
                                    </TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="pr-6">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((tx) => (
                                        <TableRow
                                            key={tx.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="pl-6 font-medium text-primary">
                                                {tx.id}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {tx.date}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {tx.customer}
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {formatCurrency(tx.amount)}
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        tx.status ===
                                                        'Completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : tx.status ===
                                                                'Processing'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada data transaksi untuk
                                            filter ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}) {
    const colorMap: any = {
        blue: 'bg-blue-500/10 text-blue-600',
        emerald: 'bg-emerald-500/10 text-emerald-600',
        orange: 'bg-orange-500/10 text-orange-600',
        purple: 'bg-purple-500/10 text-purple-600',
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`rounded-full p-2 ${colorMap[color]}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

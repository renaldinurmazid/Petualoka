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
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    Download,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
    Wallet,
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

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/reports' },
];

// ── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'expired';

interface Stats {
    total_revenue: number;
    total_orders: number;
    unique_customers: number;
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
    revenue: number;
    color: string;
}

interface Transaction {
    id: string;
    date: string;
    customer: string;
    product: string;
    amount: number;
    status: OrderStatus;
}

interface ReportProps {
    stats: Stats;
    filters: Filters;
    salesData: SalesData[];
    topProducts: TopProduct[];
    recentTransactions: Transaction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);

// Sinkron dengan STATUS_CONFIG di dashboard.tsx
const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
    {
        pending: {
            label: 'Menunggu',
            className:
                'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        },
        paid: {
            label: 'Dibayar',
            className:
                'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        },
        processing: {
            label: 'Diproses',
            className:
                'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
        },
        shipped: {
            label: 'Dikirim',
            className:
                'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
        },
        completed: {
            label: 'Selesai',
            className:
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        },
        cancelled: {
            label: 'Dibatalkan',
            className:
                'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        },
        expired: {
            label: 'Kedaluwarsa',
            className:
                'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
        },
    };

const PERIOD_LABELS: Record<string, string> = {
    all: 'Semua Waktu',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    'this-month': 'Bulan Ini',
    'last-month': 'Bulan Lalu',
    'this-year': 'Tahun Ini',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
    color: string;
    hexColor: string;
}

function StatCard({ title, value, sub, icon, color, hexColor }: StatCardProps) {
    return (
        <Card className="border-none shadow-sm ring-1 ring-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className="flex size-9 items-center justify-center rounded-xl"
                    style={{
                        backgroundColor: `${hexColor}18`,
                        color: hexColor,
                    }}
                >
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ── Tooltip formatter ─────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white shadow-2xl">
            <p className="mb-1 text-xs font-semibold text-neutral-400">
                {label}
            </p>
            <p className="text-sm font-bold text-blue-400">
                {toRupiah(payload[0]?.value ?? 0)}
            </p>
            {payload[1] && (
                <p className="text-xs text-neutral-400">
                    {payload[1].value} pesanan
                </p>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports({
    stats,
    filters,
    salesData,
    topProducts,
    recentTransactions,
}: ReportProps) {
    const handleFilterChange = (key: keyof Filters, value: string) => {
        router.get(
            '/reports',
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'stats',
                    'salesData',
                    'topProducts',
                    'recentTransactions',
                    'filters',
                ],
            },
        );
    };

    const handleExportPdf = () => {
        const params = new URLSearchParams({
            period: filters.period,
            status: filters.status,
        });
        window.open(`/reports/export-pdf?${params}`, '_blank');
    };

    const periodLabel = PERIOD_LABELS[filters.period] ?? 'Semua Waktu';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Analitik" />

            <div className="space-y-8 pb-10">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Laporan Analitik
                        </h1>
                        <p className="text-muted-foreground">
                            Pantau performa toko untuk periode{' '}
                            <span className="font-semibold text-foreground">
                                {periodLabel}
                            </span>
                            .
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2 self-start"
                        onClick={handleExportPdf}
                    >
                        <Download className="size-4" />
                        Export PDF
                    </Button>
                </div>

                {/* ── Filters ────────────────────────────────────────────── */}
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            Periode:
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

                        <span className="text-sm font-medium">Status:</span>
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
                                    Menunggu
                                </SelectItem>
                                <SelectItem value="paid">Dibayar</SelectItem>
                                <SelectItem value="processing">
                                    Diproses
                                </SelectItem>
                                <SelectItem value="shipped">Dikirim</SelectItem>
                                <SelectItem value="completed">
                                    Selesai
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Dibatalkan
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Pendapatan"
                        value={toRupiah(stats.total_revenue)}
                        sub="Dari order selesai"
                        icon={<Wallet className="size-4" />}
                        color="blue"
                        hexColor="#3b82f6"
                    />
                    <StatCard
                        title="Total Pesanan"
                        value={stats.total_orders.toString()}
                        sub="Semua status"
                        icon={<ShoppingBag className="size-4" />}
                        color="emerald"
                        hexColor="#10b981"
                    />
                    <StatCard
                        title="Pelanggan Unik"
                        value={stats.unique_customers.toString()}
                        sub={`Periode: ${periodLabel}`}
                        icon={<Users className="size-4" />}
                        color="orange"
                        hexColor="#f59e0b"
                    />
                    <StatCard
                        title="Rata-rata Nilai Order"
                        value={toRupiah(stats.avg_order_value)}
                        sub="Dari order selesai"
                        icon={<TrendingUp className="size-4" />}
                        color="purple"
                        hexColor="#8b5cf6"
                    />
                </div>

                {/* ── Charts ─────────────────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Tren Penjualan */}
                    <Card className="border-none shadow-sm ring-1 ring-muted lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Tren Penjualan</CardTitle>
                            <CardDescription>
                                Revenue dari order selesai · {periodLabel}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {salesData.length === 0 ? (
                                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                                    Tidak ada data untuk periode ini.
                                </div>
                            ) : (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
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
                                                stroke="#e5e7eb"
                                                className="dark:stroke-neutral-800"
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
                                                    fontSize: 11,
                                                }}
                                                tickFormatter={(v) =>
                                                    `${(v / 1000).toFixed(0)}k`
                                                }
                                            />
                                            <Tooltip
                                                content={<RevenueTooltip />}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#3b82f6"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorRev)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Produk Terlaris */}
                    <Card className="border-none shadow-sm ring-1 ring-muted lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Produk Terlaris</CardTitle>
                            <CardDescription>
                                Berdasarkan kuantitas terjual · {periodLabel}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length === 0 ? (
                                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                                    Tidak ada data untuk periode ini.
                                </div>
                            ) : (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
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
                                                stroke="#e5e7eb"
                                                className="dark:stroke-neutral-800"
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
                                                cursor={{
                                                    fill: 'rgba(0,0,0,0.04)',
                                                }}
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(
                                                    value: number,
                                                    name: string,
                                                ) =>
                                                    name === 'sales'
                                                        ? [
                                                              `${value} unit`,
                                                              'Terjual',
                                                          ]
                                                        : [
                                                              toRupiah(value),
                                                              'Revenue',
                                                          ]
                                                }
                                            />
                                            <Bar
                                                dataKey="sales"
                                                radius={[0, 6, 6, 0]}
                                                barSize={22}
                                            >
                                                {topProducts.map((entry, i) => (
                                                    <Cell
                                                        key={`cell-${i}`}
                                                        fill={entry.color}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Tabel Transaksi ────────────────────────────────────── */}
                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                            <CardDescription>
                                10 transaksi terbaru · {periodLabel}
                                {filters.status !== 'all' &&
                                    ` · ${STATUS_CONFIG[filters.status as OrderStatus]?.label}`}
                            </CardDescription>
                        </div>
                        {/* Link Inertia — tidak reload */}
                        <Link
                            href="/orders"
                            className="flex items-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            Lihat Semua
                        </Link>
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
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="pr-6">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="size-8 opacity-30" />
                                                <span>
                                                    Tidak ada transaksi untuk
                                                    filter ini.
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentTransactions.map((tx) => {
                                        const statusCfg =
                                            STATUS_CONFIG[tx.status];
                                        return (
                                            <TableRow
                                                key={tx.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell className="pl-6 font-mono text-xs font-medium text-primary">
                                                    {tx.id}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {tx.date}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {tx.customer}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                    {tx.product}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {toRupiah(tx.amount)}
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCfg?.className ?? 'bg-neutral-100 text-neutral-500'}`}
                                                    >
                                                        {statusCfg?.label ??
                                                            tx.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

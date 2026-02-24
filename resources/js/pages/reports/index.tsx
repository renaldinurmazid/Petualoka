import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Head } from '@inertiajs/react';
import { 
    Calendar as CalendarIcon, 
    Download, 
    FileText, 
    TrendingUp, 
    Users, 
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

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

// Mock Data for Charts
const salesData = [
    { name: 'Jan', revenue: 4000, orders: 24 },
    { name: 'Feb', revenue: 3000, orders: 18 },
    { name: 'Mar', revenue: 2000, orders: 15 },
    { name: 'Apr', revenue: 2780, orders: 20 },
    { name: 'May', revenue: 1890, orders: 12 },
    { name: 'Jun', revenue: 2390, orders: 16 },
    { name: 'Jul', revenue: 3490, orders: 22 },
];

const topProducts = [
    { name: 'Tenda Dome A1', sales: 120, color: '#3b82f6' },
    { name: 'Carrier 60L', sales: 85, color: '#10b981' },
    { name: 'Sleeping Bag', sales: 70, color: '#f59e0b' },
    { name: 'Matrass Pompa', sales: 50, color: '#ef4444' },
    { name: 'Cooking Set', sales: 45, color: '#8b5cf6' },
];

const recentTransactions = [
    { id: 'ORD-001', date: '2026-02-24', customer: 'Budi Santoso', amount: 1250000, status: 'Completed' },
    { id: 'ORD-002', date: '2026-02-23', customer: 'Siti Aminah', amount: 750000, status: 'Completed' },
    { id: 'ORD-003', date: '2026-02-22', customer: 'Agus Wijaya', amount: 2100000, status: 'Processing' },
    { id: 'ORD-004', date: '2026-02-21', customer: 'Dewi Lestari', amount: 450000, status: 'Completed' },
    { id: 'ORD-005', date: '2026-02-20', customer: 'Eko Prasetyo', amount: 1100000, status: 'Cancelled' },
];

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Analistik" />
            <div className="space-y-8 pb-10">
                {/* Header Container */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan Analistik</h1>
                        <p className="text-muted-foreground">
                            Pantau performa bisnis dan pertumbuhan penjualan Anda.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="size-4" />
                            Export PDF
                        </Button>
                        <Button className="gap-2">
                            <FileText className="size-4" />
                            Laporan Lengkap
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-none bg-muted/30 shadow-none">
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Periode:</span>
                        </div>
                        <Select defaultValue="this-month">
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="yesterday">Kemarin</SelectItem>
                                <SelectItem value="this-month">Bulan Ini</SelectItem>
                                <SelectItem value="last-month">Bulan Lalu</SelectItem>
                                <SelectItem value="this-year">Tahun Ini</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-6 w-px bg-muted mx-2 hidden md:block" />

                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                <SelectItem value="tenda">Tenda</SelectItem>
                                <SelectItem value="tas">Tas / Carrier</SelectItem>
                                <SelectItem value="alat-masak">Alat Masak</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Stat Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm ring-1 ring-muted">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
                            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600 dark:bg-blue-500/20">
                                <DollarSign className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(12850000)}</div>
                            <div className="mt-1 flex items-center text-xs text-green-600">
                                <ArrowUpRight className="mr-1 size-3" />
                                <span>+12.5% dari bulan lalu</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-muted">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Pesanan</CardTitle>
                            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:bg-emerald-500/20">
                                <ShoppingBag className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <div className="mt-1 flex items-center text-xs text-green-600">
                                <ArrowUpRight className="mr-1 size-3" />
                                <span>+8.2% dari bulan lalu</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-muted">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Baru</CardTitle>
                            <div className="rounded-full bg-orange-500/10 p-2 text-orange-600 dark:bg-orange-500/20">
                                <Users className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+48</div>
                            <div className="mt-1 flex items-center text-xs text-red-600">
                                <ArrowDownRight className="mr-1 size-3" />
                                <span>-2.4% dari bulan lalu</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-muted">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
                            <div className="rounded-full bg-purple-500/10 p-2 text-purple-600 dark:bg-purple-500/20">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(82500)}</div>
                            <div className="mt-1 flex items-center text-xs text-green-600">
                                <ArrowUpRight className="mr-1 size-3" />
                                <span>+5.1% dari bulan lalu</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* main Charts Section */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Revenue Area Chart */}
                    <Card className="lg:col-span-4 border-none shadow-sm ring-1 ring-muted">
                        <CardHeader>
                            <CardTitle>Tren Penjualan</CardTitle>
                            <CardDescription>Visualisasi pendapatan dan jumlah pesanan per bulan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={salesData}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
                    <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-muted">
                        <CardHeader>
                            <CardTitle>Produk Terlaris</CardTitle>
                            <CardDescription>Produk dengan volume penjualan tertinggi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={topProducts}
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                                            width={100}
                                        />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={32}>
                                            {topProducts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
                            <CardDescription>Daftar pesanan terakhir yang masuk ke sistem.</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5">
                            Lihat Semua
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">ID Order</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.map((tx) => (
                                    <TableRow key={tx.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="pl-6 font-medium text-primary uppercase">
                                            {tx.id}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {tx.date}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {tx.customer}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                tx.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                tx.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
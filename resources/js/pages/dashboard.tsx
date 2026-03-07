import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BadgeCheck,
    Box,
    Clock,
    MapPin,
    Package,
    ShoppingBag,
    Store,
    Tag,
    TrendingDown,
    TrendingUp,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/' }];

// ── Types ────────────────────────────────────────────────────────────────────
type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'expired';

interface Vendor {
    name: string;
    is_verified: boolean;
    logo: string | null;
    city: string;
    state: string;
    created_at: string;
}

interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
    revenueLabel: string;
    percent: number;
    color: string;
}

interface RecentOrder {
    id: string;
    product: string;
    date: string;
    amount: number;
    amountLabel: string;
    status: OrderStatus;
}

interface Stats {
    revenue: number;
    revenueLabel: string;
    revenueChange: string;
    revenuePositive: boolean;
    totalOrders: number;
    ordersChange: string;
    ordersPositive: boolean;
    totalProducts: number;
    activeVouchers: number;
    pendingOrders: number;
    cancelledOrders: number;
}

interface Props {
    vendor: Vendor;
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
    stats: Stats;
    revenueChart: { month: string; value: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const toRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
    pending: {
        label: 'Menunggu',
        className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    },
    paid: {
        label: 'Dibayar',
        className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    processing: {
        label: 'Diproses',
        className: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
    shipped: {
        label: 'Dikirim',
        className: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
    },
    completed: {
        label: 'Selesai',
        className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    cancelled: {
        label: 'Dibatalkan',
        className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    },
    expired: {
        label: 'Kedaluwarsa',
        className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
    },
};

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    changeLabel: string;
    color: string;
    icon: React.ReactNode;
}

const StatCard = ({ title, value, change, isPositive, changeLabel, color, icon }: StatCardProps) => (
    <div className="flex flex-col justify-between gap-4 rounded-[1.5rem] border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
            <div
                className="flex size-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}18` }}
            >
                <div style={{ color }}>{icon}</div>
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
        </div>

        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>

        <div className="flex items-center gap-2">
            <span
                className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
            >
                {change}
                {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            </span>
            <span className="text-xs text-neutral-400">{changeLabel}</span>
        </div>
    </div>
);

// ── Vendor Info Card ─────────────────────────────────────────────────────────
const VendorInfoCard = ({ vendor }: { vendor: Vendor }) => (
    <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div>
            <h3 className="text-xl font-bold">Info Toko</h3>
            <p className="text-sm text-neutral-400">Status &amp; profil toko</p>
        </div>

        <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex size-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-neutral-100 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.name} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-2xl font-bold text-neutral-400">{vendor.name[0]}</span>
                )}
            </div>
            <h4 className="text-lg font-bold">{vendor.name}</h4>
            <p className="mt-1 flex items-center gap-1 text-sm text-neutral-400">
                <MapPin className="size-3" />
                {vendor.city}, {vendor.state}
            </p>

            <div className="mt-4">
                {vendor.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <BadgeCheck className="size-3.5" /> Terverifikasi
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Clock className="size-3.5" /> Menunggu Verifikasi
                    </span>
                )}
            </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Bergabung</span>
                <span className="font-semibold">{vendor.created_at}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Kota</span>
                <span className="font-semibold">{vendor.city}</span>
            </div>
        </div>
    </div>
);

// ── Revenue Chart ────────────────────────────────────────────────────────────
const RevenueChart = ({ data }: { data: { month: string; value: number }[] }) => {
    const max   = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
    const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    return (
        <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h3 className="text-xl font-bold">Grafik Pendapatan</h3>
                    <p className="text-sm text-neutral-400">Pendapatan per bulan (tahun ini)</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-500 dark:bg-blue-500/10">
                            Rp
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-neutral-400">Total Tahun Ini</p>
                            <h4 className="text-lg font-bold">{toRupiah(total)}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative h-[240px] w-full">
                {/* Grid lines */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[190px] flex-col justify-between">
                    {[4, 3, 2, 1, 0].map((i) => (
                        <div key={i} className="flex w-full items-center gap-3">
                            <span className="w-14 text-right text-[10px] font-bold text-neutral-400">
                                {i === 0 ? '0' : `${Math.round((max * i) / 4 / 1000)}k`}
                            </span>
                            <div className="flex-1 border-t border-dashed border-neutral-100 dark:border-neutral-800" />
                        </div>
                    ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-x-0 top-0 bottom-6 left-16 flex items-end justify-between gap-1">
                    {data.map((item, i) => {
                        const heightPct = (item.value / max) * 100;
                        return (
                            <div key={i} className="group/bar relative flex flex-1 flex-col items-center gap-2">
                                <div className="relative flex w-full items-end" style={{ height: '190px' }}>
                                    <div
                                        className="w-full rounded-t-xl bg-blue-500/70 transition-all duration-500 group-hover/bar:bg-blue-500"
                                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 z-10 hidden w-28 -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-center text-white shadow-2xl group-hover/bar:block">
                                            <span className="text-[10px] font-bold">{toRupiah(item.value)}</span>
                                            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-neutral-700 bg-neutral-900" />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400">{item.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ── Recent Orders ────────────────────────────────────────────────────────────
const RecentOrdersCard = ({ recentOrders }: { recentOrders: RecentOrder[] }) => (
    <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold">Order Terbaru</h3>
                <p className="text-sm text-neutral-400">5 order terakhir</p>
            </div>
            {/* Gunakan Link Inertia — tidak reload halaman */}
            <Link
                href="/orders"
                className="flex items-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                Lihat Semua <ArrowUpRight className="size-3" />
            </Link>
        </div>

        <div className="space-y-3">
            {recentOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">Belum ada order</p>
            ) : (
                recentOrders.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status];
                    return (
                        <div
                            key={order.id}
                            className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                                    <Package className="size-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{order.product}</p>
                                    <p className="text-xs text-neutral-400">
                                        {order.id} · {order.date}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold">{order.amountLabel}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusCfg?.className ?? 'bg-neutral-100 text-neutral-500'}`}>
                                    {statusCfg?.label ?? order.status}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

// ── Top Products ─────────────────────────────────────────────────────────────
const TopProductsCard = ({ topProducts }: { topProducts: TopProduct[] }) => (
    <div className="rounded-[1.5rem] border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold">Produk Terlaris</h3>
                <p className="text-sm text-neutral-400">Berdasarkan jumlah terjual</p>
            </div>
            {/* Link Inertia — tidak reload halaman */}
            <Link
                href="/products"
                className="flex items-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                Semua Produk <ArrowUpRight className="size-3" />
            </Link>
        </div>

        <div className="space-y-5">
            {topProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-400">Belum ada produk terjual</p>
            ) : (
                topProducts.map((product, i) => (
                    <div key={product.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex size-6 items-center justify-center text-xs font-black text-neutral-400">
                                    #{i + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{product.name}</p>
                                    <p className="text-xs text-neutral-400">{product.sold} terjual</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold">{product.revenueLabel}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${product.percent}%`, backgroundColor: product.color }}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

// ── Quick Stats ───────────────────────────────────────────────────────────────
const QuickStatBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
        <span className="text-sm text-neutral-500">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ vendor, topProducts, recentOrders, stats, revenueChart }: Props) {
    const statCards: StatCardProps[] = useMemo(() => [
        {
            title: 'Total Pendapatan',
            value: stats.revenueLabel,
            change: stats.revenueChange,
            isPositive: stats.revenuePositive,
            changeLabel: 'vs bulan lalu',
            color: '#3b82f6',
            icon: <Wallet className="size-4" />,
        },
        {
            title: 'Total Order',
            value: stats.totalOrders,
            change: stats.ordersChange,
            isPositive: stats.ordersPositive,
            changeLabel: 'vs bulan lalu',
            color: '#f59e0b',
            icon: <ShoppingBag className="size-4" />,
        },
        {
            title: 'Total Produk',
            value: stats.totalProducts,
            change: `${stats.totalProducts} produk`,
            isPositive: stats.totalProducts > 0,
            changeLabel: 'aktif di toko',
            color: '#22c55e',
            icon: <Box className="size-4" />,
        },
        {
            title: 'Voucher Aktif',
            value: stats.activeVouchers,
            change: `${stats.activeVouchers} voucher`,
            isPositive: stats.activeVouchers > 0,
            changeLabel: 'sedang berjalan',
            color: '#a855f7',
            icon: <Tag className="size-4" />,
        },
        {
            title: 'Order Pending',
            value: stats.pendingOrders,
            change: stats.pendingOrders === 0 ? 'Semua clear' : `${stats.pendingOrders} menunggu`,
            isPositive: stats.pendingOrders === 0,
            changeLabel: 'perlu diproses',
            color: '#06b6d4',
            icon: <Clock className="size-4" />,
        },
        {
            title: 'Dibatalkan',
            value: stats.cancelledOrders,
            change: stats.cancelledOrders === 0 ? 'Tidak ada' : `${stats.cancelledOrders} batal`,
            isPositive: stats.cancelledOrders === 0,
            changeLabel: 'bulan ini',
            color: '#f97316',
            icon: <XCircle className="size-4" />,
        },
    ], [stats]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                        <Store className="size-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Selamat datang kembali, <span className="font-semibold">{vendor.name}</span> 👋
                        </p>
                    </div>
                </div>

                {/* Stat Cards + Vendor Info */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
                        {statCards.map((card) => (
                            <StatCard key={card.title} {...card} />
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <VendorInfoCard vendor={vendor} />
                    </div>
                </div>

                {/* Revenue Chart */}
                <RevenueChart data={revenueChart} />

                {/* Recent Orders + Top Products */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <RecentOrdersCard recentOrders={recentOrders} />
                    <TopProductsCard topProducts={topProducts} />
                </div>
            </div>
        </AppLayout>
    );
}
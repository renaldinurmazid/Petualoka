import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
import {
    destroy as destroyOrder,
    edit as editOrder,
    index as indexOrder,
    show as showOrder,
} from '@/routes/orders';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Search, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Order',
        href: '/orders',
    },
];

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: string;
    order_number: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    grand_total: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'expired';
    created_at: string;
    items: OrderItem[];
}

interface OrderResponse {
    data: Order[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Selesai
                </span>
            );
        case 'paid':
        case 'processing':
        case 'shipped':
            return (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {status === 'paid' ? 'Dibayar' : status === 'processing' ? 'Diproses' : 'Dikirim'}
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Menunggu
                </span>
            );
        case 'cancelled':
        case 'expired':
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {status === 'cancelled' ? 'Dibatalkan' : 'Kedaluwarsa'}
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {status}
                </span>
            );
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function OrderIndex({
    orders,
    filters = {},
}: {
    orders: OrderResponse;
    filters: { search?: string; per_page?: string | number };
}) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    indexOrder().url,
                    { search, per_page: filters.per_page },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id: string) => {
        router.delete(destroyOrder({ order: id }).url, {
            onSuccess: () => {
                toast.success('Order berhasil dihapus');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Order</h1>
                        <p className="text-muted-foreground">
                            Kelola dan pantau pesanan dari pelanggan Anda.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari order number atau customer..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Tampilkan:</span>
                        <Select
                            value={filters.per_page?.toString() || "10"}
                            onValueChange={(value) =>
                                router.get(
                                    indexOrder().url,
                                    { per_page: value, search: filters.search },
                                    { preserveState: true }
                                )
                            }
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">Order Number</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            Tidak ada pesanan ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="pl-6 font-medium text-primary">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {order.user.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {order.user.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {formatCurrency(Number(order.grand_total))}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() =>
                                                            router.get(showOrder({ order: order.id }).url)
                                                        }
                                                        title="Detail Pesanan"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() =>
                                                            router.get(editOrder({ order: order.id }).url)
                                                        }
                                                        title="Edit Pesanan"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() => handleDelete(order.id)}
                                                        title="Hapus Order?"
                                                        description={`Anda yakin ingin menghapus order "${order.order_number}"? Tindakan ini tidak dapat dibatalkan.`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            title="Hapus Pesanan"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </DeleteConfirmation>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {orders.from} to {orders.to} of {orders.total} orders
                        </p>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                {orders.links.map((link, i) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');
                                    const isEllipsis = link.label === '...';
                                    
                                    return (
                                        <PaginationItem key={i}>
                                            {isPrevious ? (
                                                <PaginationPrevious 
                                                    href={link.url || '#'} 
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                    title=""
                                                />
                                            ) : isNext ? (
                                                <PaginationNext 
                                                    href={link.url || '#'} 
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                    title=""
                                                />
                                            ) : isEllipsis ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink 
                                                    href={link.url || '#'} 
                                                    isActive={link.active}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

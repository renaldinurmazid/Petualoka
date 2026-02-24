import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@/routes/order';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react'; // Import router and usePage
import { Eye, Pencil, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

// ... (rest of imports)

// ... (inside component)

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Order',
        href: '/order',
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
    status: 'pending' | 'paid' | 'completed' | 'cancelled' | string;
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
    last_page: number;
    per_page: number;
    total: number;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'completed':
            return 'default';
        case 'paid':
        case 'processing':
        case 'shipped':
            return 'secondary';
        case 'pending':
            return 'outline';
        case 'cancelled':
        case 'expired':
            return 'destructive';
        default:
            return 'outline';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function Order({
    orders,
    filters,
}: {
    orders: OrderResponse;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    indexOrder().url,
                    { search },
                    {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(destroyOrder({ order: id }).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Order</h1>
                        <p className="text-muted-foreground">
                            Manage and view your orders.
                        </p>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Cari order number atau nama customer..."
                            className="w-full max-w-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.order_number}
                                        </TableCell>
                                        <TableCell>
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
                                        <TableCell>
                                            {formatCurrency(
                                                Number(order.grand_total),
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className="capitalize"
                                                variant={getStatusBadgeVariant(
                                                    order.status,
                                                )}
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer bg-blue-500 hover:bg-blue-600"
                                                onClick={() =>
                                                    router.visit(
                                                        showOrder({
                                                            order: order.id,
                                                        }).url,
                                                    )
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer bg-yellow-500 hover:bg-yellow-600"
                                                onClick={() =>
                                                    router.visit(
                                                        editOrder({
                                                            order: order.id,
                                                        }).url,
                                                    )
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer bg-red-500 hover:bg-red-600"
                                                onClick={() =>
                                                    handleDelete(order.id)
                                                }
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {orders.last_page > 1 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            {orders.links.map((link, i) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationPrevious
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url)
                                                        router.visit(link.url, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                }}
                                                className={
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : 'cursor-pointer'
                                                }
                                            />
                                        </PaginationItem>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationNext
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (link.url)
                                                        router.visit(link.url, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                }}
                                                className={
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : 'cursor-pointer'
                                                }
                                            />
                                        </PaginationItem>
                                    );
                                }
                                if (link.label === '...') {
                                    return (
                                        <PaginationItem key={i}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href={link.url || '#'}
                                            isActive={link.active}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (link.url)
                                                    router.visit(link.url, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </AppLayout>
    );
}

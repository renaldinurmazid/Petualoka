import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as indexOrder } from '@/routes/order';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    XCircle,
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
}

interface OrderItem {
    id: string;
    product_name: string;
    variant_name?: string;
    quantity: number;
    price: string | number;
    subtotal: string | number;
    rental_start_date?: string;
    rental_end_date?: string;
    product?: Product;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: string | number;
    service_fee: string | number;
    discount_amount: string | number;
    grand_total: string | number;
    status:
        | 'pending'
        | 'paid'
        | 'processing'
        | 'shipped'
        | 'completed'
        | 'cancelled'
        | 'expired';
    notes?: string;
    delivery_methode?: string;
    payment_status?: string;
    payment_info?: any;
    paid_at?: string;
    completed_at?: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    payment_methode?: {
        name: string;
    };
    voucher?: {
        code: string;
        discount_amount: number;
    };
    items: OrderItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Order',
        href: '/order',
    },
    {
        title: 'Detail Order',
        href: '#',
    },
];

const ORDER_STATUS_STEPS = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'paid', label: 'Paid', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function OrderShow({ order }: { order: Order }) {
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const formatDate = (
        dateString: string | null | undefined,
        includeTime = true,
    ) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
        });
    };

    const currentStatusIndex = ORDER_STATUS_STEPS.findIndex(
        (step) => step.key === order.status,
    );
    const isTerminalStatus = ['cancelled', 'expired'].includes(order.status);

    const handleUpdateStatus = (newStatus: string) => {
        if (confirm(`Change status to ${newStatus}?`)) {
            router.patch(`/order/${order.id}/status`, { status: newStatus });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => router.visit(indexOrder().url)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Detail Order</h1>
                            <p className="text-sm text-muted-foreground">
                                {order.order_number} •{' '}
                                {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Stepper */}
                {!isTerminalStatus ? (
                    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-muted">
                        <CardContent className="p-6">
                            <div className="relative flex justify-between">
                                {ORDER_STATUS_STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted =
                                        index <= currentStatusIndex;
                                    const isActive =
                                        index === currentStatusIndex;

                                    return (
                                        <div
                                            key={step.key}
                                            className="relative z-10 flex flex-1 flex-col items-center"
                                        >
                                            {/* Line */}
                                            {index !== 0 && (
                                                <div
                                                    className={`absolute top-13 -left-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-500 ${
                                                        index <=
                                                        currentStatusIndex
                                                            ? 'bg-primary'
                                                            : 'bg-muted'
                                                    }`}
                                                />
                                            )}

                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                                    isCompleted
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted bg-background text-muted-foreground shadow-sm'
                                                } ${isActive ? 'scale-110 ring-4 ring-primary/20' : ''}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span
                                                className={`mt-5 text-xs font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t pt-6">
                                {order.status === 'pending' && (
                                    <Button
                                        onClick={() =>
                                            handleUpdateStatus('paid')
                                        }
                                    >
                                        Mark as Paid
                                    </Button>
                                )}
                                {order.status === 'paid' && (
                                    <Button
                                        onClick={() =>
                                            handleUpdateStatus('processing')
                                        }
                                    >
                                        Process Order
                                    </Button>
                                )}
                                {order.status === 'processing' && (
                                    <Button
                                        onClick={() =>
                                            handleUpdateStatus('shipped')
                                        }
                                    >
                                        Ship Order
                                    </Button>
                                )}
                                {order.status === 'shipped' && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() =>
                                            handleUpdateStatus('completed')
                                        }
                                    >
                                        Complete Order
                                    </Button>
                                )}

                                {order.status !== 'completed' &&
                                    !isTerminalStatus && (
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                handleUpdateStatus('cancelled')
                                            }
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-destructive/30 bg-destructive/5 shadow-none">
                        <CardContent className="flex items-center gap-4 p-6 text-destructive">
                            <XCircle className="h-10 w-10" />
                            <div>
                                <h3 className="text-lg font-bold tracking-wider uppercase">
                                    Order {order.status}
                                </h3>
                                <p className="text-sm opacity-90">
                                    This order has been {order.status}. No
                                    further actions can be taken.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Items & Summary */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="overflow-hidden border-none shadow-sm ring-1 ring-muted">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-lg">
                                    Ordered Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">
                                                Product
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Rental Period
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Qty
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Price
                                            </TableHead>
                                            <TableHead className="pr-6 text-right">
                                                Subtotal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="pl-6">
                                                    <div className="font-semibold text-primary">
                                                        {item.product_name}
                                                    </div>
                                                    {item.variant_name && (
                                                        <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                                                            Variant:{' '}
                                                            {item.variant_name}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.rental_start_date ? (
                                                        <div className="text-xs">
                                                            <div>
                                                                {formatDate(
                                                                    item.rental_start_date,
                                                                    false,
                                                                )}
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                to
                                                            </div>
                                                            <div>
                                                                {formatDate(
                                                                    item.rental_end_date,
                                                                    false,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {item.quantity}x
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.price)}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right font-bold">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="space-y-2.5 bg-muted/10 p-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Service Fee
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(order.service_fee)}
                                        </span>
                                    </div>
                                    {Number(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-muted-foreground">
                                                    Discount
                                                </span>
                                                {order.voucher && (
                                                    <Badge
                                                        variant="outline"
                                                        className="py-0 text-[10px] leading-tight"
                                                    >
                                                        {order.voucher.code}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="font-medium text-destructive">
                                                -
                                                {formatCurrency(
                                                    order.discount_amount,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-xl font-black">
                                        <span>Grand Total</span>
                                        <span className="text-primary">
                                            {formatCurrency(order.grand_total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {order.notes && (
                            <Card className="border-none shadow-sm ring-1 ring-muted">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Order Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="rounded-r border-l-4 border-primary bg-muted/30 py-1.5 pl-4 text-sm italic">
                                        "{order.notes}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Customer & Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm ring-1 ring-muted">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Customer Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                        {order.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">
                                            {order.user.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.user.email}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm ring-1 ring-muted">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Logistics & Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <section>
                                    <div className="mb-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Delivery Method
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span className="capitalize">
                                            {order.delivery_methode ||
                                                'Pickup / Store Visit'}
                                        </span>
                                    </div>
                                </section>

                                <Separator />

                                <section>
                                    <div className="mb-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Payment Method
                                    </div>
                                    <div className="mb-1 text-sm font-semibold">
                                        {order.payment_methode?.name ||
                                            'Manual / Cash'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                order.status === 'completed' ||
                                                order.status === 'paid'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="h-5 px-2 py-0 capitalize"
                                        >
                                            {order.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground italic">
                                            {order.paid_at
                                                ? `Paid on ${formatDate(order.paid_at)}`
                                                : 'Awaiting payment'}
                                        </span>
                                    </div>
                                </section>

                                {order.payment_info && (
                                    <div className="mt-4 rounded-lg border border-muted bg-muted/40 p-3 text-[11px] leading-relaxed">
                                        <div className="mb-1 font-bold underline">
                                            Payment Info:
                                        </div>
                                        <pre className="font-sans text-xs whitespace-pre-wrap">
                                            {typeof order.payment_info ===
                                            'string'
                                                ? order.payment_info
                                                : JSON.stringify(
                                                      order.payment_info,
                                                      null,
                                                      2,
                                                  )}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-primary/5 shadow-sm ring-1 ring-muted">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">
                                    Summary Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        Ordered
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(order.created_at)}
                                    </span>
                                </div>
                                {order.paid_at && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            Paid
                                        </span>
                                        <span className="font-medium">
                                            {formatDate(order.paid_at)}
                                        </span>
                                    </div>
                                )}
                                {order.completed_at && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            Completed
                                        </span>
                                        <span className="font-medium">
                                            {formatDate(order.completed_at)}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

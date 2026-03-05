import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { index as indexOrder } from '@/routes/orders';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Mail,
    Package,
    Truck,
    User,
    XCircle,
    Calendar,
    Printer,
    MapPin,
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
        href: '/orders',
    },
    {
        title: 'Detail Order',
        href: '#',
    },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending: { label: 'Menunggu Pembayaran', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    paid: { label: 'Dibayar', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
    processing: { label: 'Diproses', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    shipped: { label: 'Dikirim', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
    completed: { label: 'Selesai', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    cancelled: { label: 'Dibatalkan', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    expired: { label: 'Kadaluarsa', icon: XCircle, color: 'text-neutral-600', bg: 'bg-neutral-100' },
};

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
    const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    const handleUpdateStatus = (newStatus: string) => {
        if (confirm(`Ubah status ke ${newStatus}?`)) {
            router.patch(`/order/${order.id}/status`, { status: newStatus });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{order.order_number}</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Dipesan pada {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="h-9">
                            <Printer className="mr-2 h-4 w-4" /> Cetak Invoice
                        </Button>
                        
                        {/* Admin Action Group */}
                        <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('paid')} className="bg-blue-600 hover:bg-blue-700">
                                    Konfirmasi Bayar
                                </Button>
                            )}
                            {order.status === 'paid' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('processing')} className="bg-indigo-600 hover:bg-indigo-700">
                                    Proses Order
                                </Button>
                            )}
                            {order.status === 'processing' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('shipped')} className="bg-purple-600 hover:bg-purple-700">
                                    Kirim Produk
                                </Button>
                            )}
                            {order.status === 'shipped' && (
                                <Button size="sm" onClick={() => handleUpdateStatus('completed')} className="bg-green-600 hover:bg-green-700">
                                    Selesaikan
                                </Button>
                            )}
                            
                            {!['completed', 'cancelled', 'expired'].includes(order.status) && (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus('cancelled')} className="text-destructive hover:bg-destructive/10">
                                    Batalkan
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Tracker (Minimalist) */}
                {!isTerminalStatus && (
                    <div className="hidden lg:block py-4">
                        <div className="relative flex w-full justify-between items-start">
                            {ORDER_STATUS_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isDone = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;

                                return (
                                    <div key={step.key} className="flex-1 group">
                                        <div className="relative flex flex-col items-center">
                                            {/* Connecting Line */}
                                            {index > 0 && (
                                                <div className={`absolute top-4 right-1/2 w-full h-[2px] transition-colors -translate-y-1/2 ${isDone ? 'bg-primary' : 'bg-muted'}`} />
                                            )}
                                            
                                            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                                isDone ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'
                                            } ${isCurrent ? 'ring-4 ring-primary/10 shadow-lg scale-110' : ''}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="mt-3 flex flex-col items-center">
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isDone ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Items & Billing */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card className="border-none shadow-sm ring-1 ring-muted overflow-hidden">
                            <div className="px-6 py-4 bg-muted/20 border-b flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" />
                                    Produk Terpesan
                                </h3>
                                <Badge variant="outline" className="text-xs font-normal">
                                    {order.items.length} Item
                                </Badge>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5">
                                        <TableHead className="pl-6 text-[11px] font-bold uppercase text-muted-foreground">Informasi Produk</TableHead>
                                        <TableHead className="text-center text-[11px] font-bold uppercase text-muted-foreground">Sewa</TableHead>
                                        <TableHead className="text-right text-[11px] font-bold uppercase text-muted-foreground">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-neutral-900 leading-tight mb-1">{item.product_name}</p>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                                        {item.variant_name && (
                                                            <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded capitalize">
                                                                Varian: {item.variant_name}
                                                            </span>
                                                        )}
                                                        <span className="text-muted-foreground">
                                                            {formatCurrency(item.price)} x {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                {item.rental_start_date ? (
                                                    <div className="inline-flex flex-col items-center px-3 py-1 bg-muted/30 rounded-lg border border-muted/50">
                                                        <span className="text-[10px] font-medium text-muted-foreground leading-none mb-1">DURASI SEWA</span>
                                                        <div className="text-[11px] font-bold text-neutral-800 whitespace-nowrap">
                                                            {formatDate(item.rental_start_date, false)}
                                                            <span className="mx-1.5 opacity-50">→</span>
                                                            {formatDate(item.rental_end_date, false)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right py-4 font-bold text-neutral-900 whitespace-nowrap">
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {/* Summary Section */}
                            <div className="border-t bg-muted/5 p-6">
                                <div className="ml-auto w-full md:w-80 space-y-3">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-neutral-900">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Biaya Layanan</span>
                                        <span className="font-medium text-neutral-900">{formatCurrency(order.service_fee)}</span>
                                    </div>
                                    {Number(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-destructive font-medium">Diskon</span>
                                                {order.voucher && (
                                                    <Badge variant="outline" className="py-0 text-[10px] bg-red-50 text-red-600 border-red-200 uppercase">
                                                        {order.voucher.code}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="font-bold text-destructive">
                                                -{formatCurrency(order.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <Separator className="my-3" />
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-base font-bold text-neutral-900">Total Pembayaran</span>
                                        <span className="text-2xl font-black text-primary tracking-tight">
                                            {formatCurrency(order.grand_total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Order Notes */}
                        {order.notes && (
                            <Card className="border-none shadow-sm ring-1 ring-muted bg-amber-50/30">
                                <CardContent className="p-4 flex gap-3">
                                    <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Catatan Pesanan</h4>
                                        <p className="text-sm text-neutral-700 leading-relaxed italic">"{order.notes}"</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Customer & Info */}
                    <div className="space-y-6">
                        {/* Customer Detail */}
                        <Card className="border-none shadow-sm ring-1 ring-muted">
                            <div className="px-5 py-4 bg-muted/20 border-b">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Detail Pelanggan
                                </h3>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                                        {order.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900">{order.user.name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                            <Mail className="h-3 w-3" />
                                            {order.user.email}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logistics & Payment */}
                        <Card className="border-none shadow-sm ring-1 ring-muted">
                            <div className="px-5 py-4 bg-muted/20 border-b">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-neutral-800">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Logistik & Pembayaran
                                </h3>
                            </div>
                            <CardContent className="p-5 space-y-5">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" /> Metode Pengiriman
                                    </p>
                                    <p className="text-sm font-medium text-neutral-800 capitalize pl-4.5 border-l-2 border-primary/30 ml-1.5">
                                        {order.delivery_methode || 'Ambil di Toko / Visit'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <CreditCard className="h-3 w-3" /> Metode Pembayaran
                                    </p>
                                    <div className="pl-4.5 border-l-2 border-primary/30 ml-1.5">
                                        <p className="text-sm font-bold text-neutral-900">
                                            {order.payment_methode?.name || 'Manual / Cash'}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge variant="outline" className={`h-5 text-[10px] px-1.5 border-none ${order.paid_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.paid_at ? 'Sudah Dibayar' : 'Menunggu'}
                                            </Badge>
                                            {order.paid_at && (
                                                <span className="text-[10px] text-muted-foreground italic">
                                                    {formatDate(order.paid_at)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* {order.payment_info && (
                                    <div className="mt-2 rounded-lg bg-neutral-50 p-3 border border-dashed border-muted text-[11px] leading-relaxed">
                                        <p className="font-bold text-neutral-700 mb-1 border-b pb-1">Info Internal Pembayaran:</p>
                                        <pre className="font-mono text-[10px] text-muted-foreground overflow-x-auto py-1">
                                            {typeof order.payment_info === 'string'
                                                ? order.payment_info
                                                : JSON.stringify(order.payment_info, null, 2)}
                                        </pre>
                                    </div>
                                )} */}
                            </CardContent>
                        </Card>

                        {/* History Timeline Minimalist */}
                        <Card className="border-none shadow-sm ring-1 ring-muted bg-muted/5">
                            <div className="p-5 space-y-4">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Riwayat Transaksi</h4>
                                
                                <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-1 before:w-0.5 before:bg-muted/50">
                                    <div className="relative pl-6 flex justify-between items-start text-xs">
                                        <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" />
                                        <span className="text-muted-foreground">Order Dibuat</span>
                                        <span className="font-bold">{formatDate(order.created_at)}</span>
                                    </div>
                                    
                                    {order.paid_at && (
                                        <div className="relative pl-6 flex justify-between items-start text-xs">
                                            <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                                            <span className="text-muted-foreground">Pembayaran Diterima</span>
                                            <span className="font-bold">{formatDate(order.paid_at)}</span>
                                        </div>
                                    )}
                                    
                                    {order.completed_at && (
                                        <div className="relative pl-6 flex justify-between items-start text-xs">
                                            <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-white" />
                                            <span className="text-muted-foreground">Selesai</span>
                                            <span className="font-bold">{formatDate(order.completed_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { background: white !important; }
                    .mx-auto { max-width: 100% !important; margin: 0 !important; }
                }
            ` }} />
        </AppLayout>
    );
}

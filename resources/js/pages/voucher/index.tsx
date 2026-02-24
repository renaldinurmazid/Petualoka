import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { formatCurrency, formatNumber, parseNumber } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmation } from '@/components/delete-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Voucher',
        href: '/vouchers',
    },
];

interface Voucher {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: 'fixed' | 'percentage';
    value: number;
    min_purchase_amount: number;
    max_discount_amount: number | null;
    quota: number | null;
    used_count: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
}

interface Props {
    vouchers: {
        data: Voucher[];
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
    };
    filters: {
        search?: string;
        per_page?: string;
    };
}

export default function VoucherIndex({ vouchers, filters = {} }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    '/vouchers',
                    { search, per_page: filters.per_page },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, setData, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
        type: 'fixed' as 'fixed' | 'percentage',
        value: 0,
        min_purchase_amount: 0,
        max_discount_amount: null as number | null,
        quota: null as number | null,
        start_date: '',
        end_date: '',
        is_active: true,
    });

    const onCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/vouchers', data, {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Voucher berhasil dibuat');
            },
        });
    };

    const onEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVoucher) return;
        router.put(`/vouchers/${editingVoucher.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingVoucher(null);
                reset();
                toast.success('Voucher berhasil diperbarui');
            },
        });
    };

    const onDelete = (id: string) => {
        router.delete(`/vouchers/${id}`, {
            onSuccess: () => {
                toast.success('Voucher berhasil dihapus');
            },
        });
    };

    const openEdit = (voucher: Voucher) => {
        setEditingVoucher(voucher);
        setData({
            code: voucher.code,
            name: voucher.name,
            description: voucher.description || '',
            type: voucher.type,
            value: voucher.value,
            min_purchase_amount: voucher.min_purchase_amount,
            max_discount_amount: voucher.max_discount_amount,
            quota: voucher.quota,
            start_date: voucher.start_date
                ? voucher.start_date.split(' ')[0]
                : '',
            end_date: voucher.end_date ? voucher.end_date.split(' ')[0] : '',
            is_active: voucher.is_active,
        });
        setIsEditOpen(true);
    };

    const formatPrice = (price: number) => {
        return formatCurrency(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Voucher</h1>
                        <p className="text-muted-foreground">
                            Kelola voucher promo untuk pelanggan Anda.
                        </p>
                    </div>
                    <Dialog
                        open={isCreateOpen}
                        onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) reset();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                Buat Voucher
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <form onSubmit={onCreateSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Buat Voucher Baru</DialogTitle>
                                    <DialogDescription>
                                        Isi detail voucher di bawah ini. Kode
                                        voucher akan otomatis dikonversi menjadi
                                        huruf kapital.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-[70vh] overflow-y-auto px-1">
                                    {(errors as any).general && (
                                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                                            {(errors as any).general}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Kode Voucher</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData('code', e.target.value)
                                                }
                                                placeholder="CONTOH: HEMAT50"
                                                required
                                            />
                                            {errors.code && (
                                                <p className="text-xs text-destructive">
                                                    {errors.code}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Voucher</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData('name', e.target.value)
                                                }
                                                placeholder="Promo Akhir Tahun"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Tipe Potongan</Label>
                                            <Select
                                                value={data.type}
                                                onValueChange={(
                                                    value: 'fixed' | 'percentage',
                                                ) => setData('type', value)}
                                            >
                                                <SelectTrigger id="type">
                                                    <SelectValue placeholder="Pilih tipe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fixed">
                                                        Nominal Tetap (Rp)
                                                    </SelectItem>
                                                    <SelectItem value="percentage">
                                                        Persentase (%)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="value">Nilai Potongan</Label>
                                            <Input
                                                id="value"
                                                type={data.type === 'fixed' ? 'text' : 'number'}
                                                value={data.type === 'fixed' ? formatNumber(data.value) : data.value}
                                                onChange={(e) =>
                                                    setData(
                                                        'value',
                                                        data.type === 'fixed' 
                                                            ? Number(parseNumber(e.target.value))
                                                            : Number(e.target.value),
                                                    )
                                                }
                                                required
                                            />
                                            {errors.value && (
                                                <p className="text-xs text-destructive">
                                                    {errors.value}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="min_purchase_amount">Minimal Pembelian (Rp)</Label>
                                            <Input
                                                id="min_purchase_amount"
                                                type="text"
                                                value={formatNumber(data.min_purchase_amount)}
                                                onChange={(e) =>
                                                    setData(
                                                        'min_purchase_amount',
                                                        Number(parseNumber(e.target.value)),
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max_discount_amount">Maksimal Potongan (Rp)</Label>
                                            <Input
                                                id="max_discount_amount"
                                                type="text"
                                                value={
                                                    data.max_discount_amount !== null 
                                                        ? formatNumber(data.max_discount_amount)
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'max_discount_amount',
                                                        e.target.value
                                                            ? Number(parseNumber(e.target.value))
                                                            : null,
                                                    )
                                                }
                                                placeholder="Opsional"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quota">Kuota Penggunaan</Label>
                                            <Input
                                                id="quota"
                                                type="number"
                                                value={data.quota || ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'quota',
                                                        e.target.value
                                                            ? Number(e.target.value)
                                                            : null,
                                                    )
                                                }
                                                placeholder="Tanpa batas"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="is_active">Status</Label>
                                            <Select
                                                value={data.is_active ? '1' : '0'}
                                                onValueChange={(v) =>
                                                    setData('is_active', v === '1')
                                                }
                                            >
                                                <SelectTrigger id="is_active">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Aktif</SelectItem>
                                                    <SelectItem value="0">Non-Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Tanggal Mulai</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) =>
                                                    setData('start_date', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">Tanggal Berakhir</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) =>
                                                    setData('end_date', e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="description">Deskripsi</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData('description', e.target.value)
                                                }
                                                placeholder="Berikan keterangan voucher ini..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="mt-4 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Simpan Voucher
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau nama..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Tampilkan:</span>
                        <Select
                            value={filters.per_page || "10"}
                            onValueChange={(value) =>
                                router.get(
                                    '/vouchers',
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
                                    <TableHead className="pl-6">Voucher</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Nilai</TableHead>
                                    <TableHead>Min. Order</TableHead>
                                    <TableHead>Kuota</TableHead>
                                    <TableHead>Masa Berlaku</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vouchers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            Belum ada voucher yang dibuat.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vouchers.data.map((voucher) => (
                                        <TableRow key={voucher.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-primary">
                                                        {voucher.code}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                                        {voucher.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {voucher.type === 'fixed'
                                                        ? 'Nominal'
                                                        : 'Persentase'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">
                                                {voucher.type === 'fixed'
                                                    ? formatPrice(voucher.value)
                                                    : `${voucher.value}%`}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatPrice(
                                                    voucher.min_purchase_amount,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {voucher.quota ? (
                                                    <div className="flex w-24 flex-col gap-1.5">
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
                                                            <div
                                                                className="h-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${Math.min((voucher.used_count / voucher.quota) * 100, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {voucher.used_count} /{' '}
                                                            {voucher.quota} terpakai
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">∞</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs font-medium">
                                                    <span>{voucher.start_date || '-'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal">
                                                        s/d {voucher.end_date || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {voucher.is_active ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                                        Non-Aktif
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() => openEdit(voucher)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() => onDelete(voucher.id)}
                                                        title="Hapus Voucher?"
                                                        description={`Anda yakin ingin menghapus voucher "${voucher.code}"? Tindakan ini tidak dapat dibatalkan.`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

                {vouchers.last_page > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {vouchers.from} to {vouchers.to} of {vouchers.total} vouchers
                        </p>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                {vouchers.links.map((link, i) => {
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

            {/* Edit Voucher Dialog */}
            <Dialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) {
                        setEditingVoucher(null);
                        reset();
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <form onSubmit={onEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Voucher</DialogTitle>
                            <DialogDescription>
                                Perbarui detail voucher Anda.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto px-1">
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-code">Kode Voucher</Label>
                                    <Input
                                        id="edit-code"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-xs text-destructive">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nama Voucher</Label>
                                    <Input
                                        id="edit-name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-type">Tipe Potongan</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(
                                            value: 'fixed' | 'percentage',
                                        ) => setData('type', value)}
                                    >
                                        <SelectTrigger id="edit-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">
                                                Nominal Tetap (Rp)
                                            </SelectItem>
                                            <SelectItem value="percentage">
                                                Persentase (%)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-value">Nilai Potongan</Label>
                                    <Input
                                        id="edit-value"
                                        type={data.type === 'fixed' ? 'text' : 'number'}
                                        value={
                                            data.type === 'fixed'
                                                ? formatNumber(data.value)
                                                : data.value
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'value',
                                                data.type === 'fixed'
                                                    ? Number(parseNumber(e.target.value))
                                                    : Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                    {errors.value && (
                                        <p className="text-xs text-destructive">
                                            {errors.value}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-min_purchase_amount">Minimal Pembelian (Rp)</Label>
                                    <Input
                                        id="edit-min_purchase_amount"
                                        type="text"
                                        value={formatNumber(data.min_purchase_amount)}
                                        onChange={(e) =>
                                            setData(
                                                'min_purchase_amount',
                                                Number(parseNumber(e.target.value)),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-max_discount_amount">Maksimal Potongan (Rp)</Label>
                                    <Input
                                        id="edit-max_discount_amount"
                                        type="text"
                                        value={
                                            data.max_discount_amount !== null 
                                                ? formatNumber(data.max_discount_amount)
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'max_discount_amount',
                                                e.target.value
                                                    ? Number(parseNumber(e.target.value))
                                                    : null,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-quota">Kuota Penggunaan</Label>
                                    <Input
                                        id="edit-quota"
                                        type="number"
                                        value={data.quota || ''}
                                        onChange={(e) =>
                                            setData(
                                                'quota',
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-is_active">Status</Label>
                                    <Select
                                        value={data.is_active ? '1' : '0'}
                                        onValueChange={(v) =>
                                            setData('is_active', v === '1')
                                        }
                                    >
                                        <SelectTrigger id="edit-is_active">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Aktif</SelectItem>
                                            <SelectItem value="0">Non-Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-start_date">Tanggal Mulai</Label>
                                    <Input
                                        id="edit-start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData('start_date', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-end_date">Tanggal Berakhir</Label>
                                    <Input
                                        id="edit-end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="edit-description">Deskripsi</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

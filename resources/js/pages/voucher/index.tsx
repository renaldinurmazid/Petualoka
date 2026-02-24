import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Voucher',
        href: '/voucher',
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

export default function Voucher() {
    const { vouchers } = usePage<{ vouchers: Voucher[] }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

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
        router.post('/voucher', data, {
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
        router.put(`/voucher/${editingVoucher.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingVoucher(null);
                reset();
                toast.success('Voucher berhasil diperbarui');
            },
        });
    };

    const onDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
            router.delete(`/voucher/${id}`, {
                onSuccess: () => {
                    toast.success('Voucher berhasil dihapus');
                },
            });
        }
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
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Voucher</h1>
                        <p className="text-muted-foreground">
                            Kelola voucher promo untuk pelanggan Anda
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
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Voucher
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
                                {(errors as any).general && (
                                    <div className="mb-4 rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                                        {(errors as any).general}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Kode Voucher
                                        </Label>
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
                                        <Label htmlFor="name">
                                            Nama Voucher
                                        </Label>
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
                                        <Label htmlFor="type">
                                            Tipe Potongan
                                        </Label>
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
                                        <Label htmlFor="value">
                                            Nilai Potongan
                                        </Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            value={data.value}
                                            onChange={(e) =>
                                                setData(
                                                    'value',
                                                    Number(e.target.value),
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
                                        <Label htmlFor="min_purchase_amount">
                                            Minimal Pembelian (Rp)
                                        </Label>
                                        <Input
                                            id="min_purchase_amount"
                                            type="number"
                                            value={data.min_purchase_amount}
                                            onChange={(e) =>
                                                setData(
                                                    'min_purchase_amount',
                                                    Number(e.target.value),
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_discount_amount">
                                            Maksimal Potongan (Rp)
                                        </Label>
                                        <Input
                                            id="max_discount_amount"
                                            type="number"
                                            value={
                                                data.max_discount_amount || ''
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'max_discount_amount',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                            placeholder="Opsional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quota">
                                            Kuota Penggunaan
                                        </Label>
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
                                        <Label htmlFor="is_active">
                                            Status
                                        </Label>
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
                                                <SelectItem value="1">
                                                    Aktif
                                                </SelectItem>
                                                <SelectItem value="0">
                                                    Non-Aktif
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">
                                            Tanggal Mulai
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) =>
                                                setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">
                                            Tanggal Berakhir
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) =>
                                                setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="description">
                                            Deskripsi
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Berikan keterangan voucher ini..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
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

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Voucher</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Nilai</TableHead>
                                <TableHead>Min. Order</TableHead>
                                <TableHead>Kuota</TableHead>
                                <TableHead>Masa Berlaku</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Belum ada voucher yang dibuat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.map((voucher) => (
                                    <TableRow key={voucher.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">
                                                    {voucher.code}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {voucher.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {voucher.type === 'fixed'
                                                    ? 'Nominal'
                                                    : 'Persentase'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {voucher.type === 'fixed'
                                                ? formatPrice(voucher.value)
                                                : `${voucher.value}%`}
                                        </TableCell>
                                        <TableCell>
                                            {formatPrice(
                                                voucher.min_purchase_amount,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {voucher.quota ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{
                                                                width: `${(voucher.used_count / voucher.quota) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {voucher.used_count} /{' '}
                                                        {voucher.quota} terpakai
                                                    </span>
                                                </div>
                                            ) : (
                                                '∞'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>
                                                    {voucher.start_date || '-'}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    s/d
                                                </span>
                                                <span>
                                                    {voucher.end_date || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {voucher.is_active ? (
                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Non-Aktif
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button
                                                className="h-8 w-8 cursor-pointer bg-yellow-500 hover:bg-yellow-600"
                                                onClick={() =>
                                                    openEdit(voucher)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                className="h-8 w-8 cursor-pointer bg-red-500 hover:bg-red-600"
                                                onClick={() =>
                                                    onDelete(voucher.id)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
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
                                <Label htmlFor="edit-value">
                                    Nilai Potongan
                                </Label>
                                <Input
                                    id="edit-value"
                                    type="number"
                                    value={data.value}
                                    onChange={(e) =>
                                        setData('value', Number(e.target.value))
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
                                <Label htmlFor="edit-min_purchase_amount">
                                    Minimal Pembelian (Rp)
                                </Label>
                                <Input
                                    id="edit-min_purchase_amount"
                                    type="number"
                                    value={data.min_purchase_amount}
                                    onChange={(e) =>
                                        setData(
                                            'min_purchase_amount',
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-max_discount_amount">
                                    Maksimal Potongan (Rp)
                                </Label>
                                <Input
                                    id="edit-max_discount_amount"
                                    type="number"
                                    value={data.max_discount_amount || ''}
                                    onChange={(e) =>
                                        setData(
                                            'max_discount_amount',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-quota">
                                    Kuota Penggunaan
                                </Label>
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
                                        <SelectItem value="0">
                                            Non-Aktif
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-start_date">
                                    Tanggal Mulai
                                </Label>
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
                                <Label htmlFor="edit-end_date">
                                    Tanggal Berakhir
                                </Label>
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
                                <Label htmlFor="edit-description">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
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

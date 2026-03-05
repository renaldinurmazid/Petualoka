import { DeleteConfirmation } from "@/components/delete-confirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PaymentMethode } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { Edit2, Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Metode Pembayaran",
        href: "/payment-methodes",
    },
];

interface Props {
    paymentMethods: PaymentMethode[];
}

export default function PaymentMethodes({ paymentMethods }: Props) {
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<PaymentMethode | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors, transform } = useForm({
        name: '',
        code: '',
        logo: null as File | null,
        type: 'bank_transfer' as PaymentMethode['type'],
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editData) {
            transform((data) => ({
                ...data,
                _method: 'PUT',
            }));

            post(`/payment-methodes/${editData.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    handleClose();
                    toast.success('Metode pembayaran berhasil diperbarui');
                },
                onError: () => {
                    toast.error("Terjadi kesalahan saat memperbarui metode pembayaran");
                },
            });
        } else {
            post("/payment-methodes", {
                onSuccess: () => {
                    handleClose();
                    toast.success('Metode pembayaran berhasil ditambahkan');
                },
                onError: () => {
                    toast.error("Terjadi kesalahan saat menambahkan metode pembayaran");
                },
            });
        }
    };

    const handleEdit = (method: PaymentMethode) => {
        setEditData(method);
        setData({
            name: method.name,
            code: method.code,
            logo: null,
            type: method.type,
            is_active: Boolean(method.is_active),
        });
        setPreviewUrl(method.logo);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        destroy(`/payment-methodes/${id}`, {
            onSuccess: () => {
                toast.success('Metode pembayaran berhasil dihapus');
            },
        });
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setPreviewUrl(null);
        reset();
        clearErrors();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("logo", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("logo", null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Metode Pembayaran" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Metode Pembayaran</h1>
                        <p className="text-muted-foreground">
                            Kelola metode pembayaran yang tersedia untuk pelanggan Anda.
                        </p>
                    </div>
                    <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
                        Tambah Metode
                    </Button>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[80px] pl-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Metode</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kode</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipe</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentMethods.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                            Belum ada metode pembayaran yang tersedia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paymentMethods.map((method) => (
                                        <TableRow key={method.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50 transition-all group-hover:scale-110">
                                                    {method.logo ? (
                                                        <img
                                                            src={method.logo}
                                                            alt={method.name}
                                                            className="h-full w-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <div className="text-[10px] font-medium text-muted-foreground">No Logo</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-neutral-900 dark:text-neutral-50">{method.name}</TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">{method.code}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {method.type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={method.is_active ? "default" : "secondary"}
                                                    className={method.is_active 
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                                                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}
                                                >
                                                    {method.is_active ? "Aktif" : "Non-aktif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                        onClick={() => handleEdit(method)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() => handleDelete(method.id)}
                                                        title="Hapus Metode Pembayaran?"
                                                        description="Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan."
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/5"
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
            </div>

            <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{editData ? "Edit Metode Pembayaran" : "Metode Pembayaran Baru"}</DialogTitle>
                            <DialogDescription>
                                Lengkapi detail metode pembayaran di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-2">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Logo Metode</Label>
                                <div 
                                    className={`relative flex aspect-square w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all hover:bg-muted/50 ${errors.logo ? "border-destructive" : "border-muted"}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} className="h-full w-full object-contain p-4" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-white shadow-sm"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Upload className="h-6 w-6" />
                                            <span className="text-[10px] font-medium">Upload Logo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">Nama Metode</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="Contoh: BCA Transfer, QRIS, dsb..."
                                    className={`rounded-xl ${errors.name ? "border-destructive bg-destructive/5" : ""}`}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-sm font-semibold">Kode</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData("code", e.target.value)}
                                    placeholder="Contoh: bca_va, qris_internal..."
                                    className={`rounded-xl ${errors.code ? "border-destructive bg-destructive/5" : ""}`}
                                />
                                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-semibold">Tipe</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData("type", value as any)}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="echannel">E-Channel</SelectItem>
                                        <SelectItem value="qris">QRIS</SelectItem>
                                        <SelectItem value="cash">Tunai</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl border bg-muted/30 p-3">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData("is_active", checked as boolean)}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="is_active" className="text-sm font-bold leading-none">
                                        Status Aktif
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">Aktifkan untuk menampilkan sebagai pilihan pembayaran.</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={handleClose} className="rounded-xl">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl bg-primary">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editData ? "Perbarui" : "Simpan Metode"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { Edit2, Plus, Trash2, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    categories: ProductCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Kategori Produk",
        href: "/product-categories",
    },
];

export default function ProductCategoryIndex({ categories }: Props) {
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<ProductCategory | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors, transform } = useForm({
        name: "",
        is_active: true,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editData) {
            transform((data) => ({
                ...data,
                _method: "put",
            }));

            post(`/product-categories/${editData.id}`, {
                onSuccess: () => {
                    handleClose();
                    toast.success("Kategori berhasil diperbarui");
                },
                onError: () => {
                    toast.error("Terjadi kesalahan saat memperbarui kategori");
                },
                forceFormData: true,
            });
        } else {
            // Ensure no _method spoofing for creation
            transform((data) => {
                const { _method, ...rest } = data as any;
                return rest;
            });

            post("/product-categories", {
                onSuccess: () => {
                    handleClose();
                    toast.success("Kategori berhasil ditambahkan");
                },
                onError: () => {
                    toast.error("Terjadi kesalahan saat menambahkan kategori");
                },
            });
        }
    };

    const handleEdit = (category: ProductCategory) => {
        setEditData(category);
        setData({
            name: category.name,
            is_active: Boolean(category.is_active),
            image: null,
        });
        setPreviewUrl(category.image);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        destroy(`/product-categories/${id}`, {
            onSuccess: () => {
                toast.success("Kategori berhasil dihapus");
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
            setData("image", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("image", null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Produk" />
            
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Kategori Produk</h1>
                        <p className="text-muted-foreground">
                            Kelola kategori untuk mengelompokkan produk-produk Anda secara efektif.
                        </p>
                    </div>
                    <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                    </Button>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[80px] pl-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Icon</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Kategori</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                            Belum ada kategori yang tersedia.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="pl-6">
                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50 transition-all group-hover:scale-110">
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-xs font-medium text-muted-foreground">None</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-neutral-900 dark:text-neutral-50">{category.name}</TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">{category.slug}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={category.is_active ? "default" : "secondary"}
                                                    className={category.is_active 
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                                                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}
                                                >
                                                    {category.is_active ? "Aktif" : "Non-aktif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() => handleDelete(category.id)}
                                                        title="Hapus Kategori?"
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
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">{editData ? "Edit Kategori" : "Kategori Baru"}</DialogTitle>
                            <DialogDescription>
                                Lengkapi detail kategori di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-2">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Icon / Gambar Kategori</Label>
                                <div 
                                    className={`relative flex aspect-square w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all hover:bg-muted/50 ${errors.image ? "border-destructive" : "border-muted"}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} className="h-full w-full object-cover" />
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
                                            <span className="text-[10px] font-medium">Upload</span>
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
                                {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">Nama Kategori</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="Tiket Pesawat, Hotel, dsb..."
                                    className={`rounded-xl ${errors.name ? "border-destructive bg-destructive/5" : ""}`}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
                                    <p className="text-[10px] text-muted-foreground">Aktifkan untuk menampilkan di public.</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={handleClose} className="rounded-xl">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl bg-blue-600 px-6 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                                {editData ? "Perbarui" : "Simpan Kategori"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
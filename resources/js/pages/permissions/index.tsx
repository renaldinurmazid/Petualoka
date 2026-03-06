import { DeleteConfirmation } from '@/components/delete-confirmation';
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
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Edit2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Permission {
    uuid: string;
    name: string;
    guard_name: string;
    created_at: string;
}

interface Props {
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permissions', href: '/permissions' },
];

export default function PermissionIndex({ permissions }: Props) {
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<Permission | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        guard_name: 'web',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editData) {
            put(`/permissions/${editData.uuid}`, {
                onSuccess: () => {
                    handleClose();
                    toast.success('Permission berhasil diperbarui');
                },
                onError: () => toast.error('Terjadi kesalahan'),
            });
        } else {
            post('/permissions', {
                onSuccess: () => {
                    handleClose();
                    toast.success('Permission berhasil ditambahkan');
                },
                onError: () => toast.error('Terjadi kesalahan'),
            });
        }
    };

    const handleEdit = (permission: Permission) => {
        setEditData(permission);
        setData({
            name: permission.name,
            guard_name: permission.guard_name,
        });
        setOpen(true);
    };

    const handleDelete = (uuid: string) => {
        destroy(`/permissions/${uuid}`, {
            onSuccess: () => toast.success('Permission berhasil dihapus'),
        });
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Permissions
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola hak akses sistem untuk mengontrol apa yang
                            bisa dilakukan oleh setiap role.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="w-full gap-2 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" /> Tambah Permission
                    </Button>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Nama Permission
                                    </TableHead>
                                    <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Guard
                                    </TableHead>
                                    <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        ID (UUID)
                                    </TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-32 text-center text-muted-foreground italic"
                                        >
                                            Belum ada permission yang terdaftar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    permissions.map((p) => (
                                        <TableRow
                                            key={p.uuid}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-[10px]"
                                                >
                                                    {p.guard_name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate font-mono text-xs text-muted-foreground">
                                                {p.uuid}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                        onClick={() =>
                                                            handleEdit(p)
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() =>
                                                            handleDelete(p.uuid)
                                                        }
                                                        title="Hapus Permission?"
                                                        description="Menghapus permission ini dapat mempengaruhi akses user yang terkait."
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
                            <DialogTitle className="text-xl font-bold">
                                {editData
                                    ? 'Edit Permission'
                                    : 'Permission Baru'}
                            </DialogTitle>
                            <DialogDescription>
                                Masukkan nama permission yang unik (contoh:
                                view_orders).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-semibold"
                                >
                                    Nama Permission
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="manage_products"
                                    className={`rounded-xl ${errors.name ? 'border-destructive bg-destructive/5' : ''}`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="guard_name"
                                    className="text-sm font-semibold"
                                >
                                    Guard Name
                                </Label>
                                <Select
                                    value={data.guard_name}
                                    onValueChange={(value) =>
                                        setData('guard_name', value)
                                    }
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Pilih Guard" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web">web</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.guard_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.guard_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl"
                            >
                                {editData ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

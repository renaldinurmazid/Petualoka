import { DeleteConfirmation } from '@/components/delete-confirmation'; // Pastikan path benar
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Edit2, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Role {
    uuid: string;
    name: string;
    permissions: string[]; // List UUID
}

interface Permission {
    uuid: string;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
];

export default function RoleIndex({
    roles,
    permissions,
}: {
    roles: Role[];
    permissions: Permission[];
}) {
    const [open, setOpen] = useState(false);
    const [editRole, setEditRole] = useState<Role | null>(null);

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
        permissions: [] as string[],
    });

    const handleOpenEdit = (role: Role) => {
        setEditRole(role);
        setData({
            name: role.name,
            guard_name: 'web',
            permissions: role.permissions,
        });
        setOpen(true);
    };

    const togglePermission = (uuid: string) => {
        const current = [...data.permissions];
        const index = current.indexOf(uuid);
        if (index > -1) current.splice(index, 1);
        else current.push(uuid);
        setData('permissions', current);
    };

    const handleClose = () => {
        setOpen(false);
        setEditRole(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editRole) {
            put(`/roles/${editRole.uuid}`, {
                onSuccess: () => {
                    handleClose();
                    toast.success('Role berhasil diperbarui');
                },
                onError: () => toast.error('Terjadi kesalahan'),
            });
        } else {
            post('/roles', {
                onSuccess: () => {
                    handleClose();
                    toast.success('Role berhasil dibuat');
                },
                onError: () => toast.error('Terjadi kesalahan'),
            });
        }
    };

    const handleDelete = (uuid: string) => {
        destroy(`/roles/${uuid}`, {
            onSuccess: () => toast.success('Role berhasil dihapus'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                            Roles (Peran)
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola grup hak akses untuk menentukan apa yang bisa
                            dilakukan oleh pengguna.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="w-full gap-2 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" /> Tambah Role
                    </Button>
                </div>

                {/* Table Section */}
                <Card className="border-none shadow-sm ring-1 ring-muted">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Nama Role
                                    </TableHead>
                                    <TableHead className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Status Akses
                                    </TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-32 text-center text-muted-foreground italic"
                                        >
                                            Belum ada role yang terdaftar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((role) => (
                                        <TableRow
                                            key={role.uuid}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="font-medium"
                                                >
                                                    {role.permissions.length}{' '}
                                                    Hak Akses Terpasang
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                                        onClick={() =>
                                                            handleOpenEdit(role)
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>

                                                    <DeleteConfirmation
                                                        onConfirm={() =>
                                                            handleDelete(
                                                                role.uuid,
                                                            )
                                                        }
                                                        title="Hapus Role?"
                                                        description="Menghapus role ini akan mencabut semua akses pengguna yang memilikinya."
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

            {/* MODAL EDIT/CREATE */}
            <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent className="max-w-2xl sm:rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editRole
                                    ? 'Edit Role & Hak Akses'
                                    : 'Buat Role Baru'}
                            </DialogTitle>
                            <DialogDescription>
                                Berikan nama peran dan pilih daftar hak akses
                                yang diizinkan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-semibold"
                                >
                                    Nama Role
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Contoh: Admin Gudang"
                                    className={`rounded-xl ${errors.name ? 'border-destructive bg-destructive/5' : ''}`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    Pilih Hak Akses (Permissions):
                                </Label>
                                <div className="grid max-h-[300px] grid-cols-1 gap-2 overflow-y-auto rounded-xl border bg-neutral-50 p-4 md:grid-cols-2 dark:bg-neutral-900">
                                    {permissions.map((perm) => (
                                        <div
                                            key={perm.uuid}
                                            className="flex items-center space-x-3 rounded-lg border border-transparent bg-white p-2 transition-all hover:border-blue-200 hover:shadow-sm dark:bg-neutral-800"
                                        >
                                            <Checkbox
                                                id={`perm-${perm.uuid}`}
                                                checked={data.permissions.includes(
                                                    perm.uuid,
                                                )}
                                                onCheckedChange={() =>
                                                    togglePermission(perm.uuid)
                                                }
                                            />
                                            <label
                                                htmlFor={`perm-${perm.uuid}`}
                                                className="flex-1 cursor-pointer text-sm font-medium select-none"
                                            >
                                                {perm.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
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
                                className="rounded-xl px-8"
                            >
                                {editRole ? 'Perbarui Role' : 'Simpan Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

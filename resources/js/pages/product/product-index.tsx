import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit2, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: '/products',
    },
];

interface Product {
    id: string;
    name: string;
    price: string;
    stock: number;
    galleries: { image: string }[];
}

interface Props {
    products: {
        data: Product[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
}

export default function ProductIndex({ products }: Props) {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    const handleDelete = (id: string) => {
        router.delete(`/products/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk" />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Daftar Produk
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola produk yang Anda jual di Petualoka.
                        </p>
                    </div>
                    <Button
                        className="cursor-pointer"
                        onClick={() => router.visit('/products/create')}
                    >
                        Buat Produk Baru
                    </Button>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
                    <div className="flex w-full max-w-lg gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>Tampilkan</Label>
                            <Select
                                defaultValue="10"
                                onValueChange={(value) =>
                                    router.get(
                                        '/products',
                                        { per_page: value },
                                        { preserveState: true },
                                    )
                                }
                            >
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder="Show" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            <Label>Pencarian</Label>
                            <Input
                                placeholder="Cari nama produk..."
                                className="max-w-sm"
                                onChange={(e) =>
                                    router.get(
                                        '/products',
                                        { search: e.target.value },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden border-neutral-200 p-0 dark:border-neutral-800">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">
                                    Foto
                                </TableHead>
                                <TableHead>Nama Produk</TableHead>
                                <TableHead>Harga /Hari</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead className="text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className="group transition-colors hover:bg-muted/30"
                                    >
                                        <TableCell>
                                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted">
                                                {product.galleries?.[0] ? (
                                                    <img
                                                        src={product.galleries[0].image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(product.price)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                                            >
                                                {product.stock} Unit
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8 cursor-pointer bg-yellow-500 hover:bg-yellow-600"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/products/${product.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4 text-white" />
                                                </Button>
                                                <DeleteConfirmation
                                                    children={
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 cursor-pointer bg-red-500 hover:bg-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                    title="Hapus Produk?"
                                                    description="Anda yakin ingin menghapus produk ini?"
                                                    onConfirm={() =>
                                                        handleDelete(product.id)
                                                    }
                                                />
                                                {/* <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 cursor-pointer border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button> */}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        Belum ada produk. Klik "Buat Produk
                                        Baru" untuk memulai.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}

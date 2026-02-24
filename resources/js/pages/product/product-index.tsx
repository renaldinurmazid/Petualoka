import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
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

export default function ProductIndex({ products, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    '/products',
                    { search, per_page: filters.per_page },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id: string) => {
        router.delete(`/products/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Produk</h1>
                        <p className="text-muted-foreground">
                            Kelola katalog produk dan stok inventaris Anda.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit('/products/create')}
                        className="w-full sm:w-auto"
                    >
                        Buat Produk
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama produk..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Tampilkan:</span>
                        <Select
                            defaultValue={filters.per_page || "10"}
                            onValueChange={(value) =>
                                router.get(
                                    '/products',
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
                                    <TableHead className="w-[80px] pl-6">Foto</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Stok</TableHead>
                                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="pl-6">
                                                <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted">
                                                    {product.galleries?.[0] ? (
                                                        <img
                                                            src={product.galleries[0].image}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="font-medium text-primary">
                                                {formatCurrency(product.price)}
                                                <span className="text-xs text-muted-foreground font-normal ml-1">/hari</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                                                >
                                                    {product.stock} Unit
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() => router.visit(`/products/${product.id}/edit`)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmation
                                                        onConfirm={() => handleDelete(product.id)}
                                                        title="Hapus Produk?"
                                                        description="Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
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
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {products.last_page > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm text-muted-foreground">
                            Showing {products.from} to {products.to} of {products.total} products
                        </p>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                {products.links.map((link, i) => {
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
        </AppLayout>
    );
}

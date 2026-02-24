import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { Head, useForm } from '@inertiajs/react';
import { Loader2, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk',
        href: '/products',
    },
    {
        title: 'Update Produk',
        href: '#',
    },
];

interface ProductGallery {
    id: string;
    image: string;
}

interface AttributeOption {
    id: string;
    value: string;
}

interface Attribute {
    id?: string;
    name: string;
    options: string[] | AttributeOption[];
}

interface Variant {
    id?: string;
    code: string;
    name: string;
    price: string;
    stock: string;
    attribute_options: string[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    slug: string;
    price: string;
    stock: string;
    galleries: ProductGallery[];
    attributes: {
        id: string;
        name: string;
        options: AttributeOption[];
    }[];
    variants: {
        id: string;
        code: string;
        price: string;
        stock: string;
        attribute_options: AttributeOption[];
    }[];
}

interface AttributeData {
    id?: string;
    name: string;
    options: string[];
}

interface VariantData {
    id?: string;
    code: string;
    name: string;
    price: string;
    stock: string;
    attribute_options: string[];
}

interface ProductFormData {
    _method: string;
    name: string;
    description: string;
    slug: string;
    price: string;
    stock: string;
    images: File[];
    removed_images: string[];
    attributes: AttributeData[];
    variants: VariantData[];
}

interface ProductProp {
    id: string;
    name: string;
    description: string;
    slug: string;
    price: string;
    stock: number;
    galleries: { id: string; image: string }[];
    attributes: {
        id: string;
        name: string;
        options: { id: string; value: string }[];
    }[];
    variants: {
        id: string;
        code: string;
        price: string;
        stock: number;
        attribute_options: { id: string; value: string }[];
    }[];
}

export default function ProductEdit({ product }: { product: ProductProp }) {
    const { data, setData, post, processing, errors } =
        useForm<ProductFormData>({
            _method: 'PUT',
            name: product.name,
            description: product.description,
            slug: product.slug,
            price: product.price,
            stock: product.stock.toString(),
            images: [],
            removed_images: [],
            attributes: product.attributes.map((attr: any) => ({
                id: attr.id,
                name: attr.name,
                options: attr.options.map((opt: any) => opt.value),
            })),
            variants: product.variants.map((v: any) => ({
                id: v.id,
                code: v.code,
                name: v.attribute_options
                    .map((opt: any) => opt.value)
                    .join(' / '),
                price: v.price,
                stock: v.stock,
                attribute_options: v.attribute_options.map(
                    (opt: any) => opt.value,
                ),
            })),
        });

    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ProductGallery[]>(
        product.galleries,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    useEffect(() => {
        setData('slug', slugify(data.name));
    }, [data.name, setData]);

    useEffect(() => {
        if (data.variants.length > 0) {
            const totalStock = data.variants.reduce(
                (sum, v) => sum + (parseInt(v.stock) || 0),
                0,
            );
            setData('stock', totalStock.toString());
        }
    }, [data.variants, setData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('images', [...data.images, ...files]);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const removeExistingImage = (imageId: string) => {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        setData('removed_images', [...data.removed_images, imageId]);
    };

    // Attribute & Variant logic (copied from create with edits)
    const addAttribute = () => {
        setData('attributes', [...data.attributes, { name: '', options: [] }]);
    };

    const updateAttributeName = (index: number, name: string) => {
        const newAttributes = [...data.attributes];
        newAttributes[index].name = name;
        setData('attributes', newAttributes);
    };

    const removeAttribute = (index: number) => {
        const newAttributes = [...data.attributes];
        newAttributes.splice(index, 1);
        setData('attributes', newAttributes);
    };

    const addOption = (attrIndex: number, option: string) => {
        if (!option.trim()) return;
        const newAttributes = [...data.attributes];
        if (!newAttributes[attrIndex].options.includes(option)) {
            newAttributes[attrIndex].options.push(option);
            setData('attributes', newAttributes);
        }
    };

    const removeOption = (attrIndex: number, optIndex: number) => {
        const newAttributes = [...data.attributes];
        newAttributes[attrIndex].options.splice(optIndex, 1);
        setData('attributes', newAttributes);
    };

    const generateVariants = () => {
        if (data.attributes.length === 0) return;
        const cartesian = (...args: string[][]): string[][] =>
            args.reduce(
                (a: string[][], b: string[]) =>
                    a.flatMap((d) => b.map((e) => [...d, e])),
                [[]],
            );

        const allOptions = data.attributes.map((attr) => attr.options);
        if (allOptions.some((opts) => opts.length === 0)) return;

        const combinations = cartesian(...allOptions);
        const newVariants = combinations.map((combo) => {
            const variantName = combo.join(' / ');
            // Try to find existing variant to preserve ID and code if possible
            return {
                code: slugify(`${data.name}-${variantName}`),
                name: variantName,
                price: data.price,
                stock: data.stock,
                attribute_options: combo,
            };
        });
        setData('variants', newVariants);
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...data.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setData('variants', newVariants);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Update Produk" />
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Update Produk
                        </h2>
                        <p className="text-muted-foreground">
                            Perbarui detail dan varian produk Anda.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="max-w-4xl space-y-10">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="col-span-1 space-y-4 md:col-span-2">
                                <Label className="text-base font-semibold">
                                    Foto Produk Utama
                                </Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {existingImages.map((gallery) => (
                                        <div
                                            key={gallery.id}
                                            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
                                        >
                                            <img
                                                src={gallery.image}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeExistingImage(
                                                        gallery.id,
                                                    )
                                                }
                                                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {previews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-square overflow-hidden rounded-xl border border-primary/30"
                                        >
                                            <img
                                                src={preview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeNewImage(index)
                                                }
                                                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-4" />
                                            </button>
                                            <div className="absolute right-0 bottom-0 left-0 bg-primary/80 py-0.5 text-center text-[8px] font-bold text-white uppercase">
                                                Baru
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                    >
                                        <UploadCloud className="size-8 text-muted-foreground transition-colors group-hover:text-primary" />
                                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                                            Tambah Foto
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Produk</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-11"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    readOnly
                                    className="h-11 bg-muted/50"
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Dasar (Rp)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    className="h-11"
                                    required
                                />
                                <InputError message={errors.price} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Total Stok</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData('stock', e.target.value)
                                    }
                                    className="h-11 disabled:cursor-not-allowed disabled:opacity-75"
                                    required
                                    disabled={data.variants.length > 0}
                                />
                                <InputError message={errors.stock} />
                                {data.variants.length > 0 && (
                                    <p className="text-[10px] text-muted-foreground italic">
                                        * Stok dihitung otomatis dari total stok
                                        varian.
                                    </p>
                                )}
                            </div>
                            <div className="col-span-1 space-y-2 md:col-span-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="min-h-[120px]"
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Attributes */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Atribut Produk
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Kelola spesifikasi produk Anda.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAttribute}
                            >
                                <Plus className="mr-2 size-4" /> Tambah Atribut
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.attributes.map((attr, attrIndex) => (
                                <Card
                                    key={attrIndex}
                                    className="border-none bg-muted/20 p-4 shadow-none"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-end gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label>Nama Atribut</Label>
                                                <Input
                                                    value={attr.name}
                                                    onChange={(e) =>
                                                        updateAttributeName(
                                                            attrIndex,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() =>
                                                    removeAttribute(attrIndex)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Opsi Atribut</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {attr.options.map(
                                                    (
                                                        opt: string,
                                                        optIndex: number,
                                                    ) => (
                                                        <span
                                                            key={optIndex}
                                                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                                                        >
                                                            {opt}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeOption(
                                                                        attrIndex,
                                                                        optIndex,
                                                                    )
                                                                }
                                                            >
                                                                <X className="size-3" />
                                                            </button>
                                                        </span>
                                                    ),
                                                )}
                                                <Input
                                                    placeholder="Tambah opsi..."
                                                    className="h-8 w-40 text-xs"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addOption(
                                                                attrIndex,
                                                                e.currentTarget
                                                                    .value,
                                                            );
                                                            e.currentTarget.value =
                                                                '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {data.attributes.length > 0 && (
                            <Button
                                type="button"
                                className="w-full"
                                variant="secondary"
                                onClick={generateVariants}
                            >
                                Generate Ulang Varian
                            </Button>
                        )}
                    </div>

                    {/* Variants */}
                    {data.variants.length > 0 && (
                        <Card className="overflow-hidden border-neutral-200 dark:border-neutral-800">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Varian</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="w-32">
                                            Harga (Rp)
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Stok
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.variants.map((variant, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-xs font-medium">
                                                {variant.name}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={variant.code}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            'code',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 font-mono text-xs"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            index,
                                                            'stock',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4 border-t pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.history.back()}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-10"
                            disabled={processing}
                        >
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Perbarui Produk
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

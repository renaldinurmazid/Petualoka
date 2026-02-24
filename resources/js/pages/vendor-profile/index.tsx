import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    CloudUpload,
    Loader2,
    Phone,
    Store,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface Vendor {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    sub_district: string;
    country: string;
    logo: string | null;
    banner: string | null;
    is_verified: boolean;
}

interface Props {
    vendor: Vendor;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
    {
        title: 'Vendor Profile',
        href: '/vendor-profile',
    },
];

export default function VendorProfile({ vendor }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(vendor.logo);
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        vendor.banner,
    );

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        sub_district: vendor.sub_district || '',
        country: vendor.country || 'Indonesia',
        logo: null as File | null,
        banner: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('banner', file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vendor-profile', {
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui');
            },
            onError: () => {
                toast.error(
                    'Gagal memperbarui profil. Silakan periksa kembali inputan Anda.',
                );
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor Profile" />

            <div className="flex flex-col gap-6 p-4 py-6 md:p-8">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Profil Toko
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola informasi toko dan identitas bisnismu.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Banner & Logo Section */}
                        <Card className="overflow-hidden border-none bg-transparent shadow-none">
                            <div className="relative">
                                {/* Banner */}
                                <div
                                    className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-xl bg-muted md:h-64"
                                    onClick={() =>
                                        bannerInputRef.current?.click()
                                    }
                                >
                                    {bannerPreview ? (
                                        <img
                                            src={bannerPreview}
                                            alt="Banner"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-muted-foreground/25">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <CloudUpload className="size-8" />
                                                <span className="text-sm font-medium">
                                                    Klik untuk upload banner
                                                    toko
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                                            <Camera className="size-4" />
                                            Ganti Banner
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleBannerChange}
                                    />
                                </div>

                                {/* Logo Overlay */}
                                <div className="absolute -bottom-12 left-6 md:left-10">
                                    <div
                                        className="group relative size-24 cursor-pointer overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-xl md:size-32"
                                        onClick={() =>
                                            logoInputRef.current?.click()
                                        }
                                    >
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Store className="size-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Camera className="size-6 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={logoInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="flex justify-end pt-4 pb-2">
                                {vendor.is_verified ? (
                                    <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-600 hover:bg-emerald-500/20">
                                        <CheckCircle2 className="size-3.5" />
                                        Terverifikasi
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 px-3 py-1"
                                    >
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Menunggu Verifikasi
                                    </Badge>
                                )}
                            </div>
                        </Card>

                        <div className="mt-12 grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
                            {/* General Information */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Informasi Umum</CardTitle>
                                    <CardDescription>
                                        Detail utama bisnis Anda yang akan
                                        dilihat pelanggan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Nama Toko
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Petualoka Outdoor"
                                                className="bg-muted/30"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email Bisnis
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="email@bisnis.com"
                                                className="bg-muted/30"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            Nomor Telepon / WhatsApp
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute top-3 left-3 size-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="08123456789"
                                                className="bg-muted/30 pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            Alamat Lengkap
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Jl. Raya Utama No. 123..."
                                            className="min-h-[100px] bg-muted/30"
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Details */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Lokasi</CardTitle>
                                    <CardDescription>
                                        Detail wilayah operasional toko.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">Provinsi</Label>
                                        <Input
                                            id="state"
                                            value={data.state}
                                            onChange={(e) =>
                                                setData('state', e.target.value)
                                            }
                                            placeholder="Provinsi"
                                            className="bg-muted/30"
                                        />
                                        <InputError message={errors.state} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">
                                            Kota/Kabupaten
                                        </Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) =>
                                                setData('city', e.target.value)
                                            }
                                            placeholder="Kota"
                                            className="bg-muted/30"
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sub_district">
                                            Kecamatan
                                        </Label>
                                        <Input
                                            id="sub_district"
                                            value={data.sub_district}
                                            onChange={(e) =>
                                                setData(
                                                    'sub_district',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Kecamatan"
                                            className="bg-muted/30"
                                        />
                                        <InputError
                                            message={errors.sub_district}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Negara</Label>
                                        <Select
                                            value={data.country}
                                            onValueChange={(v) =>
                                                setData('country', v)
                                            }
                                        >
                                            <SelectTrigger className="bg-muted/30">
                                                <SelectValue placeholder="Pilih Negara" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Indonesia">
                                                    Indonesia
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.country} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 rounded-xl border bg-card p-4 shadow-sm lg:p-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-[150px]"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

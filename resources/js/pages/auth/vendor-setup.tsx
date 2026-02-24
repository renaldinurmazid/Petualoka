import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { logout } from '@/routes';
import { router, useForm, usePage } from '@inertiajs/react';
import { Loader2, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface VendorFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    sub_district: string;
    country: string;
    logo: File | null;
}

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    sub_district: string;
    country: string;
    logo: string;
    vendor_profile: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        sub_district: string;
        country: string;
        logo: string;
        is_verified: boolean;
    };
}

export default function VendorSetup() {
    const { auth, flash } = usePage<{
        auth: { user: User };
        flash: {
            success?: string;
            error?: string;
            status?: string;
            warning?: string;
            info?: string;
        };
    }>().props;
    const isPending =
        auth.user?.vendor_profile && !auth.user.vendor_profile.is_verified;

    const { data, setData, post, processing, errors } = useForm<VendorFormData>(
        {
            name: auth.user?.vendor_profile?.name || '',
            email: auth.user?.vendor_profile?.email || '',
            phone: auth.user?.vendor_profile?.phone || '',
            address: auth.user?.vendor_profile?.address || '',
            city: auth.user?.vendor_profile?.city || '',
            state: auth.user?.vendor_profile?.state || '',
            sub_district: auth.user?.vendor_profile?.sub_district || '',
            country: auth.user?.vendor_profile?.country || 'Indonesia',
            logo: null as File | null,
        },
    );

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/form-mitra');
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                {isPending ? (
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="w-[300px]">
                            <img
                                src="/images/svg/waiting-verification.svg"
                                alt="waiting-verification"
                            />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">
                                Verifikasi Sedang Berjalan
                            </h2>
                            <p className="mx-auto max-w-lg text-muted-foreground">
                                Terima kasih telah mendaftarkan bisnis Anda. Tim
                                kami sedang meninjau profil
                                <strong>
                                    {' '}
                                    {auth.user.vendor_profile.name}
                                </strong>
                                . Anda akan mendapatkan akses ke dashboard
                                setelah verifikasi selesai.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                className="cursor-pointer"
                                onClick={() => router.post(logout())}
                            >
                                Logout
                            </Button>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => window.location.reload()}
                            >
                                Cek Status Terbaru
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1 text-center md:text-left">
                            <h4 className="text-2xl font-bold">
                                Lengkapi Profil Bisnis Anda
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Informasi ini akan ditampilkan pada halaman toko
                                Anda. Pastikan data yang dimasukkan sudah benar
                                untuk memudahkan proses verifikasi dan
                                transaksi.
                            </p>
                        </div>
                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
                        >
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <Label
                                    htmlFor="logo"
                                    className="text-foreground/80"
                                >
                                    Logo Toko
                                </Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={triggerFileSelect}
                                    className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-border/80 bg-muted/20 transition-all hover:border-primary/50 hover:bg-muted/40"
                                >
                                    {logoPreview ? (
                                        <>
                                            <img
                                                src={logoPreview}
                                                alt="Logo Preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <UploadCloud className="size-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <UploadCloud className="size-6 text-muted-foreground group-hover:text-primary" />
                                            <p className="text-center text-[10px] font-medium text-muted-foreground group-hover:text-primary">
                                                Upload Logo
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.logo} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-foreground/80"
                                >
                                    Nama Toko
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    placeholder="Nama toko Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-foreground/80"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    placeholder="Email Toko Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-foreground/80"
                                >
                                    Nomor Telepon
                                </Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    required
                                    placeholder="Nomor Telepon Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="state"
                                    className="text-foreground/80"
                                >
                                    Provinsi
                                </Label>
                                <Input
                                    id="state"
                                    type="text"
                                    name="state"
                                    value={data.state}
                                    onChange={(e) =>
                                        setData('state', e.target.value)
                                    }
                                    required
                                    placeholder="Provinsi Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.state} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="city"
                                    className="text-foreground/80"
                                >
                                    Kota/Kabupaten
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    required
                                    placeholder="Kota/Kabupaten Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.city} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="sub_district"
                                    className="text-foreground/80"
                                >
                                    Kecamatan
                                </Label>
                                <Input
                                    id="sub_district"
                                    type="text"
                                    name="sub_district"
                                    value={data.sub_district}
                                    onChange={(e) =>
                                        setData('sub_district', e.target.value)
                                    }
                                    required
                                    placeholder="Kecamatan Anda"
                                    className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.sub_district} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="country"
                                    className="text-foreground/80"
                                >
                                    Negara
                                </Label>
                                <Select
                                    value={data.country}
                                    onValueChange={(value) =>
                                        setData('country', value)
                                    }
                                >
                                    <SelectTrigger>
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
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <Label
                                    htmlFor="address"
                                    className="text-foreground/80"
                                >
                                    Alamat
                                </Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    required
                                    placeholder="Alamat Anda"
                                    className="h-14 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                />
                                <InputError message={errors.address} />
                            </div>
                            <div className="flex justify-end md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 px-8"
                                >
                                    {processing && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    Simpan Profil
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

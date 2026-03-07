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
import { Loader2, MapPin, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
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
    } | null;
}

interface Region {
    id: string;
    name: string;
}

// ── API — sama persis dengan VendorProfile ────────────────────────────────────
const WILAYAH_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';

// ── Main Component ────────────────────────────────────────────────────────────
export default function VendorSetup() {
    const { auth, flash } = usePage<{
        auth: { user: User };
        flash: {
            success?: string;
            error?: string;
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
            country: 'Indonesia',
            logo: null,
        },
    );

    // ── Wilayah — pola identik dengan VendorProfile ───────────────────────
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);

    // Load provinsi saat mount
    useEffect(() => {
        fetch(`${WILAYAH_API}/provinces.json`)
            .then((r) => r.json())
            .then(setProvinces)
            .catch(() => toast.error('Gagal memuat data provinsi'));
    }, []);

    // Load kota ketika state (nama provinsi) berubah
    useEffect(() => {
        if (!data.state) {
            setCities([]);
            return;
        }
        const province = provinces.find((p) => p.name === data.state);
        if (!province) return;
        fetch(`${WILAYAH_API}/regencies/${province.id}.json`)
            .then((r) => r.json())
            .then(setCities)
            .catch(() => toast.error('Gagal memuat data kota'));
    }, [data.state, provinces]);

    // Load kecamatan ketika city (nama kota) berubah
    useEffect(() => {
        if (!data.city) {
            setDistricts([]);
            return;
        }
        const city = cities.find((c) => c.name === data.city);
        if (!city) return;
        fetch(`${WILAYAH_API}/districts/${city.id}.json`)
            .then((r) => r.json())
            .then(setDistricts)
            .catch(() => toast.error('Gagal memuat data kecamatan'));
    }, [data.city, cities]);

    const handleStateChange = (value: string) =>
        setData((d) => ({ ...d, state: value, city: '', sub_district: '' }));

    const handleCityChange = (value: string) =>
        setData((d) => ({ ...d, city: value, sub_district: '' }));

    // ── Flash messages ────────────────────────────────────────────────────
    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
        if (flash.warning) toast.warning(flash.warning);
        if (flash.info) toast.info(flash.info);
    }, [flash]);

    // ── Logo ──────────────────────────────────────────────────────────────
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/form-mitra');
    };

    // ── Pending state ─────────────────────────────────────────────────────
    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
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
                            kami sedang meninjau profil{' '}
                            <strong>{auth.user.vendor_profile!.name}</strong>.
                            Anda akan mendapatkan akses ke dashboard setelah
                            verifikasi selesai.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => router.post(logout())}>
                            Logout
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Cek Status Terbaru
                        </Button>
                    </div>
                </div>
                <Toaster position="top-right" />
            </div>
        );
    }

    // ── Form ──────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-2xl font-bold">
                        Lengkapi Profil Bisnis Anda
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Informasi ini akan ditampilkan pada halaman toko Anda.
                        Pastikan data yang dimasukkan sudah benar untuk
                        memudahkan proses verifikasi dan transaksi.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
                >
                    {/* ── Logo ──────────────────────────────────────────── */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label className="text-foreground/80">Logo Toko</Label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
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

                    {/* ── Nama Toko ─────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-foreground/80">
                            Nama Toko
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Nama toko Anda"
                            className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* ── Email ─────────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="text-foreground/80">
                            Email Toko
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="Email toko Anda"
                            className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* ── No. Telepon ───────────────────────────────────── */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label htmlFor="phone" className="text-foreground/80">
                            Nomor Telepon
                        </Label>
                        <Input
                            id="phone"
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                            placeholder="Contoh: 08123456789"
                            className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    {/* ── Divider Wilayah ───────────────────────────────── */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                                <MapPin className="size-3.5 text-primary" />
                            </div>
                            <p className="text-sm font-semibold">
                                Wilayah Toko
                            </p>
                            <div className="flex-1 border-t border-dashed border-border/50" />
                        </div>
                    </div>

                    {/* ── Negara (fixed) ────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground/80">Negara</Label>
                        <Select value="Indonesia" disabled>
                            <SelectTrigger className="h-11 border-border/50 bg-muted/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Indonesia">
                                    Indonesia
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ── Provinsi ──────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground/80">
                            Provinsi <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.state}
                            onValueChange={handleStateChange}
                        >
                            <SelectTrigger className="h-11 border-border/50 bg-muted/20">
                                <SelectValue
                                    placeholder={
                                        provinces.length === 0
                                            ? 'Memuat...'
                                            : 'Pilih Provinsi'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map((p) => (
                                    <SelectItem key={p.id} value={p.name}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.state} />
                    </div>

                    {/* ── Kota / Kabupaten ──────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground/80">
                            Kota / Kabupaten{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.city}
                            onValueChange={handleCityChange}
                            disabled={!data.state || cities.length === 0}
                        >
                            <SelectTrigger className="h-11 border-border/50 bg-muted/20">
                                <SelectValue
                                    placeholder={
                                        !data.state
                                            ? 'Pilih Provinsi dulu'
                                            : cities.length === 0
                                              ? 'Memuat...'
                                              : 'Pilih Kota/Kabupaten'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.city} />
                    </div>

                    {/* ── Kecamatan ─────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-foreground/80">
                            Kecamatan{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.sub_district}
                            onValueChange={(v) => setData('sub_district', v)}
                            disabled={!data.city || districts.length === 0}
                        >
                            <SelectTrigger className="h-11 border-border/50 bg-muted/20">
                                <SelectValue
                                    placeholder={
                                        !data.city
                                            ? 'Pilih Kota dulu'
                                            : districts.length === 0
                                              ? 'Memuat...'
                                              : 'Pilih Kecamatan'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map((d) => (
                                    <SelectItem key={d.id} value={d.name}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.sub_district} />
                    </div>

                    {/* ── Alamat Lengkap ────────────────────────────────── */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label htmlFor="address" className="text-foreground/80">
                            Alamat Lengkap{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            required
                            placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan"
                            className="h-20 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                        />
                        <InputError message={errors.address} />
                    </div>

                    {/* ── Submit ────────────────────────────────────────── */}
                    <div className="flex justify-end md:col-span-2">
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.state ||
                                !data.city ||
                                !data.sub_district
                            }
                            className="h-11 px-8"
                        >
                            {processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Simpan Profil
                        </Button>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

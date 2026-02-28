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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Camera,
    CheckCircle2,
    CloudUpload,
    Loader2,
    LocateFixed,
    Phone,
    Store,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import { toast } from 'sonner';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    latitude: string | null;
    longitude: string | null;
    is_verified: boolean;
}

interface Region {
    id: string;
    name: string;
}

interface Props {
    vendor: Vendor;
}

const WILAYAH_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const DEFAULT_LAT = -6.2;
const DEFAULT_LNG = 106.8166;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/' },
    { title: 'Profil Toko', href: '/vendor-profile' },
];

function LocationMarker({
    lat,
    lng,
    onMove,
}: {
    lat: number;
    lng: number;
    onMove: (lat: number, lng: number) => void;
}) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onMove(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return (
        <Marker
            position={[lat, lng]}
            draggable
            eventHandlers={{
                dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    onMove(lat, lng);
                },
            }}
        />
    );
}

export default function VendorProfile({ vendor }: Props) {
    const resolveUrl = (path: string | null): string | null => {
        if (!path) return null;
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    const [logoPreview, setLogoPreview] = useState<string | null>(
        resolveUrl(vendor.logo),
    );
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        resolveUrl(vendor.banner),
    );
    const [provinces, setProvinces] = useState<Region[]>([]);
    const [cities, setCities] = useState<Region[]>([]);
    const [districts, setDistricts] = useState<Region[]>([]);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: vendor.name ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        address: vendor.address ?? '',
        state: vendor.state ?? '',
        city: vendor.city ?? '',
        sub_district: vendor.sub_district ?? '',
        country: vendor.country ?? 'Indonesia',
        latitude: vendor.latitude ?? String(DEFAULT_LAT),
        longitude: vendor.longitude ?? String(DEFAULT_LNG),
        logo: null as File | null,
        banner: null as File | null,
    });

    useEffect(() => {
        fetch(`${WILAYAH_API}/provinces.json`)
            .then((r) => r.json())
            .then(setProvinces);
    }, []);

    useEffect(() => {
        if (!data.state) {
            setCities([]);
            return;
        }
        const province = provinces.find((p) => p.name === data.state);
        if (!province) return;
        fetch(`${WILAYAH_API}/regencies/${province.id}.json`)
            .then((r) => r.json())
            .then(setCities);
    }, [data.state, provinces]);

    useEffect(() => {
        if (!data.city) {
            setDistricts([]);
            return;
        }
        const city = cities.find((c) => c.name === data.city);
        if (!city) return;
        fetch(`${WILAYAH_API}/districts/${city.id}.json`)
            .then((r) => r.json())
            .then(setDistricts);
    }, [data.city, cities]);

    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Logo terlalu besar, maksimal 2MB');
            e.target.value = '';
            return;
        }
        setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Banner terlalu besar, maksimal 2MB');
            e.target.value = '';
            return;
        }
        setData('banner', file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const setCoords = (lat: number, lng: number) =>
        setData((d) => ({
            ...d,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        }));

    const handleCurrentLocation = () => {
        navigator.geolocation?.getCurrentPosition(
            ({ coords }) => {
                setCoords(coords.latitude, coords.longitude);
                mapRef.current?.flyTo([coords.latitude, coords.longitude], 15);
                toast.success('Lokasi berhasil disesuaikan ke posisi Anda');
            },
            () => toast.error('Gagal mendapatkan lokasi'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    };

    const handleStateChange = (value: string) =>
        setData((d) => ({ ...d, state: value, city: '', sub_district: '' }));

    const handleCityChange = (value: string) =>
        setData((d) => ({ ...d, city: value, sub_district: '' }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vendor-profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil berhasil diperbarui');
                setData((prev) => ({ ...prev, logo: null, banner: null }));
            },
            onError: () =>
                toast.error('Gagal menyimpan, periksa kembali data Anda'),
        });
    };

    const lat = parseFloat(data.latitude) || DEFAULT_LAT;
    const lng = parseFloat(data.longitude) || DEFAULT_LNG;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Toko" />

            <div className="flex flex-col gap-6 p-4 py-6 md:p-8">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Profil Toko
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola informasi toko dan identitas bisnismu.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* ── Banner & Logo ───────────────────────────────── */}
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
                                            <Camera className="size-4" /> Ganti
                                            Banner
                                        </div>
                                    </div>
                                    <input
                                        ref={bannerInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg,image/avif"
                                        onChange={handleBannerChange}
                                    />
                                </div>

                                {/* Logo */}
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
                                                key={logoPreview}
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
                                            ref={logoInputRef}
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/avif"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 pb-2">
                                {vendor.is_verified ? (
                                    <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-600 hover:bg-emerald-500/20">
                                        <CheckCircle2 className="size-3.5" />{' '}
                                        Terverifikasi
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 px-3 py-1"
                                    >
                                        <Loader2 className="size-3.5 animate-spin" />{' '}
                                        Menunggu Verifikasi
                                    </Badge>
                                )}
                            </div>
                        </Card>

                        {/* ── Info Umum + Lokasi ──────────────────────────── */}
                        <div className="mt-12 grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
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

                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Lokasi</CardTitle>
                                    <CardDescription>
                                        Detail wilayah operasional toko.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Provinsi</Label>
                                        <Select
                                            value={data.state}
                                            onValueChange={handleStateChange}
                                        >
                                            <SelectTrigger className="bg-muted/30">
                                                <SelectValue placeholder="Pilih Provinsi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((p) => (
                                                    <SelectItem
                                                        key={p.id}
                                                        value={p.name}
                                                    >
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.state} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kota/Kabupaten</Label>
                                        <Select
                                            value={data.city}
                                            onValueChange={handleCityChange}
                                            disabled={
                                                !data.state ||
                                                cities.length === 0
                                            }
                                        >
                                            <SelectTrigger className="bg-muted/30">
                                                <SelectValue
                                                    placeholder={
                                                        data.state
                                                            ? 'Pilih Kota'
                                                            : 'Pilih Provinsi dulu'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.name}
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.city} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Kecamatan</Label>
                                        <Select
                                            value={data.sub_district}
                                            onValueChange={(v) =>
                                                setData('sub_district', v)
                                            }
                                            disabled={
                                                !data.city ||
                                                districts.length === 0
                                            }
                                        >
                                            <SelectTrigger className="bg-muted/30">
                                                <SelectValue
                                                    placeholder={
                                                        data.city
                                                            ? 'Pilih Kecamatan'
                                                            : 'Pilih Kota dulu'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districts.map((d) => (
                                                    <SelectItem
                                                        key={d.id}
                                                        value={d.name}
                                                    >
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.sub_district}
                                        />
                                    </div>

                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        *Gunakan koordinat dari Google Maps
                                        untuk akurasi lokasi toko.
                                    </p>

                                    <div className="space-y-2">
                                        <Label>Negara</Label>
                                        <Input
                                            value={data.country}
                                            disabled
                                            className="bg-muted/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Map ─────────────────────────────────────────── */}
                        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm lg:p-6">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">
                                    Lokasi Toko
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Geser pin pada peta untuk menentukan
                                    koordinat yang akurat.
                                </p>
                            </div>

                            <div className="h-[300px] w-full overflow-hidden rounded-lg border bg-muted shadow-inner">
                                <MapContainer
                                    ref={mapRef}
                                    center={[lat, lng]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />
                                    <LocationMarker
                                        lat={lat}
                                        lng={lng}
                                        onMove={setCoords}
                                    />
                                </MapContainer>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full gap-2 shadow-sm"
                                onClick={handleCurrentLocation}
                            >
                                <LocateFixed className="size-4" />
                                Gunakan Lokasi Saat Ini
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Latitude
                                    </Label>
                                    <Input
                                        value={data.latitude}
                                        onChange={(e) =>
                                            setData('latitude', e.target.value)
                                        }
                                        placeholder="-6.xxx"
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Longitude
                                    </Label>
                                    <Input
                                        value={data.longitude}
                                        onChange={(e) =>
                                            setData('longitude', e.target.value)
                                        }
                                        placeholder="106.xxx"
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Submit ───────────────────────────────────────── */}
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

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react'; // Tambah usePage
import {
    Box,
    ChartArea,
    CreditCard,
    GalleryVerticalEnd,
    LayoutGrid,
    List,
    ShieldCheck,
    ShoppingBag,
    Tag,
    UserCog,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRoles = auth.user.roles || [];
    const isSuperAdmin = userRoles.includes('superadmin');

    console.log('Role User:', auth.user.roles);

    // 1. Menu General (Semua Role)
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // 2. Menu Operasional (Mitra & Admin)
    const operationalItems: NavItem[] = [
        { title: 'Produk', href: '/products', icon: Box },
        { title: 'Voucher', href: '/vouchers', icon: Tag },
        { title: 'Order', href: '/orders', icon: ShoppingBag },
        { title: 'Laporan', href: '/reports', icon: ChartArea },
        { title: 'Dompet', href: '/wallets', icon: Wallet },
        {
            title: 'Profile Toko',
            href: '/vendor-profile',
            icon: GalleryVerticalEnd,
        },
    ];

    // 3. Menu System (Hanya Admin)
    const systemItems: NavItem[] = [
        { title: 'Kategori Produk', href: '/product-categories', icon: List },
        {
            title: 'Metode Pembayaran',
            href: '/payment-methodes',
            icon: CreditCard,
        },
        { title: 'Roles', href: '/roles', icon: UserCog },
        { title: 'Permissions', href: '/permissions', icon: ShieldCheck },
    ];

    // Gabungkan berdasarkan role
    const filteredNavItems = [
        ...mainNavItems,
        ...operationalItems, // Mitra butuh ini
        ...(isSuperAdmin ? systemItems : []), // Admin nambah menu system
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Kamu bisa membagi NavMain jadi beberapa section jika perlu */}
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

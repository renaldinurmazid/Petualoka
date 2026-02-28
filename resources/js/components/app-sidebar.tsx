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
import { Link } from '@inertiajs/react';
import {
    Box,
    ChartArea,
    GalleryVerticalEnd,
    LayoutGrid,
    List,
    ShoppingBag,
    Tag,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Kategori Produk',
        href: '/product-categories',
        icon: List,
    },
    {
        title: 'Produk',
        href: '/products',
        icon: Box,
    },
    {
        title: 'Voucher',
        href: '/vouchers',
        icon: Tag,
    },
    {
        title: 'Order',
        href: '/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Laporan',
        href: '/reports',
        icon: ChartArea,
    },
    {
        title: 'Dompet',
        href: '/wallets',
        icon: Wallet,
    },
    {
        title: 'Profile Toko',
        href: '/vendor-profile',
        icon: GalleryVerticalEnd,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

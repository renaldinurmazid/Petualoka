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
import { index as productIndex } from '@/routes/product';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Box,
    ChartArea,
    GalleryVerticalEnd,
    LayoutGrid,
    ShoppingBag,
    Tag,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: productIndex(),
        icon: Box,
    },
    {
        title: 'Voucher',
        href: '/voucher',
        icon: Tag,
    },
    {
        title: 'Order',
        href: '/order',
        icon: ShoppingBag,
    },
    {
        title: 'Laporan',
        href: '/laporan',
        icon: ChartArea,
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

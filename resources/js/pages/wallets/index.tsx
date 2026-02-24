import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Wallet, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    CreditCard, 
    History, 
    Plus, 
    MoreHorizontal,
    TrendingUp,
    Building2,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Dompet',
        href: '/wallets',
    },
];

// Mock Data
const walletData = {
    balance: 5750000,
    withdrawable: 4200000,
    pending: 1550000,
    totalEarned: 12850000,
    bankAccount: {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '8820 **** 4412',
        accountHolder: 'Petualoka Outdoor Store'
    }
};

const transactions = [
    { id: 'WDR-1024', type: 'withdrawal', amount: 2000000, date: '2026-02-20', status: 'completed', bank: 'BCA' },
    { id: 'INC-9921', type: 'income', amount: 450000, date: '2026-02-23', status: 'completed', note: 'Order #ORD-882' },
    { id: 'INC-9922', type: 'income', amount: 1100000, date: '2026-02-24', status: 'pending', note: 'Order #ORD-885' },
    { id: 'WDR-1025', type: 'withdrawal', amount: 1500000, date: '2026-02-24', status: 'processing', bank: 'BCA' },
    { id: 'INC-9923', type: 'income', amount: 750000, date: '2026-02-24', status: 'completed', note: 'Order #ORD-889' },
];

export default function WalletsIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dompet & Keuangan" />
            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dompet Saya</h1>
                        <p className="text-muted-foreground">
                            Kelola saldo, pendapatan, dan penarikan dana toko Anda.
                        </p>
                    </div>
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="size-5" />
                        Tarik Dana
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* main Balance Card */}
                    <Card className="lg:col-span-2 overflow-hidden border-none bg-primary text-primary-foreground shadow-2xl relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Wallet className="size-48" />
                        </div>
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">
                                Saldo Tersedia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex flex-col gap-1">
                                <span className="text-5xl font-black tracking-tighter">
                                    {formatCurrency(walletData.withdrawable)}
                                </span>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary-foreground/60">Total Saldo</span>
                                        <span className="font-semibold">{formatCurrency(walletData.balance)}</span>
                                    </div>
                                    <div className="h-8 w-px bg-primary-foreground/20" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-primary-foreground/60">Dalam Proses</span>
                                        <span className="font-semibold">{formatCurrency(walletData.pending)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats & Bank */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm ring-1 ring-muted">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    Rekening Penarikan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm">{walletData.bankAccount.bankName}</div>
                                        <Badge variant="outline" className="bg-background text-[10px] h-5">Utama</Badge>
                                    </div>
                                    <div className="text-lg font-mono tracking-wider mb-1">{walletData.bankAccount.accountNumber}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase">{walletData.bankAccount.accountHolder}</div>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:bg-primary/5">
                                    Ubah Rekening
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-none shadow-sm ring-1 ring-muted p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Masuk</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(walletData.totalEarned)}</span>
                                </div>
                            </Card>
                            <Card className="border-none shadow-sm ring-1 ring-muted p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Earning Rate</span>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="size-3 text-green-500" />
                                        <span className="text-lg font-bold text-primary">+12%</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Transaction History Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="size-5 text-primary" />
                            <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-8">
                                Semua
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-8">
                                Pendapatan
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-8">
                                Penarikan
                            </Button>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm ring-1 ring-muted overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6 w-[200px]">ID Transaksi</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="group transition-colors hover:bg-muted/30">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold uppercase">{tx.id}</span>
                                                <span className="text-[10px] text-muted-foreground">{tx.note || `Bank ${tx.bank}`}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {tx.type === 'income' ? (
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                    <ArrowUpCircle className="size-4" />
                                                    Pendapatan
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                                                    <ArrowDownCircle className="size-4" />
                                                    Penarikan
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {tx.date}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {tx.status === 'completed' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                                                    <CheckCircle2 className="size-3" /> Berhasil
                                                </Badge>
                                            ) : tx.status === 'processing' ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 animate-pulse">
                                                    <Clock className="size-3" /> Diproses
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                                                    <Clock className="size-3" /> Menunggu
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Detail Transaksi</DropdownMenuItem>
                                                    <DropdownMenuItem>Download Resi</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Bantuan</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
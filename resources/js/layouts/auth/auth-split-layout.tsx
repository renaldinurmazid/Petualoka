import { auth_view } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    illustration?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    illustration = '/images/svg/shopping-ilustration.svg',
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
            {/* Header for Mobile */}
            <div className="flex w-full items-center justify-between p-6 lg:hidden">
                <Link
                    href={auth_view().url}
                    className="flex items-center gap-2 font-bold text-primary"
                >
                    <img
                        src="/images/svg/logo.svg"
                        alt="App Logo"
                        className="size-10"
                    />
                    <span className="text-xl">
                        <span className="text-slate-800 dark:text-slate-200">
                            Mitra
                        </span>{' '}
                        Petualoka
                    </span>
                </Link>
            </div>

            {/* Left Side - Illustration (Desktop) */}
            <div className="relative hidden w-1/2 flex-col items-center justify-center bg-muted/30 p-12 lg:flex">
                <div className="absolute top-12 left-12">
                    <Link
                        href={auth_view().url}
                        className="flex items-center gap-2 font-bold text-primary"
                    >
                        <img
                            src="/images/svg/logo.svg"
                            alt="App Logo"
                            className="size-10"
                        />
                        <span className="text-2xl tracking-tight">
                            <span className="text-slate-800 dark:text-slate-200">
                                Mitra
                            </span>{' '}
                            Petualoka
                        </span>
                    </Link>
                </div>

                <div className="z-10 flex flex-col items-center text-center">
                    <img
                        src={illustration}
                        alt="Auth Illustration"
                        className="mb-4 max-w-md animate-in drop-shadow-2xl duration-700 fade-in zoom-in"
                    />
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Kelola Bisnis Lebih Praktis. Raih Profit Lebih Maksimal.
                    </h2>
                    <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                        Bergabunglah sebagai Mitra Petualoka dan perluas
                        jangkauan pasar Anda dengan solusi manajemen perjalanan
                        yang terintegrasi.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-primary/5 to-transparent" />
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12 lg:p-24">
                <div className="w-full max-w-md animate-in space-y-8 duration-500 slide-in-from-right-4">
                    <div className="flex flex-col space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    {children}

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>
                            © {new Date().getFullYear()} Petualoka. All rights
                            reserved.
                        </p>
                        <div className="mt-2 flex justify-center gap-4">
                            <Link
                                href="#"
                                className="underline-offset-4 hover:text-primary hover:underline"
                            >
                                Syarat & Ketentuan
                            </Link>
                            <Link
                                href="#"
                                className="underline-offset-4 hover:text-primary hover:underline"
                            >
                                Kebijakan Privasi
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

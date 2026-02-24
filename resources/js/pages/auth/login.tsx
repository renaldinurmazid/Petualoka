import { store as loginStore } from '@/routes/login';
import { request } from '@/routes/password';
import { store as registerStore } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    return (
        <AuthLayout
            title={
                activeTab === 'login'
                    ? 'Selamat Datang Kembali'
                    : 'Gabung Bersama Kami'
            }
            description={
                activeTab === 'login'
                    ? 'Masuk ke Dashboard Mitra untuk mengelola bisnis Anda'
                    : 'Daftarkan bisnis Anda dan mulai kembangkan jangkauan bersama Petualoka'
            }
        >
            <Head title={activeTab === 'login' ? 'Log in' : 'Register'} />

            <div className="flex flex-col gap-8">
                {/* Tabs Switcher */}
                <div className="flex w-full border-b border-border/50">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={cn(
                            'relative flex-1 pb-4 text-sm font-semibold transition-all outline-none',
                            activeTab === 'login'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        Masuk Ke Akun
                        {activeTab === 'login' && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full animate-in bg-primary shadow-[0_0_8px_rgba(44,155,134,0.4)] duration-300 fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                    {canRegister && (
                        <button
                            onClick={() => setActiveTab('register')}
                            className={cn(
                                'relative flex-1 pb-4 text-sm font-semibold transition-all outline-none',
                                activeTab === 'register'
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Daftar Baru
                            {activeTab === 'register' && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full animate-in bg-primary shadow-[0_0_8px_rgba(44,155,134,0.4)] duration-300 fade-in slide-in-from-bottom-1" />
                            )}
                        </button>
                    )}
                </div>

                {/* Login Form */}
                <div
                    className={cn(
                        'transition-all duration-300',
                        activeTab === 'login'
                            ? 'block translate-x-0 opacity-100'
                            : 'hidden -translate-x-4 opacity-0',
                    )}
                >
                    <Form
                        {...loginStore.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-foreground/80"
                                        >
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="traveler@example.com"
                                            className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label
                                                htmlFor="password"
                                                title="Password"
                                                className="text-foreground/80"
                                            >
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="ml-auto text-xs font-medium text-primary hover:text-primary/80"
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi"
                                            className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm leading-none font-medium text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Ingat saya
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
                                        disabled={processing}
                                    >
                                        {processing && (
                                            <Spinner className="mr-2" />
                                        )}
                                        Masuk Sekarang
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Register Form */}
                {canRegister && (
                    <div
                        className={cn(
                            'transition-all duration-300',
                            activeTab === 'register'
                                ? 'block translate-x-0 opacity-100'
                                : 'hidden translate-x-4 opacity-0',
                        )}
                    >
                        <Form
                            {...registerStore.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-foreground/80"
                                            >
                                                Nama Lengkap
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="Nama lengkap Anda"
                                                className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="reg_email"
                                                className="text-foreground/80"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="reg_email"
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="traveler@example.com"
                                                className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="reg_password"
                                                title="Password"
                                                className="text-foreground/80"
                                            >
                                                Password
                                            </Label>
                                            <Input
                                                id="reg_password"
                                                type="password"
                                                name="password"
                                                required
                                                placeholder="Buat kata sandi yang kuat"
                                                className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-foreground/80"
                                            >
                                                Konfirmasi Password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                placeholder="Ulangi kata sandi"
                                                className="h-11 border-border/50 bg-muted/20 transition-colors focus:bg-background"
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-11 w-full font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
                                            disabled={processing}
                                        >
                                            {processing && (
                                                <Spinner className="mr-2" />
                                            )}
                                            Daftar Sekarang
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground">
                            Atau dengan
                        </span>
                    </div>
                </div>

                <div className="grid gap-4">
                    <Button
                        variant="outline"
                        className="h-11 w-full gap-3 border-border/50 font-semibold transition-all hover:bg-muted/30"
                    >
                        <svg className="size-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </Button>
                </div>
            </div>

            {status && (
                <div className="mt-4 rounded-md border border-green-100 bg-green-50 py-2 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}

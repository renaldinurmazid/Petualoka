import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';
import { store as loginStore } from '@/routes/login';
import { request } from '@/routes/password';
import { store as registerStore } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';

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
    const [showPassword, setShowPassword] = useState(false);

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
                {/* Tabs Switcher - Pill Style */}
                {canRegister && (
                    <div className="flex w-full rounded-xl bg-muted/50 p-1">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={cn(
                                'relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all outline-none',
                                activeTab === 'login'
                                    ? 'bg-background text-primary shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Masuk
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={cn(
                                'relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all outline-none',
                                activeTab === 'register'
                                    ? 'bg-background text-primary shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Daftar
                        </button>
                    </div>
                )}

                {/* Login Form */}
                {activeTab === 'login' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
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
                                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    autoComplete="email"
                                                    placeholder="traveler@example.com"
                                                    className="h-12 border-border/50 bg-muted/20 pl-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                                >
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-xs font-medium text-primary hover:underline"
                                                    >
                                                        Lupa Password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password"
                                                    required
                                                    autoComplete="current-password"
                                                    placeholder="Masukkan kata sandi"
                                                    className="h-12 border-border/50 bg-muted/20 px-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                className="rounded-md"
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-sm text-muted-foreground select-none"
                                            >
                                                Ingat saya di perangkat ini
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-12 w-full bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:translate-y-[-1px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2" />
                                            ) : (
                                                'Masuk Sekarang'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}

                {/* Register Form */}
                {canRegister && activeTab === 'register' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
                                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                Nama Lengkap
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    required
                                                    placeholder="Nama lengkap Anda"
                                                    className="h-12 border-border/50 bg-muted/20 pl-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="reg_email"
                                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="reg_email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="traveler@example.com"
                                                    className="h-12 border-border/50 bg-muted/20 pl-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="reg_password"
                                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="reg_password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password"
                                                    required
                                                    placeholder="Buat kata sandi yang kuat"
                                                    className="h-12 border-border/50 bg-muted/20 pl-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                            >
                                                Konfirmasi Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password_confirmation"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password_confirmation"
                                                    required
                                                    placeholder="Ulangi kata sandi"
                                                    className="h-12 border-border/50 bg-muted/20 pl-10 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-12 w-full bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:translate-y-[-1px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2" />
                                            ) : (
                                                'Daftar Sekarang'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}
            </div>

            {status && (
                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm font-medium text-primary animate-in fade-in zoom-in duration-300">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}

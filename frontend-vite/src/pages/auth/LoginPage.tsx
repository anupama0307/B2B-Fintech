import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import api from '@/services/api';

export default function LoginPage() {
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);

    const { updateUser } = useAuth();
    const navigate = useNavigate();

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            console.log('Login step 1 response:', response.data);

            if (response.data.otp_required) {
                // OTP was sent, move to step 2
                setStep('otp');
            }
        } catch (err: any) {
            console.error('Login error:', err.response?.data);
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            console.log('OTP verification response:', response.data);

            const userData = {
                id: response.data.user_id,
                email: response.data.email,
                full_name: response.data.full_name,
                role: response.data.role || 'user'
            };

            // Store tokens and user data
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update auth context
            updateUser(userData);

            // Navigate based on role
            const role = response.data.role || 'user';

            // Use window.location for clean navigation and context refresh
            window.location.href = role === 'admin' ? '/admin' : '/dashboard';
        } catch (err: any) {
            console.error('OTP verification error:', err.response?.data);
            setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        setError('');

        try {
            await api.post('/auth/resend-otp', null, { params: { email } });
            alert('New OTP sent to your email. Check backend console for OTP.');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    const handleBack = () => {
        setStep('credentials');
        setOtp('');
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {step === 'credentials' ? (
                            <Shield className="w-10 h-10 text-primary-foreground" />
                        ) : (
                            <KeyRound className="w-10 h-10 text-primary-foreground" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 'credentials' ? 'Welcome Back' : 'Enter OTP'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {step === 'credentials'
                            ? 'Sign in to your RISKOFF account'
                            : `We sent a 6-digit code to ${email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                            <div>
                                <Label className="text-base font-medium">Email</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="h-12 pl-12 text-base"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-base font-medium">Password</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="h-12 pl-12 pr-12 text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <div>
                                <Label className="text-base font-medium">6-Digit OTP</Label>
                                <div className="relative mt-2">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        required
                                        maxLength={6}
                                        className="h-14 pl-12 text-center text-2xl tracking-widest font-mono"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Check the backend console for the OTP code
                                </p>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>

                            <div className="flex items-center justify-between mt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBack}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={handleResendOtp}
                                    disabled={resending}
                                >
                                    {resending ? 'Resending...' : 'Resend OTP'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-center mt-6 text-base text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

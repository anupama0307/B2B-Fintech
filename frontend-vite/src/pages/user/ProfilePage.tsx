import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Mail, Phone, MapPin, Briefcase, Building, Clock,
    Wallet, Save, X, CheckCircle, TrendingUp, CreditCard,
    PiggyBank, BarChart3, IndianRupee, AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Profile {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    occupation?: string;
    employer_name?: string;
    employment_years?: number;
    annual_income?: number;
    monthly_expenses?: number;
    account_balance?: number;
    mutual_funds?: number;
    stocks?: number;
    fixed_deposits?: number;
    existing_loans?: number;
    existing_loan_amount?: number;
}

interface Dashboard {
    customer_score?: number;
    profile_completed?: boolean;
    total_assets?: number;
    investments?: {
        mutual_funds?: number;
        stocks?: number;
        fixed_deposits?: number;
    };
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState<Profile>({});
    const isAdmin = user?.role === 'admin';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [profileRes, dashboardRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/user/dashboard')
            ]);
            setProfile(profileRes.data);
            setDashboard(dashboardRes.data);
            setFormData(profileRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: type === 'number' ? (parseFloat(value) || 0) : value }));
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        if (formData.phone && formData.phone.length !== 10) {
            setError('Phone number must be 10 digits');
            return;
        }
        setSaving(true);
        try {
            const payload = isAdmin ? { full_name: formData.full_name, phone: formData.phone, city: formData.city } : formData;
            const response = await api.put('/user/profile', payload);
            setProfile(response.data.profile || formData);
            setEditing(false);
            setSuccess('Profile saved successfully!');

            // Update navbar user info
            if (formData.full_name && updateUser) {
                updateUser({ ...user, full_name: formData.full_name });
            }

            setTimeout(() => setSuccess(''), 3000);
            fetchData();
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;
    }

    const scoreColor = (dashboard?.customer_score || 0) >= 650
        ? '#10B981'
        : (dashboard?.customer_score || 0) >= 550
            ? '#F59E0B'
            : '#EF4444';

    // Calculate summary values
    const totalInvestments = (profile?.mutual_funds || 0) + (profile?.stocks || 0) + (profile?.fixed_deposits || 0);
    const netWorth = (profile?.account_balance || 0) + totalInvestments - (profile?.existing_loan_amount || 0);
    const monthlyIncome = profile?.annual_income ? profile.annual_income / 12 : 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - (profile?.monthly_expenses || 0)) / monthlyIncome * 100) : 0;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">My Profile</h1>
                            <p className="text-lg text-muted-foreground mt-1">
                                {isAdmin ? 'Administrator Account' : 'Manage your personal and financial information'}
                            </p>
                        </div>
                        {!editing ? (
                            <Button size="lg" onClick={() => setEditing(true)} className="gap-2">
                                <User className="w-5 h-5" /> Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <Button variant="secondary" size="lg" onClick={() => { setEditing(false); setFormData(profile || {}); setError(''); }} className="gap-2">
                                    <X className="w-5 h-5" /> Cancel
                                </Button>
                                <Button size="lg" onClick={handleSave} disabled={saving} className="gap-2">
                                    <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </div>
                    )}

                    {/* Summary Cards - Only for non-admin users */}
                    {!isAdmin && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/20 rounded-lg">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Credit Score</p>
                                            <p className="text-2xl font-bold" style={{ color: scoreColor }}>{dashboard?.customer_score || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-green-500/20 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Net Worth</p>
                                            <p className="text-xl font-bold text-green-600">₹{netWorth.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-500/20 rounded-lg">
                                            <PiggyBank className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Investments</p>
                                            <p className="text-xl font-bold text-purple-600">₹{totalInvestments.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-amber-500/20 rounded-lg">
                                            <Wallet className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Bank Balance</p>
                                            <p className="text-xl font-bold text-amber-600">₹{(profile?.account_balance || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                                            <IndianRupee className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Savings Rate</p>
                                            <p className="text-xl font-bold text-cyan-600">{savingsRate.toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Personal Info */}
                        <Card className={isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" /> Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                                            <User className="w-4 h-4" /> Full Name
                                        </Label>
                                        {editing ? (
                                            <Input name="full_name" value={formData.full_name || ''} onChange={handleChange} className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.full_name || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                                            <Mail className="w-4 h-4" /> Email
                                        </Label>
                                        <p className="text-lg font-medium text-muted-foreground">{profile?.email}</p>
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                                            <Phone className="w-4 h-4" /> Phone
                                        </Label>
                                        {editing ? (
                                            <Input name="phone" value={formData.phone || ''} onChange={handleChange} maxLength={10} placeholder="10 digits" className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.phone || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                                            <MapPin className="w-4 h-4" /> City
                                        </Label>
                                        {editing ? (
                                            <Input name="city" value={formData.city || ''} onChange={handleChange} className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.city || 'Not provided'}</p>
                                        )}
                                    </div>
                                    {!isAdmin && (
                                        <>
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">State</Label>
                                                {editing ? (
                                                    <Input name="state" value={formData.state || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-medium">{profile?.state || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Pincode</Label>
                                                {editing ? (
                                                    <Input name="pincode" value={formData.pincode || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-medium">{profile?.pincode || 'Not provided'}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment */}
                        {!isAdmin && (
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5" /> Employment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Occupation</Label>
                                        {editing ? (
                                            <Input name="occupation" value={formData.occupation || ''} onChange={handleChange} className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.occupation || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Employer</Label>
                                        {editing ? (
                                            <Input name="employer_name" value={formData.employer_name || ''} onChange={handleChange} className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.employer_name || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Years at Job</Label>
                                        {editing ? (
                                            <Input type="number" name="employment_years" value={formData.employment_years || 0} onChange={handleChange} className="h-11" />
                                        ) : (
                                            <p className="text-lg font-medium">{profile?.employment_years || 0} years</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Financial Info */}
                        {!isAdmin && (
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5" /> Financial Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Annual Income</Label>
                                            {editing ? (
                                                <Input type="number" name="annual_income" value={formData.annual_income || ''} onChange={handleChange} className="h-11" placeholder="Min ₹50,000" />
                                            ) : (
                                                <p className="text-lg font-semibold text-green-600">₹{(profile?.annual_income || 0).toLocaleString('en-IN')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Monthly Expenses</Label>
                                            {editing ? (
                                                <Input type="number" name="monthly_expenses" value={formData.monthly_expenses || ''} onChange={handleChange} className="h-11" />
                                            ) : (
                                                <p className="text-lg font-semibold text-red-600">₹{(profile?.monthly_expenses || 0).toLocaleString('en-IN')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Account Balance</Label>
                                            {editing ? (
                                                <Input type="number" name="account_balance" value={formData.account_balance || ''} onChange={handleChange} className="h-11" />
                                            ) : (
                                                <p className="text-lg font-semibold text-blue-600">₹{(profile?.account_balance || 0).toLocaleString('en-IN')}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Existing Loans</Label>
                                            {editing ? (
                                                <Input type="number" name="existing_loans" value={formData.existing_loans || 0} onChange={handleChange} className="h-11" />
                                            ) : (
                                                <p className="text-lg font-semibold">{profile?.existing_loans || 0}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t mt-6 pt-6">
                                        <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                                            <PiggyBank className="w-5 h-5" /> Investments
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Mutual Funds</Label>
                                                {editing ? (
                                                    <Input type="number" name="mutual_funds" value={formData.mutual_funds || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-semibold text-purple-600">₹{(profile?.mutual_funds || 0).toLocaleString('en-IN')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Stocks</Label>
                                                {editing ? (
                                                    <Input type="number" name="stocks" value={formData.stocks || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-semibold text-purple-600">₹{(profile?.stocks || 0).toLocaleString('en-IN')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Fixed Deposits</Label>
                                                {editing ? (
                                                    <Input type="number" name="fixed_deposits" value={formData.fixed_deposits || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-semibold text-purple-600">₹{(profile?.fixed_deposits || 0).toLocaleString('en-IN')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium mb-2 block">Outstanding Loans</Label>
                                                {editing ? (
                                                    <Input type="number" name="existing_loan_amount" value={formData.existing_loan_amount || ''} onChange={handleChange} className="h-11" />
                                                ) : (
                                                    <p className="text-lg font-semibold text-orange-600">₹{(profile?.existing_loan_amount || 0).toLocaleString('en-IN')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Calendar, IndianRupee, Heart, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

interface Policy {
    policy_type: string;
    policy_name: string;
    policy_number: string;
    sum_assured: number;
    premium_amount: number;
    premium_frequency: string;
    start_date: string;
    maturity_date: string;
    tenure_years: number;
    status: string;
    covers?: string[];
    nominee?: string;
}

export default function InsurancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ policies: Policy[], summary: any } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/insurance')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/investments">
                            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Shield className="w-8 h-8 text-teal-600" /> Insurance
                            </h1>
                            <p className="text-muted-foreground">Life, Health & General Insurance policies</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Active Policies</p>
                                <p className="text-3xl font-bold">{data?.summary?.total_policies || 0}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Total Coverage</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data?.summary?.total_coverage || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Annual Premium</p>
                                <p className="text-2xl font-bold text-purple-600">{formatCurrency(data?.summary?.total_annual_premium || 0)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Policy Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {data?.policies.map((policy, i) => (
                            <Card key={i} className={`bg-gradient-to-br ${policy.policy_type === 'LIFE' ? 'from-indigo-500/5 to-purple-500/5 border-indigo-500/20' : 'from-teal-500/5 to-green-500/5 border-teal-500/20'}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${policy.policy_type === 'LIFE' ? 'bg-indigo-500/20' : 'bg-teal-500/20'}`}>
                                                {policy.policy_type === 'LIFE' ? <Umbrella className="w-6 h-6 text-indigo-600" /> : <Heart className="w-6 h-6 text-teal-600" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{policy.policy_name}</p>
                                                <p className="text-sm text-muted-foreground">{policy.policy_number}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${policy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {policy.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">Sum Assured</p>
                                            <p className="text-xl font-bold">{formatCurrency(policy.sum_assured)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">Premium ({policy.premium_frequency})</p>
                                            <p className="text-xl font-bold">{formatCurrency(policy.premium_amount)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>Start: {new Date(policy.start_date).toLocaleDateString('en-IN')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>Maturity: {new Date(policy.maturity_date).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {policy.covers && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground mb-2">Covers:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {policy.covers.map((cover, j) => (
                                                    <span key={j} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">{cover}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {policy.nominee && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">Nominee: <span className="font-medium text-foreground">{policy.nominee}</span></p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Calendar, Percent, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/services/api';

interface Deposit {
    type: string;
    bank_name: string;
    account_number_masked: string;
    principal_amount: number;
    current_value: number;
    interest_rate: number;
    maturity_date: string;
    opening_date: string;
    tenure_months: number;
    status: string;
}

export default function DepositsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ deposits: Deposit[], summary: any } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/deposits')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    const chartData = data?.deposits.map(d => ({
        name: d.type.replace('_', ' '),
        principal: d.principal_amount,
        current: d.current_value
    })) || [];

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
                                <Building2 className="w-8 h-8 text-amber-600" /> Deposits
                            </h1>
                            <p className="text-muted-foreground">Fixed Deposits, Recurring Deposits & more</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Total Invested</p>
                                <p className="text-2xl font-bold">{formatCurrency(data?.summary?.total_invested || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Current Value</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.summary?.current_value || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Interest Earned</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.summary?.total_interest || 0)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart */}
                        <Card>
                            <CardHeader><CardTitle>Principal vs Current Value</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                            <Bar dataKey="principal" fill="#f59e0b" name="Principal" />
                                            <Bar dataKey="current" fill="#22c55e" name="Current" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Deposits List */}
                        <Card>
                            <CardHeader><CardTitle>Your Deposits</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {data?.deposits.map((dep, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-bold">{dep.bank_name}</p>
                                                <p className="text-sm text-muted-foreground">{dep.type.replace('_', ' ')}</p>
                                            </div>
                                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">{dep.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Principal</p>
                                                    <p className="font-medium">{formatCurrency(dep.principal_amount)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Interest Rate</p>
                                                    <p className="font-medium">{dep.interest_rate}% p.a.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-muted-foreground">Maturity</p>
                                                    <p className="font-medium">{new Date(dep.maturity_date).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Current Value</p>
                                                <p className="font-bold text-green-600">{formatCurrency(dep.current_value)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

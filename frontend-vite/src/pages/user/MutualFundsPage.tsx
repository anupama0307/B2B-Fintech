import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, ArrowLeft, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/services/api';

interface MutualFund {
    scheme_name: string;
    amc: string;
    folio_number: string;
    units: number;
    nav: number;
    invested_value: number;
    current_value: number;
    returns_percentage: number;
    scheme_type: string;
    mode: string;
}

export default function MutualFundsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ holdings: MutualFund[], summary: any } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/mutual-funds')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    const chartData = data?.holdings.map(h => ({
        name: h.scheme_name.split(' ').slice(0, 2).join(' '),
        invested: h.invested_value,
        current: h.current_value
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
                                <BarChart3 className="w-8 h-8 text-blue-600" /> Mutual Funds
                            </h1>
                            <p className="text-muted-foreground">Your mutual fund portfolio</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
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
                                <p className="text-sm text-muted-foreground">Total Gain</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.summary?.total_gain || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Overall Returns</p>
                                <p className="text-2xl font-bold text-purple-600">+{data?.summary?.overall_returns || 0}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invested vs Current Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical">
                                            <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                            <YAxis type="category" dataKey="name" width={100} />
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                            <Bar dataKey="invested" fill="#6366f1" name="Invested" />
                                            <Bar dataKey="current" fill="#22c55e" name="Current" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Holdings List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Holdings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data?.holdings.map((mf, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold">{mf.scheme_name}</p>
                                                <p className="text-sm text-muted-foreground">{mf.amc}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${mf.scheme_type === 'EQUITY' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {mf.scheme_type}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Invested</p>
                                                <p className="font-medium">{formatCurrency(mf.invested_value)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Current</p>
                                                <p className="font-medium text-green-600">{formatCurrency(mf.current_value)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Returns</p>
                                                <p className="font-medium text-emerald-600">+{mf.returns_percentage}%</p>
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

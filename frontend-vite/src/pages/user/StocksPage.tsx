import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ArrowLeft, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/services/api';

interface Stock {
    symbol: string;
    company_name: string;
    exchange: string;
    quantity: number;
    avg_buy_price: number;
    current_price: number;
    invested_value: number;
    current_value: number;
    returns_percentage: number;
}

export default function StocksPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ holdings: Stock[], summary: any } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/stocks')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    const chartData = data?.holdings.map(h => ({
        name: h.symbol,
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
                                <TrendingUp className="w-8 h-8 text-green-600" /> Stocks & Equity
                            </h1>
                            <p className="text-muted-foreground">Your stock portfolio</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Total Invested</p>
                                <p className="text-2xl font-bold">{formatCurrency(data?.summary?.total_invested || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Current Value</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.summary?.current_value || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Total Gain</p>
                                <p className="text-2xl font-bold text-teal-600">{formatCurrency(data?.summary?.total_gain || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
                            <CardContent className="pt-5 pb-4">
                                <p className="text-sm text-muted-foreground">Overall Returns</p>
                                <p className="text-2xl font-bold text-cyan-600">+{data?.summary?.overall_returns || 0}%</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                            <Bar dataKey="invested" fill="#6366f1" name="Invested" />
                                            <Bar dataKey="current" fill="#22c55e" name="Current" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Holdings */}
                        <Card>
                            <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {data?.holdings.map((stock, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-lg">{stock.symbol}</p>
                                                <p className="text-sm text-muted-foreground">{stock.company_name}</p>
                                            </div>
                                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">{stock.exchange}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Qty</p>
                                                <p className="font-medium">{stock.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Avg Price</p>
                                                <p className="font-medium">₹{stock.avg_buy_price.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">CMP</p>
                                                <p className="font-medium text-green-600">₹{stock.current_price.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">P&L</p>
                                                <p className="font-medium text-emerald-600">+{stock.returns_percentage}%</p>
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

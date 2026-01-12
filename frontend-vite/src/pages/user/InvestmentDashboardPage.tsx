import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, TrendingDown, PieChart, Wallet, Building2,
    Shield, Landmark, BarChart3, Calendar, IndianRupee, ArrowUpRight
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/services/api';

interface AllocationItem {
    name: string;
    value: number;
    percentage: number;
}

interface MaturityItem {
    type: string;
    name: string;
    maturity_date: string;
    maturity_amount: number;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function InvestmentDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [maturities, setMaturities] = useState<MaturityItem[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [portfolioRes, maturityRes] = await Promise.all([
                api.get('/investments/portfolio'),
                api.get('/investments/maturity-calendar')
            ]);
            setPortfolio(portfolioRes.data);
            setMaturities(maturityRes.data.maturities || []);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load investment data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8"><LoadingSpinner /></main>
                </div>
            </div>
        );
    }

    const isPositiveGain = portfolio?.summary?.gain_percentage >= 0;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <PieChart className="w-8 h-8 text-primary" />
                            Investment Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">Track all your investments in one place</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                                        <Wallet className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Invested</p>
                                        <p className="text-2xl font-bold">{formatCurrency(portfolio?.summary?.total_invested || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <IndianRupee className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Value</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(portfolio?.total_value || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={`bg-gradient-to-br ${isPositiveGain ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 ${isPositiveGain ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-xl`}>
                                        {isPositiveGain ? <TrendingUp className="w-6 h-6 text-emerald-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Gain</p>
                                        <p className={`text-2xl font-bold ${isPositiveGain ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(portfolio?.summary?.total_gain || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <BarChart3 className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Returns</p>
                                        <p className={`text-2xl font-bold ${isPositiveGain ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isPositiveGain ? '+' : ''}{portfolio?.summary?.gain_percentage?.toFixed(1) || 0}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Portfolio Allocation Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="w-5 h-5" /> Portfolio Allocation
                                </CardTitle>
                                <CardDescription>Distribution across asset classes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                            <Pie
                                                data={portfolio?.allocation || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                            >
                                                {(portfolio?.allocation || []).map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {(portfolio?.allocation || []).map((item: AllocationItem, index: number) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Access Cards */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Investment Categories</CardTitle>
                                <CardDescription>Quick access to your investments</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Link to="/investments/mutual-funds">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:bg-blue-500/15 transition-colors cursor-pointer">
                                        <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                                        <p className="font-semibold">Mutual Funds</p>
                                        <p className="text-sm text-muted-foreground">View holdings</p>
                                    </div>
                                </Link>
                                <Link to="/investments/stocks">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:bg-green-500/15 transition-colors cursor-pointer">
                                        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                                        <p className="font-semibold">Stocks</p>
                                        <p className="text-sm text-muted-foreground">Equity portfolio</p>
                                    </div>
                                </Link>
                                <Link to="/investments/deposits">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:bg-amber-500/15 transition-colors cursor-pointer">
                                        <Building2 className="w-8 h-8 text-amber-600 mb-2" />
                                        <p className="font-semibold">Deposits</p>
                                        <p className="text-sm text-muted-foreground">FD, RD & more</p>
                                    </div>
                                </Link>
                                <Link to="/investments/pension">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:bg-purple-500/15 transition-colors cursor-pointer">
                                        <Landmark className="w-8 h-8 text-purple-600 mb-2" />
                                        <p className="font-semibold">Pension</p>
                                        <p className="text-sm text-muted-foreground">EPF, PPF, NPS</p>
                                    </div>
                                </Link>
                                <Link to="/investments/insurance">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-500/20 hover:bg-teal-500/15 transition-colors cursor-pointer">
                                        <Shield className="w-8 h-8 text-teal-600 mb-2" />
                                        <p className="font-semibold">Insurance</p>
                                        <p className="text-sm text-muted-foreground">Life & Health</p>
                                    </div>
                                </Link>
                                <Link to="/transactions">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 hover:bg-pink-500/15 transition-colors cursor-pointer col-span-2">
                                        <BarChart3 className="w-8 h-8 text-pink-600 mb-2" />
                                        <p className="font-semibold">Transaction Analytics</p>
                                        <p className="text-sm text-muted-foreground">UPI, Credit/Debit & PhonePe Pulse comparison</p>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Maturity Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> Upcoming Maturities
                            </CardTitle>
                            <CardDescription>Track when your investments mature</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {maturities.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No upcoming maturities</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-medium">Type</th>
                                                <th className="text-left py-3 px-4 font-medium">Investment</th>
                                                <th className="text-left py-3 px-4 font-medium">Maturity Date</th>
                                                <th className="text-right py-3 px-4 font-medium">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {maturities.slice(0, 5).map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium">{item.name}</td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {new Date(item.maturity_date).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                                                        {formatCurrency(item.maturity_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

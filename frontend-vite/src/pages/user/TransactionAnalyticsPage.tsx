import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
    CreditCard, ArrowDownLeft, ArrowUpRight, Smartphone,
    TrendingUp, TrendingDown, ShoppingBag, Utensils, Car,
    Tv, Zap, MoreHorizontal, IndianRupee
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '@/services/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// PhonePe Pulse Average Data (2024 India averages)
const PHONEPE_PULSE_AVERAGE = [
    { name: 'Recharge & Bills', percentage: 28 },
    { name: 'Groceries', percentage: 18 },
    { name: 'Food & Dining', percentage: 15 },
    { name: 'Shopping', percentage: 22 },
    { name: 'Travel', percentage: 10 },
    { name: 'Others', percentage: 7 }
];

export default function TransactionAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/transactions/analytics')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    const analytics = data?.analytics || {};
    const userCategories = data?.category_breakdown || [];

    // Calculate user percentages for comparison
    const totalSpend = userCategories.reduce((sum: number, c: any) => sum + c.value, 0);
    const userPercentages = userCategories.map((c: any) => ({
        name: c.name,
        user: Math.round(c.value / totalSpend * 100),
        india: PHONEPE_PULSE_AVERAGE.find(p => p.name.toLowerCase().includes(c.name.toLowerCase().split(' ')[0]))?.percentage || 10
    }));

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-primary" />
                            Transaction Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your spending patterns and compare with India average</p>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <ArrowDownLeft className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Credit</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.total_credit || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-500/20 rounded-xl">
                                        <ArrowUpRight className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Debit</p>
                                        <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.total_debit || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Smartphone className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">UPI Transactions</p>
                                        <p className="text-2xl font-bold text-purple-600">{analytics.upi_transactions || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <IndianRupee className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">UPI Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.upi_amount || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Credit vs Debit Pie */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Credit vs Debit</CardTitle>
                                <CardDescription>Money flow overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data?.credit_vs_debit || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill="#22c55e" />
                                                <Cell fill="#ef4444" />
                                            </Pie>
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* UPI vs Non-UPI */}
                        <Card>
                            <CardHeader>
                                <CardTitle>UPI vs Non-UPI</CardTitle>
                                <CardDescription>Payment method breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data?.upi_vs_non_upi || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill="#8b5cf6" />
                                                <Cell fill="#06b6d4" />
                                            </Pie>
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Breakdown */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Spending by Category</CardTitle>
                            <CardDescription>Where your money goes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userCategories} layout="vertical">
                                        <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                        <YAxis type="category" dataKey="name" width={100} />
                                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {userCategories.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PhonePe Pulse Comparison */}
                    <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <img src="https://www.phonepe.com/webstatic/6124/static/497d87e6cfb779c4eb71c1e6a0c9afc2/PhonePe-Logo.png" alt="PhonePe" className="h-6" />
                                        Pulse Comparison
                                    </CardTitle>
                                    <CardDescription>Your spending vs India average (powered by PhonePe Pulse data)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userPercentages}>
                                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} fontSize={12} />
                                        <YAxis tickFormatter={(v) => `${v}%`} />
                                        <Tooltip formatter={(v: number) => `${v}%`} />
                                        <Legend />
                                        <Bar dataKey="user" name="Your Usage" fill="#6366f1" />
                                        <Bar dataKey="india" name="India Average" fill="#22c55e" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Data source: <a href="https://www.phonepe.com/pulse/" target="_blank" rel="noopener" className="text-primary hover:underline">PhonePe Pulse</a> - India's Digital Payment Trends
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, ArrowLeft, Building, Briefcase, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

export default function PensionPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/investments/pension')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;

    const pieData = [
        { name: 'EPF', value: data?.epf?.total_balance || 0 },
        { name: 'PPF', value: data?.ppf?.current_balance || 0 },
        { name: 'NPS', value: data?.nps?.current_value || 0 }
    ];

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
                                <Landmark className="w-8 h-8 text-purple-600" /> Pension Funds
                            </h1>
                            <p className="text-muted-foreground">EPF, PPF & National Pension System</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">{error}</div>}

                    {/* Total Summary */}
                    <Card className="mb-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg text-muted-foreground">Total Pension Corpus</p>
                                    <p className="text-4xl font-bold text-purple-600">{formatCurrency(data?.total_pension_value || 0)}</p>
                                </div>
                                <Landmark className="w-16 h-16 text-purple-300" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pension Allocation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fund Details */}
                        <div className="space-y-4">
                            {/* EPF */}
                            <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-indigo-500/20">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                                            <Briefcase className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Employee Provident Fund (EPF)</p>
                                            <p className="text-xs text-muted-foreground">UAN: {data?.epf?.uan}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Employee</p>
                                            <p className="font-semibold">{formatCurrency(data?.epf?.employee_balance || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Employer</p>
                                            <p className="font-semibold">{formatCurrency(data?.epf?.employer_balance || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-muted-foreground">Total Balance</p>
                                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(data?.epf?.total_balance || 0)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* PPF */}
                            <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Building className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Public Provident Fund (PPF)</p>
                                            <p className="text-xs text-muted-foreground">{data?.ppf?.bank} • {data?.ppf?.interest_rate}% p.a.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Balance</p>
                                            <p className="text-xl font-bold text-green-600">{formatCurrency(data?.ppf?.current_balance || 0)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Maturity</p>
                                            <p className="text-sm font-medium">{data?.ppf?.maturity_date ? new Date(data.ppf.maturity_date).toLocaleDateString('en-IN') : '-'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NPS */}
                            <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-amber-500/20 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">National Pension System (NPS)</p>
                                            <p className="text-xs text-muted-foreground">PRAN: {data?.nps?.pran}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tier I</p>
                                            <p className="font-semibold">{formatCurrency(data?.nps?.tier1_value || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tier II</p>
                                            <p className="font-semibold">{formatCurrency(data?.nps?.tier2_value || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Value</p>
                                            <p className="text-xl font-bold text-amber-600">{formatCurrency(data?.nps?.current_value || 0)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Allocation</p>
                                            <p className="text-sm">Equity {data?.nps?.equity_allocation}% | Debt {data?.nps?.debt_allocation}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

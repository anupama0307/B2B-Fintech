import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    LayoutDashboard,
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    IndianRupee,
    TrendingUp,
    MessageSquare,
    Target,
    ArrowRight,
    BarChart3,
    Users
} from 'lucide-react';
import api from '@/services/api';

interface AdminStats {
    total_loans: number;
    pending_loans: number;
    approved_loans: number;
    rejected_loans: number;
    total_volume: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            console.log('Admin stats response:', response.data);
            setStats(response.data);
        } catch (err: any) {
            console.error('Error fetching admin stats:', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
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

    const totalLoans = stats?.total_loans || 0;
    const approvedLoans = stats?.approved_loans || 0;
    const pendingLoans = stats?.pending_loans || 0;
    const rejectedLoans = stats?.rejected_loans || 0;
    const totalVolume = stats?.total_volume || 0;
    const approvalRate = totalLoans > 0 ? Math.round((approvedLoans / totalLoans) * 100) : 0;

    const statCards = [
        { label: 'Total Applications', value: totalLoans, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Approved', value: approvedLoans, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Pending', value: pendingLoans, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
        { label: 'Rejected', value: rejectedLoans, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    ];

    const quickActions = [
        { path: '/admin/loans', label: 'Manage Loans', icon: ClipboardList, desc: 'Review applications' },
        { path: '/admin/grievances', label: 'Grievances', icon: MessageSquare, desc: 'Handle complaints' },
        { path: '/admin/risk-analysis', label: 'Risk Analysis', icon: Target, desc: 'Analyze borrowers' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-lg text-muted-foreground mt-1">Overview of loan applications and system status</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={idx} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                                <Icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-base text-muted-foreground">{stat.label}</p>
                                                <p className="text-2xl font-bold">{stat.value}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Volume and Rate Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-xl bg-primary/20">
                                        <IndianRupee className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-base text-muted-foreground">Total Loan Volume</p>
                                        <p className="text-3xl font-bold">Rs. {totalVolume.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-xl bg-green-500/20">
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-base text-muted-foreground">Approval Rate</p>
                                        <p className="text-3xl font-bold">{approvalRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.path}
                                            to={action.path}
                                            className="group p-5 border rounded-xl hover:bg-muted hover:border-primary/50 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <div>
                                                    <p className="text-base font-semibold">{action.label}</p>
                                                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

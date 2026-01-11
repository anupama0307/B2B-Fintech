import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Wallet,
    ClipboardList,
    Mic,
    ScanLine,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowRight,
    IndianRupee,
    XCircle
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Loan {
    id: string;
    amount?: number;
    loan_amount?: number;
    purpose?: string;
    status?: string;
    tenure_months?: number;
    emi?: number;
    created_at?: string;
}

export default function UserDashboard() {
    const { user } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, [user?.full_name]); // Refetch when user name changes

    const fetchLoans = async () => {
        try {
            const response = await api.get('/loans/my-loans');
            const loansData = response.data?.loans || response.data || [];
            setLoans(Array.isArray(loansData) ? loansData : []);
        } catch (error) {
            console.error('Error fetching loans:', error);
            setLoans([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (s === 'rejected') return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    };

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return <CheckCircle className="w-4 h-4" />;
        if (s === 'rejected') return <XCircle className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
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

    // Calculate stats
    const totalLoans = loans.length;
    const approvedLoans = loans.filter(l => l.status?.toLowerCase() === 'approved').length;
    const pendingLoans = loans.filter(l => l.status?.toLowerCase() === 'pending').length;
    const rejectedLoans = loans.filter(l => l.status?.toLowerCase() === 'rejected').length;
    const totalAmount = loans.reduce((sum, l) => sum + (l.amount || l.loan_amount || 0), 0);
    const approvedAmount = loans
        .filter(l => l.status?.toLowerCase() === 'approved')
        .reduce((sum, l) => sum + (l.amount || l.loan_amount || 0), 0);

    const stats = [
        { label: 'Total Applications', value: totalLoans, icon: ClipboardList, color: 'text-blue-600' },
        { label: 'Approved', value: approvedLoans, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Pending', value: pendingLoans, icon: Clock, color: 'text-yellow-600' },
        { label: 'Total Requested', value: `₹${totalAmount.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-primary' },
    ];

    const quickActions = [
        { path: '/apply-loan', label: 'Apply for Loan', icon: Wallet, desc: 'Get funds quickly' },
        { path: '/my-loans', label: 'My Loans', icon: ClipboardList, desc: 'Track applications' },
        { path: '/voice', label: 'Voice Assistant', icon: Mic, desc: 'Ask questions' },
        { path: '/scan', label: 'Scan Document', icon: ScanLine, desc: 'Upload receipts' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome, {user?.full_name || 'User'}</h1>
                            <p className="text-lg text-muted-foreground mt-1">Here's your loan overview</p>
                        </div>
                        <Button size="lg" asChild className="gap-2">
                            <Link to="/apply-loan">
                                <Wallet className="w-5 h-5" />
                                Apply for Loan
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={idx} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                                <p className="text-2xl font-bold">{stat.value}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Approved Amount Highlight */}
                    {approvedAmount > 0 && (
                        <Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-xl bg-green-100 dark:bg-green-800/50">
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Approved Amount</p>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">₹{approvedAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.path}
                                    to={action.path}
                                    className="group p-5 border rounded-xl hover:bg-muted hover:border-primary/50 transition-all"
                                >
                                    <Icon className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <h3 className="font-semibold text-base">{action.label}</h3>
                                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Loans Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-xl">Recent Loans</CardTitle>
                            <Button variant="ghost" size="sm" asChild className="gap-1">
                                <Link to="/my-loans">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loans.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                    <p className="text-lg text-muted-foreground mb-4">No loan applications yet</p>
                                    <Button asChild><Link to="/apply-loan">Apply Now</Link></Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">ID</th>
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">Amount</th>
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">Purpose</th>
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">EMI</th>
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">Status</th>
                                                <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loans.slice(0, 5).map((loan) => (
                                                <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/50 transition">
                                                    <td className="py-4 px-3 text-sm font-medium">#{String(loan.id).slice(0, 8)}</td>
                                                    <td className="py-4 px-3 text-sm font-semibold">₹{(loan.amount || loan.loan_amount || 0).toLocaleString('en-IN')}</td>
                                                    <td className="py-4 px-3 text-sm capitalize">{loan.purpose || 'General'}</td>
                                                    <td className="py-4 px-3 text-sm">₹{loan.emi?.toLocaleString('en-IN') || 'N/A'}</td>
                                                    <td className="py-4 px-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(loan.status || 'pending')}`}>
                                                            {getStatusIcon(loan.status || 'pending')}
                                                            {(loan.status || 'PENDING').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3 text-sm text-muted-foreground">
                                                        {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardList, Wallet, IndianRupee, Calendar, CheckCircle, XCircle, Clock, Target, FileText, ArrowRight } from 'lucide-react';
import api from '@/services/api';

interface Loan {
    id: string;
    amount?: number;
    loan_amount?: number;
    purpose?: string;
    status?: string;
    tenure_months?: number;
    emi?: number;
    risk_score?: number;
    ai_explanation?: string;
    created_at?: string;
}

export default function MyLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

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

    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (s === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
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

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">My Loans</h1>
                            <p className="text-lg text-muted-foreground mt-1">{loans.length} loan application{loans.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Button size="lg" asChild className="gap-2">
                            <Link to="/apply-loan">
                                <Wallet className="w-5 h-5" />
                                Apply for New Loan
                            </Link>
                        </Button>
                    </div>

                    {loans.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-xl font-medium mb-2">No loan applications yet</p>
                                <p className="text-base text-muted-foreground mb-6">Start your first loan application today</p>
                                <Button size="lg" asChild className="gap-2">
                                    <Link to="/apply-loan">
                                        <Wallet className="w-5 h-5" />
                                        Apply Now
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {loans.map((loan) => (
                                <Card key={loan.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${getStatusStyle(loan.status || 'pending')}`}>
                                                        {getStatusIcon(loan.status || 'pending')}
                                                        {(loan.status || 'PENDING').toUpperCase()}
                                                    </span>
                                                    <span className="text-base text-muted-foreground">
                                                        ID: #{String(loan.id).slice(0, 8)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <IndianRupee className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Amount</p>
                                                            <p className="text-base font-semibold">Rs. {(loan.amount || loan.loan_amount || 0).toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Tenure</p>
                                                            <p className="text-base font-semibold">{loan.tenure_months || 0} months</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Wallet className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">EMI</p>
                                                            <p className="text-base font-semibold">Rs. {loan.emi?.toLocaleString('en-IN') || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-5 h-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Risk Score</p>
                                                            <p className="text-base font-semibold">{loan.risk_score || 0}/100</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {loan.purpose && (
                                                    <div className="flex items-start gap-2 mt-4">
                                                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Purpose</p>
                                                            <p className="text-base">{loan.purpose}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {loan.ai_explanation && (
                                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                                        <p className="text-sm text-muted-foreground mb-1">AI Assessment</p>
                                                        <p className="text-base">{loan.ai_explanation}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                {loan.created_at && new Date(loan.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

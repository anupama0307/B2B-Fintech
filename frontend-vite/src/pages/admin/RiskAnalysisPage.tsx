import { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
    Target,
    User,
    Briefcase,
    IndianRupee,
    Calendar,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';
import api from '@/services/api';

interface RiskResult {
    risk_score: number;
    risk_level: string;
    recommendation: string;
    factors: string[];
    max_recommended_amount: number;
    suggested_tenure: number;
}

export default function RiskAnalysisPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<RiskResult | null>(null);
    const [formData, setFormData] = useState({
        age: '',
        annual_income: '',
        employment_years: '',
        existing_loan_amount: '',
        monthly_expenses: '',
        loan_amount_requested: '',
        loan_tenure_months: '',
        customer_score: '',
        has_expense_mismatch: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const payload = {
                age: parseInt(formData.age),
                annual_income: parseFloat(formData.annual_income),
                employment_years: parseInt(formData.employment_years),
                existing_loan_amount: parseFloat(formData.existing_loan_amount) || 0,
                monthly_expenses: parseFloat(formData.monthly_expenses),
                loan_amount_requested: parseFloat(formData.loan_amount_requested),
                loan_tenure_months: parseInt(formData.loan_tenure_months),
                customer_score: parseInt(formData.customer_score),
                has_expense_mismatch: formData.has_expense_mismatch
            };

            const response = await api.post('/admin/risk-analysis', payload);
            console.log('Risk analysis response:', response.data);
            setResult(response.data);
        } catch (err: any) {
            console.error('Risk analysis error:', err.response?.data);
            setError(err.response?.data?.detail || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        const l = level?.toLowerCase();
        if (l === 'low') return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (l === 'medium') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    const getRiskIcon = (level: string) => {
        const l = level?.toLowerCase();
        if (l === 'low') return <CheckCircle className="w-6 h-6" />;
        if (l === 'medium') return <AlertTriangle className="w-6 h-6" />;
        return <XCircle className="w-6 h-6" />;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Risk Analysis Tool</h1>
                        <p className="text-lg text-muted-foreground mt-1">Analyze borrower risk profile</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-base">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Target className="w-6 h-6" />
                                    Borrower Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-base">Age</Label>
                                            <div className="relative mt-1">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="age" type="number" value={formData.age}
                                                    onChange={handleChange} required min="18" max="100"
                                                    className="h-11 pl-10 text-base" placeholder="30" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-base">Employment Years</Label>
                                            <div className="relative mt-1">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="employment_years" type="number" value={formData.employment_years}
                                                    onChange={handleChange} required min="0"
                                                    className="h-11 pl-10 text-base" placeholder="5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-base">Annual Income (Rs.)</Label>
                                        <div className="relative mt-1">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input name="annual_income" type="number" value={formData.annual_income}
                                                onChange={handleChange} required min="1"
                                                className="h-11 pl-10 text-base" placeholder="600000" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-base">Monthly Expenses (Rs.)</Label>
                                        <div className="relative mt-1">
                                            <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input name="monthly_expenses" type="number" value={formData.monthly_expenses}
                                                onChange={handleChange} required min="0"
                                                className="h-11 pl-10 text-base" placeholder="25000" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-base">Existing Loans (Rs.)</Label>
                                            <div className="relative mt-1">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="existing_loan_amount" type="number" value={formData.existing_loan_amount}
                                                    onChange={handleChange} min="0"
                                                    className="h-11 pl-10 text-base" placeholder="0" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-base">Credit Score</Label>
                                            <div className="relative mt-1">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="customer_score" type="number" value={formData.customer_score}
                                                    onChange={handleChange} required min="300" max="900"
                                                    className="h-11 pl-10 text-base" placeholder="700" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-base">Requested Amount (Rs.)</Label>
                                            <div className="relative mt-1">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="loan_amount_requested" type="number" value={formData.loan_amount_requested}
                                                    onChange={handleChange} required min="1"
                                                    className="h-11 pl-10 text-base" placeholder="200000" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-base">Tenure (Months)</Label>
                                            <div className="relative mt-1">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <Input name="loan_tenure_months" type="number" value={formData.loan_tenure_months}
                                                    onChange={handleChange} required min="6" max="240"
                                                    className="h-11 pl-10 text-base" placeholder="36" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="expense_mismatch" name="has_expense_mismatch"
                                            checked={formData.has_expense_mismatch} onChange={handleChange}
                                            className="w-5 h-5 rounded border-input" />
                                        <Label htmlFor="expense_mismatch" className="text-base">
                                            Flag: Expense Mismatch Detected
                                        </Label>
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-12 text-base gap-2" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Target className="w-5 h-5" />
                                                Run Analysis
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        {result && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Analysis Results</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className={`p-6 rounded-xl ${getRiskColor(result.risk_level)} flex items-center gap-4`}>
                                        {getRiskIcon(result.risk_level)}
                                        <div>
                                            <p className="text-base font-medium">Risk Level</p>
                                            <p className="text-2xl font-bold uppercase">{result.risk_level}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-base font-medium">Risk Score</p>
                                            <p className="text-2xl font-bold">{result.risk_score}/100</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Max Recommended Amount</p>
                                            <p className="text-xl font-bold">Rs. {(result.max_recommended_amount || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Suggested Tenure</p>
                                            <p className="text-xl font-bold">{result.suggested_tenure || 0} months</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-base font-semibold mb-2">Recommendation</p>
                                        <p className="text-base text-muted-foreground">{result.recommendation}</p>
                                    </div>

                                    {result.factors && result.factors.length > 0 && (
                                        <div>
                                            <p className="text-base font-semibold mb-2">Risk Factors</p>
                                            <ul className="space-y-2">
                                                {result.factors.map((factor, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-base">
                                                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        {factor}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

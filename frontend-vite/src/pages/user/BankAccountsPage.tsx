import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
    Building2, Plus, Trash2, Star, CreditCard, PiggyBank,
    IndianRupee, AlertCircle, CheckCircle, Loader2, X
} from 'lucide-react';
import api from '@/services/api';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number_masked: string;
    ifsc_code: string;
    account_type: string;
    balance: number;
    is_primary: boolean;
    created_at?: string;
}

interface Cumulative {
    total_balance: number;
    savings_balance: number;
    current_balance: number;
}

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [cumulative, setCumulative] = useState<Cumulative | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        account_type: 'savings',
        balance: '',
        is_primary: false
    });

    useEffect(() => { fetchAccounts(); }, []);

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/bank-accounts/');
            setAccounts(response.data.accounts || []);
            setCumulative(response.data.cumulative || null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/bank-accounts/', {
                ...formData,
                balance: parseFloat(formData.balance) || 0
            });
            setSuccess('Bank account added successfully');
            setShowAddForm(false);
            setFormData({
                bank_name: '',
                account_number: '',
                ifsc_code: '',
                account_type: 'savings',
                balance: '',
                is_primary: false
            });
            fetchAccounts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to add account');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/bank-accounts/${deleteId}`);
            setSuccess('Account deleted');
            fetchAccounts();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to delete');
        } finally {
            setDeleteId(null);
        }
    };

    const handleSetPrimary = async (id: number) => {
        try {
            await api.patch(`/bank-accounts/${id}`, { is_primary: true });
            fetchAccounts();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-background"><Navbar /><div className="flex"><Sidebar /><main className="flex-1 p-8"><LoadingSpinner /></main></div></div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Bank Accounts</h1>
                            <p className="text-lg text-muted-foreground mt-1">Manage your linked bank accounts</p>
                        </div>
                        <Button onClick={() => setShowAddForm(true)} className="gap-2">
                            <Plus className="w-5 h-5" /> Add Account
                        </Button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </div>
                    )}

                    {/* Cumulative Summary */}
                    {cumulative && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-green-500/20 rounded-lg">
                                            <IndianRupee className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Balance</p>
                                            <p className="text-2xl font-bold text-green-600">₹{cumulative.total_balance.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/20 rounded-lg">
                                            <PiggyBank className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Savings Accounts</p>
                                            <p className="text-2xl font-bold text-blue-600">₹{cumulative.savings_balance.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-500/20 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Accounts</p>
                                            <p className="text-2xl font-bold text-purple-600">₹{cumulative.current_balance.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Add Account Form Modal */}
                    {showAddForm && (
                        <Card className="mb-8 border-2 border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Building2 className="w-5 h-5" /> Add New Bank Account
                                    </CardTitle>
                                    <CardDescription>Enter your bank account details</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Bank Name</Label>
                                        <Input name="bank_name" value={formData.bank_name} onChange={handleChange} required placeholder="e.g., HDFC Bank" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Account Number</Label>
                                        <Input name="account_number" value={formData.account_number} onChange={handleChange} required placeholder="Enter account number" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>IFSC Code</Label>
                                        <Input name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required maxLength={11} placeholder="e.g., HDFC0001234" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Account Type</Label>
                                        <select name="account_type" value={formData.account_type} onChange={handleChange} className="w-full h-10 rounded-md border border-input px-3 mt-1 bg-background">
                                            <option value="savings">Savings</option>
                                            <option value="current">Current</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Current Balance (Rs.)</Label>
                                        <Input name="balance" type="number" value={formData.balance} onChange={handleChange} placeholder="0" className="mt-1" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input type="checkbox" name="is_primary" checked={formData.is_primary} onChange={handleChange} id="is_primary" className="w-4 h-4" />
                                        <Label htmlFor="is_primary">Set as primary account</Label>
                                    </div>
                                    <div className="md:col-span-2 flex gap-3 justify-end">
                                        <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Adding...</> : 'Add Account'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Accounts List */}
                    {accounts.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-xl font-medium mb-2">No Bank Accounts</p>
                                <p className="text-muted-foreground mb-4">Add your bank accounts to track balances</p>
                                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                                    <Plus className="w-5 h-5" /> Add Your First Account
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map((account) => (
                                <Card key={account.id} className={`relative ${account.is_primary ? 'border-2 border-primary' : ''}`}>
                                    {account.is_primary && (
                                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                                            <Star className="w-4 h-4" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Building2 className="w-5 h-5" />
                                            {account.bank_name}
                                        </CardTitle>
                                        <CardDescription>{account.account_number_masked}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Balance</span>
                                                <span className="font-bold text-green-600">₹{account.balance.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Type</span>
                                                <span className="capitalize">{account.account_type}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">IFSC</span>
                                                <span>{account.ifsc_code}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {!account.is_primary && (
                                                <Button variant="outline" size="sm" onClick={() => handleSetPrimary(account.id)} className="flex-1 text-xs">
                                                    <Star className="w-3 h-3 mr-1" /> Set Primary
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(account.id)} className="text-red-600 hover:text-red-700 hover:bg-red-100">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Bank Account"
                description="Are you sure you want to remove this bank account? This action cannot be undone."
                confirmText="Delete Account"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDelete}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, Send, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '@/services/api';

interface Grievance {
    id: string;
    subject: string;
    description: string;
    status: string;
    admin_response?: string;
    created_at: string;
}

export default function GrievancesPage() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => { fetchGrievances(); }, []);

    const fetchGrievances = async () => {
        try {
            const response = await api.get('/grievances/my-grievances');
            setGrievances(response.data || []);
        } catch (err) {
            console.error('Fetch grievances error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate
        if (subject.trim().length < 3) {
            setError('Subject must be at least 3 characters');
            return;
        }
        if (description.trim().length < 10) {
            setError('Description must be at least 10 characters');
            return;
        }

        setSubmitting(true);

        // Build payload - ONLY subject and description (no grievance_type)
        const payload = {
            subject: subject.trim(),
            description: description.trim()
        };

        console.log('Submitting grievance payload:', payload);

        try {
            const response = await api.post('/grievances/submit', payload);
            console.log('Grievance submit response:', response.data);

            setSuccess('Grievance submitted successfully!');
            setSubject('');
            setDescription('');
            setShowForm(false);
            fetchGrievances();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Grievance submit error:', err.response?.data);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(detail.map((d: any) => d.msg || d.message).join(', '));
            } else {
                setError('Failed to submit grievance. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-600" />;
        if (status === 'in_progress') return <Clock className="w-4 h-4 text-yellow-600" />;
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    };

    const getStatusStyle = (status: string) => {
        if (status === 'resolved') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'in_progress') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
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
                            <h1 className="text-3xl font-bold">Grievances</h1>
                            <p className="text-lg text-muted-foreground mt-1">Submit and track your support requests</p>
                        </div>
                        <Button size="lg" onClick={() => setShowForm(!showForm)} className="gap-2">
                            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {showForm ? 'Cancel' : 'New Grievance'}
                        </Button>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    {showForm && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="text-xl">Submit New Grievance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <Label className="text-base font-medium">Subject</Label>
                                        <Input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Brief summary of your issue"
                                            className="h-12 text-base mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-base font-medium">Description</Label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Provide detailed description of your issue..."
                                            rows={4}
                                            className="w-full rounded-lg border border-input px-4 py-3 text-base bg-background mt-2"
                                        />
                                    </div>
                                    <Button type="submit" size="lg" disabled={submitting} className="gap-2">
                                        <Send className="w-5 h-5" />
                                        {submitting ? 'Submitting...' : 'Submit Grievance'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {grievances.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-xl font-medium mb-2">No grievances submitted yet</p>
                                <p className="text-muted-foreground mb-6">Need help? Submit a support request.</p>
                                <Button size="lg" onClick={() => setShowForm(true)} className="gap-2">
                                    <Plus className="w-5 h-5" /> Submit Your First Grievance
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {grievances.map((g) => (
                                <Card key={g.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{g.subject}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(g.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusStyle(g.status)}`}>
                                                {getStatusIcon(g.status)}
                                                {g.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                                            </span>
                                        </div>
                                        <p className="text-base text-muted-foreground">{g.description}</p>
                                        {g.admin_response && (
                                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                                <p className="text-xs text-muted-foreground mb-2 font-medium">Admin Response:</p>
                                                <p className="text-sm">{g.admin_response}</p>
                                            </div>
                                        )}
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

import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

interface Grievance {
    id: string;
    user_id: string;
    grievance_type: string;
    subject: string;
    description: string;
    status: string;
    admin_response?: string;
    created_at: string;
}

export default function AdminGrievancesPage() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [replyData, setReplyData] = useState({ status: 'in_progress', admin_response: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchGrievances(); }, []);

    const fetchGrievances = async () => {
        try {
            const response = await api.get('/grievances/admin/all');
            setGrievances(response.data || []);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load grievances');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!selectedGrievance || !replyData.admin_response.trim()) {
            setError('Please enter a response');
            return;
        }
        if (replyData.admin_response.length < 5 || replyData.admin_response.length > 2000) {
            setError('Response must be 5-2000 characters');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.patch(`/grievances/admin/${selectedGrievance.id}`, {
                status: replyData.status,
                admin_response: replyData.admin_response.trim()
            });
            setSelectedGrievance(null);
            setReplyData({ status: 'in_progress', admin_response: '' });
            fetchGrievances();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit reply');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'resolved') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'in_progress') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">💬 Manage Grievances</h1>
                        <p className="text-muted-foreground">{grievances.length} total grievances</p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">{error}</div>}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Grievances List */}
                        <div className="space-y-4">
                            {grievances.length === 0 ? (
                                <Card className="text-center py-12">
                                    <CardContent>
                                        <p className="text-4xl mb-4">📭</p>
                                        <p className="text-muted-foreground">No grievances to review</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                grievances.map((g) => (
                                    <Card
                                        key={g.id}
                                        className={`cursor-pointer transition hover:border-primary ${selectedGrievance?.id === g.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                        onClick={() => {
                                            setSelectedGrievance(g);
                                            setReplyData({ status: g.status === 'open' ? 'in_progress' : g.status, admin_response: g.admin_response || '' });
                                        }}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold">{g.subject}</p>
                                                    <p className="text-sm text-muted-foreground">#{g.id} • {g.grievance_type.replace('_', ' ')}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(g.status)}`}>
                                                    {g.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm line-clamp-2">{g.description}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{new Date(g.created_at).toLocaleString()}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Reply Panel */}
                        <Card className="sticky top-20">
                            <CardHeader><CardTitle>📝 Reply to Grievance</CardTitle></CardHeader>
                            <CardContent>
                                {selectedGrievance ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="font-medium mb-2">{selectedGrievance.subject}</p>
                                            <p className="text-sm">{selectedGrievance.description}</p>
                                            <p className="text-xs text-muted-foreground mt-2">User ID: {selectedGrievance.user_id}</p>
                                        </div>

                                        <div>
                                            <Label>Status</Label>
                                            <select
                                                value={replyData.status}
                                                onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Response (5-2000 chars)</Label>
                                            <textarea
                                                value={replyData.admin_response}
                                                onChange={(e) => setReplyData({ ...replyData, admin_response: e.target.value })}
                                                placeholder="Enter your response to the user..."
                                                rows={4}
                                                maxLength={2000}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button onClick={handleReply} disabled={submitting} className="flex-1">
                                                {submitting ? 'Submitting...' : 'Submit Reply'}
                                            </Button>
                                            <Button variant="secondary" onClick={() => setSelectedGrievance(null)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p className="text-4xl mb-4">👆</p>
                                        <p>Select a grievance from the list to reply</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

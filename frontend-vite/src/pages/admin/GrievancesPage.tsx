import { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, User, Mail } from 'lucide-react';
import api from '@/services/api';

interface Grievance {
    id: string;
    user_id?: string;
    user_name?: string;
    user_email?: string;
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
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchGrievances(); }, []);

    const fetchGrievances = async () => {
        try {
            setError('');
            const response = await api.get('/grievances/admin/all');
            console.log('Admin grievances response:', response.data);
            setGrievances(response.data || []);
        } catch (err: any) {
            console.error('Error fetching grievances:', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to load grievances');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (grievanceId: string) => {
        if (!grievanceId) {
            setError('No grievance selected');
            return;
        }
        if (!replyText.trim() || replyText.length < 5) {
            setError('Response must be at least 5 characters');
            return;
        }

        setSubmitting(true);
        setError('');

        // Build payload
        const payload = {
            status: 'resolved',
            admin_response: replyText.trim()
        };

        console.log(`Resolving grievance ${grievanceId} with payload:`, payload);

        try {
            await api.patch(`/grievances/admin/${grievanceId}`, payload);
            setSelectedId(null);
            setReplyText('');
            fetchGrievances();
        } catch (err: any) {
            console.error('Resolve error:', err.response?.data);
            setError(err.response?.data?.detail || 'Failed to resolve grievance');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || 'open';
        if (s === 'resolved') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Resolved
                </span>
            );
        }
        if (s === 'in_progress') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" /> Open
            </span>
        );
    };

    // Count pending for sidebar badge
    const pendingCount = grievances.filter(g => g.status !== 'resolved').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex">
                    <Sidebar pendingGrievances={pendingCount} />
                    <main className="flex-1 p-8"><LoadingSpinner /></main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar pendingGrievances={pendingCount} />
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Grievances Management</h1>
                        <p className="text-lg text-muted-foreground mt-1">
                            {grievances.length} total • {pendingCount} pending
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    {grievances.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-xl font-medium mb-2">No grievances submitted yet</p>
                                <p className="text-base text-muted-foreground">User grievances will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="text-base font-semibold">ID</TableHead>
                                            <TableHead className="text-base font-semibold">User</TableHead>
                                            <TableHead className="text-base font-semibold">Subject</TableHead>
                                            <TableHead className="text-base font-semibold">Status</TableHead>
                                            <TableHead className="text-base font-semibold">Date</TableHead>
                                            <TableHead className="text-base font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {grievances.map((g) => (
                                            <>
                                                <TableRow key={g.id} className="hover:bg-muted/30">
                                                    <TableCell className="text-base font-medium">#{g.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                                                <User className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-medium">{g.user_name || 'Unknown User'}</p>
                                                                <p className="text-sm text-muted-foreground">{g.user_email || ''}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-base font-medium">{g.subject}</p>
                                                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{g.description}</p>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(g.status)}</TableCell>
                                                    <TableCell className="text-base text-muted-foreground">
                                                        {new Date(g.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {g.status === 'resolved' ? (
                                                            <span className="text-sm text-muted-foreground">Resolved</span>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant={selectedId === g.id ? 'secondary' : 'default'}
                                                                onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}
                                                            >
                                                                {selectedId === g.id ? 'Cancel' : 'Reply'}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Reply Panel */}
                                                {selectedId === g.id && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="bg-muted/20 p-6">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Full Description:</p>
                                                                    <p className="text-base">{g.description}</p>
                                                                </div>

                                                                {g.admin_response ? (
                                                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                                        <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                                                                            <CheckCircle className="w-4 h-4" /> Previous Response:
                                                                        </p>
                                                                        <p className="text-base">{g.admin_response}</p>
                                                                    </div>
                                                                ) : null}

                                                                <div className="space-y-3">
                                                                    <p className="text-base font-medium">Your Response:</p>
                                                                    <textarea
                                                                        value={replyText}
                                                                        onChange={(e) => setReplyText(e.target.value)}
                                                                        placeholder="Type your response to resolve this grievance..."
                                                                        rows={3}
                                                                        className="w-full rounded-lg border border-input px-4 py-3 text-base bg-background"
                                                                    />
                                                                    <div className="flex gap-3">
                                                                        <Button
                                                                            onClick={() => handleResolve(g.id)}
                                                                            disabled={submitting}
                                                                            className="gap-2"
                                                                        >
                                                                            <Send className="w-4 h-4" />
                                                                            {submitting ? 'Sending...' : 'Resolve Grievance'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="secondary"
                                                                            onClick={() => { setSelectedId(null); setReplyText(''); }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}

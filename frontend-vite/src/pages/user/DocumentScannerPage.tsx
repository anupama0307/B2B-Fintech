import { useState, useRef } from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ScanLine, Upload, FileText, CreditCard, CheckCircle, AlertCircle, Loader2, Trash2, Receipt } from 'lucide-react';
import api from '@/services/api';

interface ScanResult {
    type: 'receipt' | 'kyc';
    data: any;
    status: 'success' | 'error';
}

export default function DocumentScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [scanType, setScanType] = useState<'receipt' | 'kyc' | null>(null);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (type: 'receipt' | 'kyc') => {
        setScanType(type);
        setError('');
        setResult(null);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !scanType) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, GIF or PDF file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setScanning(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint = scanType === 'receipt' ? '/upload/receipt' : '/upload/kyc';
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Scan response:', response.data);

            setResult({
                type: scanType,
                data: response.data,
                status: 'success'
            });
        } catch (err: any) {
            console.error('Scan error:', err.response?.data);
            const detail = err.response?.data?.detail || 'Failed to scan document';
            setError(typeof detail === 'string' ? detail : 'Scanning failed. Please try again.');
            setResult({
                type: scanType,
                data: null,
                status: 'error'
            });
        } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const clearResult = () => {
        setResult(null);
        setError('');
        setScanType(null);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Document Scanner</h1>
                        <p className="text-lg text-muted-foreground mt-1">Scan receipts or KYC documents using AI</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-base">{error}</span>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Receipt Scanner */}
                        <Card className={`cursor-pointer hover:shadow-lg transition-all ${scanType === 'receipt' ? 'ring-2 ring-primary' : ''}`}>
                            <CardContent className="pt-8 pb-8 text-center">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Scan Receipt</h3>
                                <p className="text-base text-muted-foreground mb-6">
                                    Extract merchant, amount, and date from receipts
                                </p>
                                <Button
                                    size="lg"
                                    onClick={() => handleFileSelect('receipt')}
                                    disabled={scanning}
                                    className="gap-2"
                                >
                                    {scanning && scanType === 'receipt' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Receipt
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* KYC Scanner */}
                        <Card className={`cursor-pointer hover:shadow-lg transition-all ${scanType === 'kyc' ? 'ring-2 ring-primary' : ''}`}>
                            <CardContent className="pt-8 pb-8 text-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Scan KYC Document</h3>
                                <p className="text-base text-muted-foreground mb-6">
                                    Extract details from ID cards, Aadhaar, PAN
                                </p>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handleFileSelect('kyc')}
                                    disabled={scanning}
                                    className="gap-2"
                                >
                                    {scanning && scanType === 'kyc' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Document
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results */}
                    {result && result.status === 'success' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Scan Complete</CardTitle>
                                        <CardDescription className="text-base capitalize">{result.type} data extracted</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={clearResult} className="gap-2">
                                    <Trash2 className="w-4 h-4" /> Clear
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {result.type === 'receipt' && result.data && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Merchant</p>
                                            <p className="text-base font-semibold">{result.data.merchant || result.data.data?.merchant || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Amount</p>
                                            <p className="text-base font-semibold">Rs. {result.data.amount || result.data.data?.amount || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="text-base font-semibold">{result.data.date || result.data.data?.date || 'N/A'}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Category</p>
                                            <p className="text-base font-semibold">{result.data.category || result.data.data?.category || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}

                                {result.type === 'kyc' && result.data && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(result.data.data || result.data).map(([key, value]) => (
                                            <div key={key} className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-base font-semibold">{String(value) || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}

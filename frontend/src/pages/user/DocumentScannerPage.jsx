import React, { useState, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import {
    CameraIcon,
    DocumentArrowUpIcon,
    IdentificationIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    PhotoIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/solid';

export default function DocumentScannerPage() {
    const [activeTab, setActiveTab] = useState('receipt');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'receipt', label: 'Receipt Scanner', icon: DocumentArrowUpIcon, description: 'Scan receipts to extract transaction details' },
        { id: 'kyc', label: 'KYC Verification', icon: IdentificationIcon, description: 'Upload ID for identity verification' },
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const endpoint = activeTab === 'receipt' ? '/upload/receipt' : '/upload/kyc';
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setResult(response.data);
        } catch (err) {
            console.error('Upload error:', err);
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                setError(detail[0]?.msg || 'Upload failed');
            } else {
                setError('Failed to process document. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveReceipt = async () => {
        if (!result) return;

        try {
            await api.post('/upload/receipt/save', {
                merchant_name: result.merchant_name,
                total_amount: result.total_amount,
                transaction_date: result.transaction_date,
                category: result.category || 'Other',
            });
            setResult({ ...result, saved: true });
        } catch (err) {
            setError('Failed to save transaction');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            📄 Document Scanner
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Upload receipts or ID documents for AI-powered extraction
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); handleClear(); }}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="card animate-slide-up">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <PhotoIcon className="w-5 h-5 text-primary-500" />
                                Upload {activeTab === 'receipt' ? 'Receipt' : 'ID Document'}
                            </h2>

                            {/* Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${selectedFile
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-300 dark:border-dark-border hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-border/50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="relative">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <CameraIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                                            Drop your image here or click to browse
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            Supports JPG, PNG, WEBP
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Upload Button */}
                            {selectedFile && !result && (
                                <button
                                    onClick={handleUpload}
                                    disabled={isProcessing}
                                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <DocumentArrowUpIcon className="w-5 h-5" />
                                            {activeTab === 'receipt' ? 'Extract Receipt Data' : 'Verify Identity'}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
                                    <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Results Section */}
                        <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-accent-500" />
                                Extracted Data
                            </h2>

                            {!result && !isProcessing && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Upload a document to see extracted data
                                    </p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="text-center py-12">
                                    <ArrowPathIcon className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                        AI is analyzing your document...
                                    </p>
                                </div>
                            )}

                            {result && activeTab === 'receipt' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg">
                                        <div className="flex items-center gap-2 text-accent-700 dark:text-accent-400 font-medium mb-2">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Receipt Extracted Successfully
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-gray-400">Merchant</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.merchant_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-gray-400">Amount</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">₹{result.total_amount || '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-gray-400">Date</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.transaction_date || '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">Category</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.category || 'Other'}</span>
                                        </div>
                                    </div>

                                    {!result.saved && (
                                        <button
                                            onClick={handleSaveReceipt}
                                            className="btn-accent w-full flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Save Transaction
                                        </button>
                                    )}

                                    {result.saved && (
                                        <div className="p-4 bg-accent-100 dark:bg-accent-900/30 rounded-lg text-center text-accent-700 dark:text-accent-400 font-medium">
                                            ✓ Transaction Saved
                                        </div>
                                    )}
                                </div>
                            )}

                            {result && activeTab === 'kyc' && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg border ${result.verified
                                            ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800'
                                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                        }`}>
                                        <div className={`flex items-center gap-2 font-medium mb-2 ${result.verified
                                                ? 'text-accent-700 dark:text-accent-400'
                                                : 'text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                            {result.verified ? (
                                                <><CheckCircleIcon className="w-5 h-5" /> Identity Verified</>
                                            ) : (
                                                <><XCircleIcon className="w-5 h-5" /> Verification Pending</>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-gray-400">Document Type</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.id_type || '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                                            <span className="text-gray-500 dark:text-gray-400">Name on ID</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.extracted_name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-500 dark:text-gray-400">ID Number</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">{result.id_number || '-'}</span>
                                        </div>
                                    </div>

                                    {result.message && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                            {result.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

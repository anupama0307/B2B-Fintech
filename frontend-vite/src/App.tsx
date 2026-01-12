import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ReactNode } from 'react';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import LoanApplicationsPage from '@/pages/admin/LoanApplicationsPage';
import RiskAnalysisPage from '@/pages/admin/RiskAnalysisPage';
import AdminGrievancesPage from '@/pages/admin/GrievancesPage';

// User Pages
import UserDashboard from '@/pages/user/UserDashboard';
import ApplyLoanPage from '@/pages/user/ApplyLoanPage';
import MyLoansPage from '@/pages/user/MyLoansPage';
import UserGrievancesPage from '@/pages/user/GrievancesPage';
import ProfilePage from '@/pages/user/ProfilePage';
import VoiceAssistantPage from '@/pages/user/VoiceAssistantPage';
import DocumentScannerPage from '@/pages/user/DocumentScannerPage';
import BankAccountsPage from '@/pages/user/BankAccountsPage';
import InvestmentDashboardPage from '@/pages/user/InvestmentDashboardPage';
import MutualFundsPage from '@/pages/user/MutualFundsPage';
import StocksPage from '@/pages/user/StocksPage';
import DepositsPage from '@/pages/user/DepositsPage';
import PensionPage from '@/pages/user/PensionPage';
import InsurancePage from '@/pages/user/InsurancePage';
import TransactionAnalyticsPage from '@/pages/user/TransactionAnalyticsPage';

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/loans" element={<ProtectedRoute adminOnly><LoanApplicationsPage /></ProtectedRoute>} />
            <Route path="/admin/risk-analysis" element={<ProtectedRoute adminOnly><RiskAnalysisPage /></ProtectedRoute>} />
            <Route path="/admin/grievances" element={<ProtectedRoute adminOnly><AdminGrievancesPage /></ProtectedRoute>} />

            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/apply-loan" element={<ProtectedRoute><ApplyLoanPage /></ProtectedRoute>} />
            <Route path="/my-loans" element={<ProtectedRoute><MyLoansPage /></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><DocumentScannerPage /></ProtectedRoute>} />
            <Route path="/grievances" element={<ProtectedRoute><UserGrievancesPage /></ProtectedRoute>} />
            <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Investment Routes */}
            <Route path="/investments" element={<ProtectedRoute><InvestmentDashboardPage /></ProtectedRoute>} />
            <Route path="/investments/mutual-funds" element={<ProtectedRoute><MutualFundsPage /></ProtectedRoute>} />
            <Route path="/investments/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
            <Route path="/investments/deposits" element={<ProtectedRoute><DepositsPage /></ProtectedRoute>} />
            <Route path="/investments/pension" element={<ProtectedRoute><PensionPage /></ProtectedRoute>} />
            <Route path="/investments/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionAnalyticsPage /></ProtectedRoute>} />

            {/* Default */}
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    FileText,
    Target,
    MessageSquare,
    Wallet,
    ClipboardList,
    Mic,
    ScanLine,
    User,
    Settings,
    Building2,
    PieChart,
    Activity
} from 'lucide-react';

const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/loans', label: 'Loan Applications', icon: ClipboardList },
    { path: '/admin/risk-analysis', label: 'Risk Analysis', icon: Target },
    { path: '/admin/grievances', label: 'Grievances', icon: MessageSquare, hasBadge: true },
];

const userLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/apply-loan', label: 'Apply for Loan', icon: Wallet },
    { path: '/my-loans', label: 'My Loans', icon: ClipboardList },
    { path: '/bank-accounts', label: 'Bank Accounts', icon: Building2 },
    { path: '/investments', label: 'Investments', icon: PieChart },
    { path: '/transactions', label: 'Transactions', icon: Activity },
    { path: '/voice', label: 'Voice Assistant', icon: Mic },
    { path: '/scan', label: 'Document Scanner', icon: ScanLine },
    { path: '/grievances', label: 'Grievances', icon: MessageSquare },
    { path: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
    pendingGrievances?: number;
}

export default function Sidebar({ pendingGrievances = 0 }: SidebarProps) {
    const { user } = useAuth();
    const location = useLocation();
    const links = user?.role === 'admin' ? adminLinks : userLinks;

    return (
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] shadow-sm">
            <nav className="p-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    const showBadge = (link as any).hasBadge && pendingGrievances > 0;

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                {link.label}
                            </div>
                            {showBadge && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                                    {pendingGrievances}
                                </Badge>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, LogOut, Activity, Search, Target } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [tenant, setTenant] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT payload (base64)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsername(payload.sub || '');
                setRole(payload.role || '');
                setTenant(payload.tenant || '');
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen shrink-0 font-sans shadow-sm z-20">
            {/* Header (Mobile Logo + Hamburger) */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">LogAnalytics</span>
                </div>
                <button 
                    className="md:hidden text-slate-500 hover:text-slate-800 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 overflow-y-auto bg-white`}>
                {/* User Profile Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase shrink-0 text-sm">
                            {username ? username.charAt(0) : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{username || 'User'}</p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[9px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{role}</span>
                                <span className="text-[9px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate">Tenant: {tenant}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1.5 flex-1">
                    <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/alerts" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <span>Security Alerts</span>
                    </NavLink>
                    <NavLink to="/logs" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <Search className="w-5 h-5 shrink-0" />
                        <span>Logs Explorer</span>
                    </NavLink>
                    <NavLink to="/investigate" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <Target className="w-5 h-5 shrink-0" />
                        <span>Investigate</span>
                    </NavLink>
                </nav>
            </div>
        </div>
    );
}

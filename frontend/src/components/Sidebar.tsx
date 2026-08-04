import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, LogOut, Activity, Search } from "lucide-react";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <div className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col justify-between p-4 shadow-sm z-10">
            <div>
                <div className="flex items-center space-x-3 px-2 py-4 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        LogAnalytics
                    </h1>
                </div>

                <nav className="space-y-1">
                    <NavLink to="/" className={navClass}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/alerts" className={navClass}>
                        <ShieldAlert className="w-5 h-5" />
                        <span>Security Alerts</span>
                    </NavLink>
                    <NavLink to="/logs" className={navClass}>
                        <Search className="w-5 h-5" />
                        <span>Logs Explorer</span>
                    </NavLink>
                </nav>
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full mt-auto"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    );
}

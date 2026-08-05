import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, LogOut, Activity, Search } from "lucide-react";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:flex-col justify-between p-2 md:p-4 shadow-sm z-20 shrink-0">
            <div className="flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start w-full">
                <div className="flex items-center space-x-2 md:space-x-3 px-2 py-2 md:py-4 md:mb-6 shrink-0">
                    <div className="p-1.5 md:p-2 bg-blue-600 rounded-lg text-white shadow-sm">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
                        LogAnalytics
                    </h1>
                </div>

                <nav className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto flex-1 md:flex-none justify-end md:justify-start px-2 md:px-0">
                    <NavLink to="/" className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <span className="hidden md:inline">Dashboard</span>
                    </NavLink>
                    <NavLink to="/alerts" className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <span className="hidden md:inline">Security Alerts</span>
                    </NavLink>
                    <NavLink to="/logs" className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <Search className="w-5 h-5 shrink-0" />
                        <span className="hidden md:inline">Logs Explorer</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex md:hidden items-center space-x-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                    </button>
                </nav>
            </div>

            <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full mt-auto"
            >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    );
}

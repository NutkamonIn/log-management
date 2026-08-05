import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, User } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        if (!trimmedUsername || !trimmedPassword) {
            setError('Username and password cannot be empty or just spaces.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post('/api/v1/login', { username: trimmedUsername, password: trimmedPassword });
            sessionStorage.setItem('token', res.data.access_token);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-50 rounded-xl mb-4 text-blue-600">
                        <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        Log Management System
                    </h2>
                    <p className="text-slate-500 text-sm">Sign in to access your analytics</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="w-full space-y-5">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    setError('Pasting is not allowed.');
                                }}
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    setError('Pasting is not allowed.');
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-sm shadow-blue-600/20"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-sm space-y-2">
                    <p className="font-semibold text-slate-400 uppercase text-xs tracking-wider mb-3">Demo Accounts</p>
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Admin</span>
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">admin / adminpassword</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                        <span>Viewer</span>
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">viewer_demoa / viewer123</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

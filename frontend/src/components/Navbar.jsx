import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ArrowLeft } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = () => {
        if (!user?.email) return '??';
        return user.email.substring(0, 2).toUpperCase();
    };

    const isHomePage = location.pathname === '/';

    return (
        <nav className="fixed top-0 left-0 w-full h-20 flex items-center z-50 bg-brand-beige/80 backdrop-blur-sm border-b border-brand-border/10">
            <div className="container-custom flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {!isHomePage && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-sage hover:border-brand-sage/30 transition-all group"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    )}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.svg" alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500" />
                        <span className="font-serif text-2xl tracking-tight">ResumeAnalyzerAI</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    <Link to="/" className="nav-link text-brand-charcoal">Home</Link>
                    <a
                        href="/#features"
                        onClick={(e) => {
                            if (location.pathname === '/') {
                                e.preventDefault();
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="nav-link"
                    >
                        Features
                    </a>
                </div>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pr-4 border-r border-brand-border/50">
                                <div className="w-9 h-9 rounded-full bg-brand-sage text-white flex items-center justify-center text-xs font-bold ring-4 ring-brand-sage/10">
                                    {getInitials()}
                                </div>
                                <span className="hidden lg:block text-xs font-medium text-brand-muted truncate max-w-[120px]">
                                    {user.email}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-brand-muted hover:text-red-500 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/auth" className="nav-link font-semibold">Log in</Link>
                            <Link to="/auth?mode=signup" className="btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

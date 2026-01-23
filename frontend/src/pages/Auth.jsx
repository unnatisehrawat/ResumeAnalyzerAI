import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, login, register, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            navigate('/upload', { replace: true });
        }
    }, [user, loading, navigate]);

    const mode = searchParams.get('mode') || 'login';
    const isLogin = mode === 'login';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = isLogin
                ? await login(email, password)
                : await register(email, password);

            if (result.success) {
                navigate('/upload');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-beige flex flex-col items-center justify-center p-6 text-brand-charcoal">
            {/* Small Logo / Top link */}
            <Link to="/" className="mb-10 flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-brand-sage rounded-xl rotate-45 group-hover:rotate-180 transition-all duration-700 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-sm -rotate-45"></div>
                </div>
                <h2 className="text-xl font-serif">ResumeAnalyzerAI</h2>
                <p className="text-xs font-semibold text-brand-muted">Authentication Portal</p>
            </Link>

            <div className="premium-card w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl mb-2">{isLogin ? 'Welcome' : 'Join Us'}</h1>
                    <p className="text-brand-muted text-sm px-4">
                        {isLogin ? 'Sign in to your professional dashboard' : 'Create your account to supercharge your career'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="bg-brand-accent p-1 rounded-2xl flex mb-8">
                    <Link
                        to="/auth?mode=login"
                        className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${isLogin ? 'bg-white shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'}`}
                    >
                        Login
                    </Link>
                    <Link
                        to="/auth?mode=signup"
                        className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${!isLogin ? 'bg-white shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'}`}
                    >
                        Sign Up
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="input-field"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-muted ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-brand-muted ml-1">Password</label>
                            {isLogin && <a href="#" className="text-xs font-semibold text-brand-sage hover:text-brand-sage-dark">Forgot?</a>}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field pr-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full justify-center py-4 text-base mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <span className="ml-2">→</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-brand-muted leading-relaxed">
                    By signing in, you agree to our <br />
                    <a href="#" className="underline hover:text-brand-charcoal">Terms of Service</a> & <a href="#" className="underline hover:text-brand-charcoal">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
};

export default Auth;

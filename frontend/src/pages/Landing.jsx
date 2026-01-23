import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, CheckCircle, Zap, ShieldCheck, Trophy } from 'lucide-react';

const Landing = () => {
    React.useEffect(() => {
        if (window.location.hash === '#features') {
            const element = document.getElementById('features');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col pt-20">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="container-custom py-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-sage/30 bg-brand-sage/5 mb-8 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-brand-sage">AI-Powered Career Growth</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl mb-8 leading-[1.1] tracking-tight max-w-4xl mx-auto">
                        Supercharge Your Career with <span className="italic">Intelligent</span> Analysis.
                    </h1>

                    <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-12">
                        Optimize your resume for modern ATS systems and land your dream job faster.
                        Precise insights and keyword matching in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth?mode=signup" className="btn-primary group">
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                <section id="features" className="bg-brand-accent/30 py-32">
                    <div className="container-custom">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl mb-6">Crafted for Excellence</h2>
                            <p className="text-brand-muted max-w-xl mx-auto">
                                Every tool you need to refine your professional identity and navigate the modern job market with confidence.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="premium-card text-center group hover:border-brand-sage/50 transition-colors">
                                <div className="w-12 h-12 bg-brand-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-sage group-hover:bg-brand-sage group-hover:text-white transition-all">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl mb-4">ATS Scoring</h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Understand exactly how systems interpret your experience. Fix formatting and structural issues instantly.
                                </p>
                            </div>

                            <div className="premium-card text-center group hover:border-brand-sage/50 transition-colors">
                                <div className="w-12 h-12 bg-brand-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-sage group-hover:bg-brand-sage group-hover:text-white transition-all">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl mb-4">Skill Gap Analysis</h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Identify the specific keywords and skills missing from your profile compared to industry benchmarks.
                                </p>
                            </div>

                            <div className="premium-card text-center group hover:border-brand-sage/50 transition-colors">
                                <div className="w-12 h-12 bg-brand-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-sage group-hover:bg-brand-sage group-hover:text-white transition-all">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl mb-4">Interview Prep</h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Generate tailored interview questions based on your unique career history and target roles.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="container-custom py-32">
                    <div className="bg-brand-sage py-24 px-8 rounded-[40px] text-center text-white relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-5xl md:text-6xl mb-8">Ready to redefine your path?</h2>
                            <Link to="/auth?mode=signup" className="bg-white text-brand-charcoal px-10 py-4 rounded-full font-semibold hover:bg-brand-beige transition-colors inline-block mt-8">
                                Upload Your Resume
                            </Link>
                        </div>
                        {/* Subtle background decoration */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border border-white"></div>
                            <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full border border-white"></div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Landing;

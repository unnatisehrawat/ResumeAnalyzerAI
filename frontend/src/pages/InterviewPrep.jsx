import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Zap, ShieldCheck, ChevronDown, ChevronUp, RefreshCw, MessageSquareQuote, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const InterviewPrep = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(0);

    useEffect(() => {
        fetchInterviewData();
    }, [id]);

    const fetchInterviewData = async () => {
        try {
            setLoading(true);
            setError('');

            let interviewData;

            if (id) {
                // Fetch specific analysis which should include interview prep
                // Based on backend, there is an /interview/generate endpoint or it might be part of analysis
                // Checking backend controllers: interview.controller.js has generateQuestions

                // Let's try to get existing interview for this analysis or generate new one
                const response = await api.post('/interview/generate', { analysisId: id });
                interviewData = response.data.interview;
            } else {
                // Fallback: Fetch latest interview for the user
                const response = await api.get('/interview/latest');
                interviewData = response.data;
            }

            if (!interviewData) throw new Error('No interview data found');

            setData(interviewData);
        } catch (err) {
            console.error('Interview prep fetch error:', err);
            setError('Failed to load interview preparation guide. Please ensure you have completed a resume analysis first.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col pt-20 bg-brand-beige">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center p-6">
                    <Loader2 className="w-12 h-12 text-brand-sage animate-spin mb-4" />
                    <p className="text-brand-muted font-medium">Curating your personalized interview guide...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col pt-20 bg-brand-beige">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h2 className="text-2xl font-serif mb-2">Preparation Restricted</h2>
                    <p className="text-brand-muted mb-8 max-w-md">{error || 'Please complete a resume analysis to unlock your interview guide.'}</p>
                    <Link to="/upload" className="btn-primary">Start New Analysis</Link>
                </main>
                <Footer />
            </div>
        );
    }

    const technicalQuestions = data.questions?.technicalQuestions || [];
    const behavioralQuestions = data.questions?.behavioralQuestions || [];

    return (
        <div className="min-h-screen flex flex-col pt-20 bg-brand-beige">
            <Navbar />

            <main className="flex-grow container-custom py-16">
                <div className="text-center mb-16">
                    <div className="badge border-brand-sage text-brand-sage mb-2">Interview Strategy</div>
                    <h1 className="text-5xl mb-4">AI Interview Prep Guide</h1>
                    <p className="text-brand-muted max-w-xl mx-auto">
                        Personalized preparation strategy based on your unique career history and analyzed job specifications.
                    </p>
                </div>

                {/* Technical Questions */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-serif">Potential Technical Questions</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{technicalQuestions.length} Questions Targeted</span>
                    </div>

                    <div className="space-y-6">
                        {technicalQuestions.length > 0 ? (
                            technicalQuestions.map((q, i) => (
                                <div key={i} className="premium-card border-l-4 border-l-brand-sage p-0 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
                                        className="w-full text-left p-8 flex items-start justify-between group"
                                    >
                                        <div className="max-w-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-500' : 'bg-brand-sage/10 text-brand-sage'}`}>
                                                    {q.difficulty} Level
                                                </span>
                                            </div>
                                            <h3 className="text-xl leading-relaxed text-brand-charcoal group-hover:text-brand-sage transition-colors italic">
                                                "{q.question}"
                                            </h3>
                                        </div>
                                        {expandedIndex === i ? <ChevronUp className="w-5 h-5 text-brand-muted" /> : <ChevronDown className="w-5 h-5 text-brand-muted" />}
                                    </button>

                                    {expandedIndex === i && (
                                        <div className="px-8 pb-8 pt-2 animate-fade-in divide-y divide-brand-border/50">
                                            <div className="py-6">
                                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-sage mb-3 flex items-center gap-2">
                                                    <MessageSquareQuote className="w-3 h-3" /> Suggested Answer Strategy
                                                </h4>
                                                <p className="text-xs text-brand-muted leading-relaxed">
                                                    {q.answer}
                                                </p>
                                            </div>
                                            {q.tags && (
                                                <div className="py-6 flex flex-wrap gap-2">
                                                    {q.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-1 bg-brand-beige border border-brand-border rounded text-[9px] font-semibold text-brand-muted uppercase">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-brand-muted italic">No specific technical questions generated for this role yet.</p>
                        )}
                    </div>
                </section>

                {/* Behavioral Questions */}
                {behavioralQuestions.length > 0 && (
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-serif">Behavioral Focus (STAR)</h2>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Based on your experience</span>
                        </div>

                        <div className="space-y-8">
                            {behavioralQuestions.map((q, i) => (
                                <div key={i} className="premium-card border-none bg-brand-accent/50">
                                    <div className="mb-8">
                                        <h3 className="text-xl italic text-brand-charcoal">"{q.question}"</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                        <STARSection label="Situation" text={q.situation} />
                                        <STARSection label="Task" text={q.task} />
                                        <STARSection label="Action" text={q.action} />
                                        <STARSection label="Result" text={q.result} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="flex flex-col items-center pt-10 border-t border-brand-border">
                    <p className="text-xs text-brand-muted mb-6 italic">Want to adjust your preparation strategy?</p>
                    <button
                        onClick={fetchInterviewData}
                        className="btn-secondary flex items-center gap-2 group"
                    >
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Regenerate Guide
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const STARSection = ({ label, text }) => (
    <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-sage">
            {label}
        </h4>
        <p className="text-xs text-brand-muted leading-relaxed">
            {text}
        </p>
    </div>
);

export default InterviewPrep;

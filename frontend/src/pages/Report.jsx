import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, XCircle, BarChart3, Target, Briefcase, Award, ArrowRight, ArrowLeft, Zap, Loader2, AlertCircle } from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Report = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(location.state?.analysisResult || null);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!data && id) {
            fetchAnalysis();
        }
    }, [id]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/analysis/${id}`);
            // The backend returns the analysis object with relations
            // We need to map it to the structure used by the component
            const analysis = response.data;

            // If the analysis was fetched via GET, it might have slightly different nesting
            // comparing to the direct 'run' result. Normalizing here:
            const result = {
                matchScore: analysis.matchScore,
                ruleBasedScore: analysis.ruleBasedScore || analysis.matchScore - 5, // Fallback if not direct
                semanticScore: analysis.semanticScore || analysis.matchScore + 5, // Fallback if not direct
                verdict: analysis.verdict || (analysis.matchScore > 70 ? 'Strong Fit' : 'Fair Fit'),
                matchedSkills: Array.isArray(analysis.matchedSkills) ? analysis.matchedSkills : [],
                missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
                experience: analysis.experience || {
                    required: "Not specified",
                    found: "N/A",
                    isMatch: true
                },
                projectRelevance: Array.isArray(analysis.projectRelevance)
                    ? analysis.projectRelevance
                    : (analysis.suggestions?.projectRelevance || []),
                jdSuggestions: analysis.suggestions || analysis.jdSuggestions || {
                    atsTips: [],
                    skillsSuggestions: [],
                    experienceSuggestions: []
                }
            };

            setData(result);
        } catch (err) {
            console.error('Fetch analysis error:', err);
            setError('Failed to load analysis report. Please try again.');
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
                    <p className="text-brand-muted font-medium">Generating your detailed report...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col pt-20 bg-brand-beige">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center p-6">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <h2 className="text-2xl font-serif mb-2">Something went wrong</h2>
                    <p className="text-brand-muted mb-8">{error || 'Analysis not found.'}</p>
                    <Link to="/upload" className="btn-primary">Go Back to Upload</Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pt-20 bg-brand-beige">
            <Navbar />

            <main className="flex-grow container-custom py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="badge border-brand-sage text-brand-sage mb-2">Analysis Complete</div>
                        <h1 className="text-5xl">Resume Analysis Report</h1>
                    </div>
                    <Link to={id ? `/interview-prep/${id}` : '/interview-prep'} className="btn-primary">
                        Generate Interview Prep
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Horizontal Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <MetricCard label="Overall Match Score" value={`${data.matchScore}%`} icon={<Target className="w-4 h-4" />} color="text-brand-sage" />
                    <MetricCard label="ATS Score" value={`${data.ruleBasedScore || 0}%`} icon={<BarChart3 className="w-4 h-4" />} />
                    <MetricCard label="Semantic Score" value={`${data.semanticScore || 0}%`} icon={<Zap className="w-4 h-4" />} color="text-brand-sage" />
                    <MetricCard label="Alignment" value={data.verdict} icon={<Briefcase className="w-4 h-4" />} color="text-brand-sage" />
                </div>

                {data.experience && !data.experience.isMatch && (
                    <div className="mb-12 p-6 bg-amber-50 border border-amber-100 rounded-[32px] flex items-center gap-6 animate-fade-in shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="text-amber-900 font-bold text-lg mb-1 leading-tight">Experience Misalignment Detected</h4>
                            <p className="text-amber-800/80 text-sm leading-relaxed max-w-2xl">
                                The Job Description requires <strong>{data.experience.required}</strong>,
                                but we found approximately <strong>{data.experience.found}</strong> in your professional history.
                                We've adjusted your suggestions to help you emphasize your impact.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content (Left, Col Span 2) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Skills Analysis */}
                        <div className="premium-card">
                            <h3 className="text-2xl mb-8 flex items-center gap-2">
                                <Award className="w-5 h-5 text-brand-sage" />
                                Skill Analysis
                            </h3>
                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-sm font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-3 h-3 text-brand-sage" /> Matched Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.matchedSkills && data.matchedSkills.length > 0 ? (
                                            data.matchedSkills.map(skill => (
                                                <span key={skill} className="px-3 py-1.5 bg-brand-sage/5 border border-brand-sage/20 rounded-lg text-xs font-medium text-brand-sage-dark">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-xs text-brand-muted italic">No direct matches found.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-brand-charcoal mb-4 flex items-center gap-2">
                                        <XCircle className="w-3 h-3 text-red-400" /> Missing / Recommended
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.missingSkills && data.missingSkills.length > 0 ? (
                                            data.missingSkills.map(skill => (
                                                <span key={skill} className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-500">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-xs text-brand-muted italic">Perfect skill alignment!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Relevance */}
                        {data.projectRelevance && data.projectRelevance.length > 0 && (
                            <div className="premium-card">
                                <h3 className="text-2xl mb-8 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-brand-sage" />
                                    Project Relevance
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {data.projectRelevance.map((project, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-brand-accent/30 border border-brand-border hover:border-brand-sage/30 transition-all group">
                                            <div className="flex justify-between items-center">
                                                <h5 className="font-semibold text-brand-charcoal">{project.name || project.title || project.projectName}</h5>
                                                <span className="text-xs font-bold text-brand-sage">{project.relevanceScore}% Match</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Insights (Right) */}
                    <div className="space-y-6">
                        <InsightBox title="ATS Optimization" items={data.jdSuggestions?.atsTips || []} />
                        <InsightBox title="Experience Tips" items={data.jdSuggestions?.experienceSuggestions || []} />
                        <InsightBox title="Skill Suggestions" items={data.jdSuggestions?.skillsSuggestions || []} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const MetricCard = ({ label, value, icon, color = "text-brand-charcoal" }) => (
    <div className="premium-card p-6 flex flex-col items-center text-center">
        <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-muted mb-4">
            {icon}
        </div>
        <p className="text-xs font-semibold text-brand-muted mb-1">{label}</p>
        <p className={`font-serif text-3xl ${color}`}>{value}</p>
    </div>
);

const InsightBox = ({ title, items }) => (
    <div className="premium-card p-6 border-l-4 border-l-brand-sage">
        <h4 className="text-sm font-semibold text-brand-charcoal mb-4">{title}</h4>
        {items && items.length > 0 ? (
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="text-xs text-brand-charcoal flex gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-sage mt-1.5 shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-xs text-brand-muted italic">Processing additional insights...</p>
        )}
    </div>
);

export default Report;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Upload, FileText, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { useAnalysis } from '../context/AnalysisContext';

const UploadPage = () => {
    const navigate = useNavigate();
    const { persistedResume: resumeFile, setPersistedResume: setResumeFile, persistedJd: jdText, setPersistedJd: setJdText } = useAnalysis();
    const [status, setStatus] = useState('idle'); // idle, uploading, parsing_resume, parsing_jd, analyzing, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            setErrorMessage('');
        } else {
            setErrorMessage('Please upload a valid PDF file.');
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile || !jdText.trim()) {
            setErrorMessage('Please provide both a resume and a job description.');
            return;
        }

        setStatus('uploading');
        setErrorMessage('');

        try {
            // 1. Upload Resume
            const formData = new FormData();
            formData.append('resume', resumeFile);
            const uploadRes = await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const resumeId = uploadRes.data.resumeId;

            // 2. Parse Resume
            setStatus('parsing_resume');
            await api.post(`/resume/parse/${resumeId}`);

            // 3. Create & Parse JD
            setStatus('parsing_jd');
            const jdRes = await api.post('/job/create', { content: jdText });
            const jobDescriptionId = jdRes.data.jobDescriptionId;

            // 4. Run Analysis
            setStatus('analyzing');
            const analysisRes = await api.post('/analysis/run', {
                resumeId,
                jobDescriptionId
            });

            setStatus('success');
            // Navigate to report with the result
            navigate(`/report/${analysisRes.data.analysis.id}`, {
                state: { analysisResult: analysisRes.data.analysis }
            });

        } catch (error) {
            console.error('Analysis flow error:', error);
            setErrorMessage(error.response?.data?.message || 'Something went wrong during analysis. Please try again.');
            setStatus('error');
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'uploading': return 'Uploading your resume...';
            case 'parsing_resume': return 'AI is extracting skills from your resume...';
            case 'parsing_jd': return 'Processing job requirements...';
            case 'analyzing': return 'Performing deep analysis & scoring...';
            default: return 'Analyze Resume';
        }
    };

    return (
        <div className="min-h-screen flex flex-col pt-20">
            <Navbar />

            <main className="grow container-custom py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl mb-4">Analyze Your Fit</h1>
                    <p className="text-brand-muted max-w-lg mx-auto">
                        Upload your professional resume and the job description to get instant AI-powered insights and optimization tips.
                    </p>
                </div>

                {errorMessage && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-sm animate-fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Resume Upload Card */}
                    <div className={`premium-card flex flex-col transition-opacity ${status !== 'idle' && status !== 'error' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-brand-sage/10 rounded-xl flex items-center justify-center text-brand-sage">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl">Upload Resume</h3>
                        </div>

                        <label className="grow border-2 border-dashed border-brand-border rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-brand-sage/50 hover:bg-brand-sage/5 transition-all group">
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                            {resumeFile ? (
                                <div className="text-center animate-fade-in flex flex-col items-center">
                                    <CheckCircle2 className="w-10 h-10 text-brand-sage mb-4" />
                                    <p className="text-sm font-medium text-brand-charcoal">{resumeFile.name}</p>
                                    <p className="text-xs text-brand-muted mt-1">File selected</p>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setResumeFile(null);
                                        }}
                                        className="mt-6 flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-500 transition-colors py-2 px-4 rounded-xl hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-brand-muted mb-4 group-hover:text-brand-sage transition-colors" />
                                    <p className="text-sm font-medium mb-1">Select PDF Resume</p>
                                    <p className="text-xs text-brand-muted">or drag and drop file here</p>
                                </>
                            )}
                        </label>

                        <p className="text-[10px] text-brand-muted italic mt-6 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 not-italic" /> 100% Secure & Private. We don't share your data.
                        </p>
                    </div>

                    {/* JD Input Card */}
                    <div className={`premium-card flex flex-col transition-opacity ${status !== 'idle' && status !== 'error' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-brand-sage/10 rounded-xl flex items-center justify-center text-brand-sage">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl">Job Description</h3>
                        </div>

                        <textarea
                            className="grow input-field resize-none h-55 p-4 text-sm leading-relaxed"
                            placeholder="Paste the job description here..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        ></textarea>


                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={status !== 'idle' && status !== 'error'}
                        className="btn-primary px-16 py-4 text-base group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status !== 'idle' && status !== 'error' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : null}
                        <span className="mx-2">{getStatusMessage()}</span>
                        {status === 'idle' || status === 'error' ? (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        ) : null}
                    </button>


                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UploadPage;

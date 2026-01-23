import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-brand-border mt-20">
            <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-2 grayscale opacity-40">
                    <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-serif text-xl">ResumeAnalyzerAI</span>
                </div>



                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    © {new Date().getFullYear()} ResumeAnalyzerAI. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

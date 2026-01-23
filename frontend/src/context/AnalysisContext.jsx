import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
    const [persistedResume, setPersistedResume] = useState(null);
    const [persistedJd, setPersistedJd] = useState('');

    const clearAnalysisData = () => {
        setPersistedResume(null);
        setPersistedJd('');
    };

    return (
        <AnalysisContext.Provider value={{
            persistedResume,
            setPersistedResume,
            persistedJd,
            setPersistedJd,
            clearAnalysisData
        }}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = () => useContext(AnalysisContext);

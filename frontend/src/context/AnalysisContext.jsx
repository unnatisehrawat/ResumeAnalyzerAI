import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
    const [persistedResume, setPersistedResume] = useState(null);
    const [persistedJd, setPersistedJd] = useState('');
    const { user } = useAuth();

    const clearAnalysisData = () => {
        setPersistedResume(null);
        setPersistedJd('');
    };

    // Reset persisted analysis inputs whenever the authenticated user changes.
    useEffect(() => {
        clearAnalysisData();
    }, [user?.id]);

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

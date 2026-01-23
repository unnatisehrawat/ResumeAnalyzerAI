import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AnalysisProvider } from "./context/AnalysisContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Analysis from "./pages/Upload";
import Report from "./pages/Report";
import InterviewPrep from "./pages/InterviewPrep";

export default function App() {
  return (
    <AnalysisProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/upload" element={<Analysis />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/interview-prep/:id" element={<InterviewPrep />} />

        {/* Redirect dashboard to upload for consistency in this simplified flow */}
        <Route path="/dashboard" element={<Analysis />} />
      </Routes>
    </AnalysisProvider>
  );
}

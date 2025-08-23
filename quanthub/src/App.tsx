import React from "react";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AuthenticationPage from "./pages/AuthenticationPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StrategiesPage from "./pages/StrategiesPage";
import DatasetsPage from "./pages/DatasetsPage";
import BacktesterPage from "./pages/BacktesterPage";
import CommunityPage from "./pages/CommunityPage";
import StrategiesDetailPage from "./pages/StrategiesDetailPage";
import StrategyUploadPage from "./pages/StrategyUploadPage";
import DatasetUploadPage from "./pages/DatasetUploadPage";
import BacktesterDetailPage from "./pages/BacktesterDetailPage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import DatasetsDetailPage from "./pages/DatasetsDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";
import DocsPage from "./pages/DocsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthenticationPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/strategies/upload" element={<StrategyUploadPage />} />
          <Route path="/datasets/upload" element={<DatasetUploadPage />} />
          <Route path="/strategies/:id" element={<StrategiesDetailPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/datasets/:id" element={<DatasetsDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

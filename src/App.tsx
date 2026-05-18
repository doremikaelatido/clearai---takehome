import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DecodeEdiPage from './pages/DecodeEdiPage';
import GenerateEdiPage from './pages/GenerateEdiPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <div className="h-screen bg-white text-slate-900 page-padding">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/*<Route path="/signup" element={<SignupPage />} />*/}

        <Route path="/home" element={<DashboardLayout />}>
          <Route index element={<Navigate to="generate-edi" replace />} />
          <Route path="generate-edi" element={<GenerateEdiPage />} />
          <Route path="decode-edi" element={<DecodeEdiPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;

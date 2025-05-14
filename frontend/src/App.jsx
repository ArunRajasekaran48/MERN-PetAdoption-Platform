import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './components/landing/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import PetDetailsPage from './pages/PetDetailsPage';
import MyPetsPage from './pages/MyPetsPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import IncomingRequestsPage from './pages/IncomingRequestsPage';
import OutgoingRequestsPage from './pages/OutgoingRequestsPage';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/pet/:id" element={<PetDetailsPage />} />
          <Route path="/my-pets" element={<MyPetsPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/incoming-requests" element={<IncomingRequestsPage />} />
          <Route path="/outgoing-requests" element={<OutgoingRequestsPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
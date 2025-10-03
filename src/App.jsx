import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import AdDetail from './pages/AdDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdsProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/create-ad" element={<CreateAd />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ads/:slug" element={<AdDetail />} />
                {/* Autres routes seront ajoutées progressivement */}
              </Routes>
            </main>
          </div>
        </Router>
      </AdsProvider>
    </AuthProvider>
  );
}

export default App;

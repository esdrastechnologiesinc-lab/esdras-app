import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/login';
import Home from './components/home';
import Scan from './components/scan';
import Styles from './components/styles';
import Barbers from './components/barbers';

function App() {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  React.useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) navigate('/login');
    });
  }, []);

  const logout = () => signOut(auth).then(() => navigate('/login'));

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', background: '#F0F0F0', minHeight: '100vh' }}>
      <header style={{ background: '#001F3F', color: '#B8860B', padding: '1.5rem', textAlign: 'center' }}>
  <img 
    src="/esdras-logo.png" 
    alt="ESDRAS Logo" 
    style={{ height: '120px', marginBottom: '0.5rem' }} 
  />
  <p style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: '600' }}>
    Precision Grooming. Zero Regrets
  </p>
  {/* nav stays the same */}
</header>

      <main style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Home user={user} /> : <Login />} />
          <Route path="/scan" element={<Scan user={user} />} />
          <Route path="/styles" element={<Styles user={user} />} />
          <Route path="/barbers" element={<Barbers user={user} />} />
        </Routes>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', background: '#001F3F', color: '#B8860B' }}>
        © 2025 ESDRAS — All Rights Reserved
      </footer>
    </div>
  );
}

const nav = { color: '#B8860B', margin: '0 1rem', fontWeight: 'bold', textDecoration: 'none' };
const btn = { background: '#B8860B', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer' };

export default App;

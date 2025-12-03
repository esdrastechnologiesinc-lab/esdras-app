import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Scan from './components/Scan';
import Styles from './components/Styles';
import ImportStyle from './components/ImportStyle';
import Barbers from './components/Barbers';
import Booking from './components/Booking';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [styleCount, setStyleCount] = useState(0); // Track free styles (MVP: 10 limit)
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) navigate('/login');
    });
  }, [auth, navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'));
  };

  return (
    <div className="container">
      <header>
        <div className="logo">ESDRAS</div>
        <nav>
          {user && (
            <>
              <Link to="/">Home</Link> | <Link to="/styles">Styles</Link> | <Link to="/barbers">Barbers</Link> | <Link to="/profile">Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home user={user} />} />
          <Route path="/scan" element={<Scan user={user} />} />
          <Route path="/styles" element={<Styles user={user} styleCount={styleCount} setStyleCount={setStyleCount} />} />
          <Route path="/import" element={<ImportStyle user={user} />} />
          <Route path="/barbers" element={<Barbers user={user} />} />
          <Route path="/booking/:barberId" element={<Booking user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </main>
      <footer>Precision Grooming, Zero Regrets © 2025</footer>
    </div>
  );
}

export default App;

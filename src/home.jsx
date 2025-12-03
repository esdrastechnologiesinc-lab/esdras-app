import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div>
      <h1>Welcome Back, {user?.displayName || 'User'}!</h1>
      <Link to="/scan"><button>Try New Hairstyle</button></Link>
    </div>
  );
};

export default Home;

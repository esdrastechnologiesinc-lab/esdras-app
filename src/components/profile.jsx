import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'users', id)).then(s => setProfile(s.data()));
  }, [id]);

  if (!profile) return <div style={{textAlign:'center', padding:'3rem'}}><h2>Loading...</h2></div>;

  return (
    <div style={{textAlign:'center', padding:'3rem', background:'#001F3F', color:'white', minHeight:'100vh'}}>
      <h1>{profile.name || 'ESDRAS User'}</h1>
      <p>Referred {profile.referredCount || 0} friends</p>
      <p>Credits Earned: ${profile.credits || 0}</p>
      <p style={{marginTop:'3rem', fontSize:'1.2rem'}}>
        Share your link: esdras-app.netlify.app/?ref={profile.referralCode}
      </p>
    </div>
  );
}

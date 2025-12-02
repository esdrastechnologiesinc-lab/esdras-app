import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, updateDoc } from 'firebase/firestore';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Share, MapPin, Target, Layout, Loader2, User, Lock, Grid3X3, Filter } from 'lucide-react';

// --- CONFIGURATION & CONSTANTS ---
const PRIMARY_NAVY = '#001F3F'; // Background
const SECONDARY_GOLD = '#B8860B'; // Accent/CTA
const WHITE = '#FFFFFF';

// Firebase Setup (Global variables injected by the environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// MVP Limits
const FREE_STYLE_LIMIT = 10;
const MAX_REFERRAL_BONUS = 3; // Extra styles for new referred users

// Mock Data for Initial Population (Only if collections are empty)
const MOCK_STYLES = [
  { id: 's1', name: 'Precision Fade', gender: 'male', is_premium: false, attributes: { length: 'short', face_shape: 'round' }, model_ref_url: 'https://placehold.co/100x100/3F51B5/FFFFFF?text=M+Fade' },
  { id: 's2', name: 'Classic Bob', gender: 'female', is_premium: false, attributes: { length: 'medium', face_shape: 'square' }, model_ref_url: 'https://placehold.co/100x100/FF5722/FFFFFF?text=F+Bob' },
  { id: 's3', name: 'Executive Style (Premium)', gender: 'male', is_premium: true, attributes: { length: 'short', face_shape: 'square' }, model_ref_url: 'https://placehold.co/100x100/4CAF50/FFFFFF?text=M+Exec' },
  { id: 's4', name: 'Long Waves (Premium)', gender: 'female', is_premium: true, attributes: { length: 'long', face_shape: 'round' }, model_ref_url: 'https://placehold.co/100x100/9C27B0/FFFFFF?text=F+Waves' },
];

const MOCK_BARBERS = [
  { id: 'b1', name: 'Barber Tony', specialty: 'Fades', rating: 4.8, location: { lat: 34.0522 + 0.005, lng: -118.2437 + 0.005 }, is_available: true },
  { id: 'b2', name: 'Stylist Maria', specialty: 'Braids', rating: 4.9, location: { lat: 34.0522 - 0.010, lng: -118.2437 + 0.001 }, is_available: true },
  { id: 'b3', name: 'Precision Cuts', specialty: 'All', rating: 4.5, location: { lat: 34.0522 + 0.001, lng: -118.2437 - 0.005 }, is_available: false },
];

// --- 3D RENDERING MOCK COMPONENT (Three.js) ---
const ThreeDMockRenderer = React.memo(({ styleName, styleImage }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PRIMARY_NAVY);
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 2.5;
    controls.maxPolarAngle = Math.PI / 1.5;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    // MOCK HEAD MESH (Sphere/Geometry to simulate the 3D capture)
    const headGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.1, roughness: 0.8 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // MOCK HAIR MESH (Simple cone/cylinder geometry for the style)
    const hairGeometry = new THREE.CylinderGeometry(1.55, 1.45, 1.2, 32);
    hairGeometry.translate(0, 0.6, 0);

    // Hair texture/color from the style image
    const textureLoader = new THREE.TextureLoader();
    const hairTexture = textureLoader.load(styleImage, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
        map: hairTexture,
        color: 0x606060,
        roughness: 0.5,
        metalness: 0.1,
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.name = 'hair_style';
    scene.add(hair);

    camera.position.z = 4;
    controls.update();

    // ANIMATION LOOP
    const animate = () => {
      requestAnimationFrame(animate);
      head.rotation.y += 0.001; // Subtle rotation to show 360 effect
      hair.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    const cleanup = () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };

    return cleanup;
  }, [styleName, styleImage]);

  return (
    <div className="w-full h-full min-h-[40vh] md:min-h-[60vh] relative">
      <div ref={mountRef} className="w-full h-full"></div>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/50">
        Tap & Drag to rotate $360^{\circ}$ Preview
      </p>
    </div>
  );
});

// --- FIREBASE HOOKS AND INITIALIZATION ---
let app, db, auth;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const useFirebaseData = () => {
  const [styles, setStyles] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!auth || !db) return;

    const authenticateAndLoad = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Firebase Auth Error:", e);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_profile', 'data');
        const userSnap = await getDoc(userRef);

        let profileData;
        if (!userSnap.exists()) {
          // Initialize new user profile
          profileData = {
            userId: user.uid,
            email: user.email || 'anon@esdras-app.com',
            styles_viewed_count: 0,
            subscription_status: false,
            last_mesh_id: 'initial_mesh_mock',
            referral_code: user.uid.substring(0, 8).toUpperCase(),
            referred_by_code: '', // Can be updated later
          };
          await setDoc(userRef, profileData);
        } else {
          profileData = userSnap.data();
        }
        setUserProfile(profileData);
      } else {
        // Fallback for unauthenticated state if custom token fails
        setUserId(null);
        setIsAuthReady(true);
      }
    });

    authenticateAndLoad();
    return () => unsubscribeAuth();
  }, []); // Run only on mount

  useEffect(() => {
    if (!isAuthReady || !db) return;

    // 1. Load Styles
    const stylesRef = collection(db, 'artifacts', appId, 'public', 'data', 'styles');
    const unsubscribeStyles = onSnapshot(stylesRef, (snapshot) => {
      const fetchedStyles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStyles(fetchedStyles);
      if (fetchedStyles.length === 0) {
        // Populate mock data if empty
        MOCK_STYLES.forEach(style => setDoc(doc(stylesRef, style.id), style));
      }
    }, (error) => console.error("Error fetching styles:", error));

    // 2. Load Barbers
    const barbersRef = collection(db, 'artifacts', appId, 'public', 'data', 'barbers');
    const unsubscribeBarbers = onSnapshot(barbersRef, (snapshot) => {
      const fetchedBarbers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(fetchedBarbers);
      if (fetchedBarbers.length === 0) {
        // Populate mock data if empty
        MOCK_BARBERS.forEach(barber => setDoc(doc(barbersRef, barber.id), barber));
      }
      setLoading(false);
    }, (error) => console.error("Error fetching barbers:", error));

    return () => {
      unsubscribeStyles();
      unsubscribeBarbers();
    };
  }, [isAuthReady]); // Depend on auth readiness

  return { styles, barbers, userProfile, userId, loading: loading || !isAuthReady, isAuthReady };
};


// --- UTILITIES ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon2) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Distance in km
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const { styles, barbers, userProfile, userId, loading, isAuthReady } = useFirebaseData();
  const [screen, setScreen] = useState('home'); // home, library, preview, map
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 34.0522, lng: -118.2437 }); // Default LA location
  const [styleFilters, setStyleFilters] = useState({ gender: 'all', length: 'all', face_shape: 'all' });
  const [showPaywall, setShowPaywall] = useState(false);
  const [isUpdatingCount, setIsUpdatingCount] = useState(false);


  // 1. GEO-LOCATION HANDLER
  useEffect(() => {
    if (screen === 'map' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGeoError(null);
        },
        (error) => {
          console.error("Geolocation Error:", error.message);
          setGeoError("Location access denied. Showing default location results.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [screen]);

  // 2. STYLE VIEW TRACKER (MONETIZATION LOGIC)
  const trackStyleView = useCallback(async (style) => {
    if (!userProfile || !userId || isUpdatingCount) return;

    if (style.is_premium) {
        if (!userProfile.subscription_status) {
            if (userProfile.styles_viewed_count >= FREE_STYLE_LIMIT) {
                setShowPaywall(true);
                return false; // Block access
            }
        }
    }

    // Update the counter
    if (style.is_premium && !userProfile.subscription_status) {
      setIsUpdatingCount(true);
      const userRef = doc(db, 'artifacts', appId, 'users', userId, 'user_profile', 'data');
      try {
        await updateDoc(userRef, {
          styles_viewed_count: userProfile.styles_viewed_count + 1,
        });
      } catch (error) {
        console.error("Error updating style count:", error);
      } finally {
        setIsUpdatingCount(false);
      }
    }

    setSelectedStyle(style);
    setScreen('preview');
    return true; // Allow access
  }, [userProfile, userId, isUpdatingCount]);

  // 3. FILTER LOGIC
  const filteredStyles = styles.filter(style => {
    const { gender, length, face_shape } = styleFilters;
    if (gender !== 'all' && style.gender !== gender) return false;
    if (length !== 'all' && style.attributes.length !== length) return false;
    if (face_shape !== 'all' && style.attributes.face_shape !== face_shape) return false;
    return true;
  });

  // 4. BARBER DISTANCE CALCULATION
  const nearbyBarbers = barbers
    .map(barber => ({
      ...barber,
      distance: calculateDistance(userLocation.lat, userLocation.lng, barber.location.lat, barber.location.lng)
    }))
    .sort((a, b) => a.distance - b.distance);

  // --- UI COMPONENTS ---

  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-navy text-white p-6">
      <Loader2 className="h-10 w-10 animate-spin text-gold" />
      <p className="mt-4 text-lg font-medium">ESDRAS is loading...</p>
      <p className="text-sm text-white/70">Connecting to Firebase and preparing the AI core.</p>
    </div>
  );

  const PaywallModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
        <Lock className="w-8 h-8 text-gold mx-auto mb-4" />
        <h3 className="text-xl font-bold text-navy mb-2">Unlock Unlimited Styles!</h3>
        <p className="text-gray-600 mb-4">
          You have reached your limit of {FREE_STYLE_LIMIT} free style previews.
          Subscribe now to access all Premium Styles and the new **StyleSnap** feature!
        </p>
        <button
          onClick={() => setShowPaywall(false)}
          className="w-full py-3 mb-2 rounded-lg font-semibold bg-gold text-navy hover:opacity-90 transition"
        >
          Subscribe Now (Mock)
        </button>
        <button
          onClick={() => setShowPaywall(false)}
          className="w-full py-2 text-sm text-gray-500 hover:text-navy transition"
        >
          Close and Keep Browsing
        </button>
      </div>
    </div>
  );

  const StyleFilterComponent = () => (
    <div className="flex flex-col p-4 bg-navy/80 sticky top-0 z-10">
      <h3 className="text-sm text-white/70 font-semibold mb-2 flex items-center"><Filter className='w-4 h-4 mr-1'/> Filter by:</h3>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'male', 'female'].map(g => (
          <button
            key={g}
            onClick={() => setStyleFilters({...styleFilters, gender: g})}
            className={`px-3 py-1 text-sm rounded-full transition ${styleFilters.gender === g ? 'bg-gold text-navy font-bold' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
        {['all', 'short', 'medium', 'long'].map(l => (
          <button
            key={l}
            onClick={() => setStyleFilters({...styleFilters, length: l})}
            className={`px-3 py-1 text-sm rounded-full transition ${styleFilters.length === l ? 'bg-gold text-navy font-bold' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
        {['all', 'round', 'square'].map(s => (
          <button
            key={s}
            onClick={() => setStyleFilters({...styleFilters, face_shape: s})}
            className={`px-3 py-1 text-sm rounded-full transition ${styleFilters.face_shape === s ? 'bg-gold text-navy font-bold' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const StyleCard = ({ style }) => (
    <div
      onClick={() => trackStyleView(style)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] transition duration-200 relative"
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-navy leading-tight">{style.name}</h4>
            {style.is_premium && <Lock className="w-4 h-4 text-gold" />}
        </div>
        <img
          src={style.model_ref_url}
          alt={style.name}
          className="w-full h-auto object-cover rounded-md mt-1 mb-2"
          onError={(e) => e.target.src = `https://placehold.co/100x100/333333/FFFFFF?text=${style.gender.slice(0,1).toUpperCase()}+Style`}
        />
        <div className='flex justify-between items-center mt-1'>
            <span className="text-xs text-gray-500">{style.attributes.length} • {style.attributes.face_shape}</span>
            <button className="text-xs font-bold px-2 py-1 rounded bg-gold text-navy">Try</button>
        </div>
      </div>
    </div>
  );

  const BarberCard = ({ barber }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex justify-between items-center border border-navy">
      <div className="flex flex-col">
        <h4 className="text-lg font-bold text-navy">{barber.name}</h4>
        <p className="text-sm text-gray-600 mb-1">{barber.specialty} Specialist</p>
        <div className="flex items-center text-sm text-gold font-semibold">
          <span className="mr-1">★</span>
          {barber.rating} / 5.0
          <span className="text-gray-500 ml-3">{barber.distance} km away</span>
        </div>
      </div>
      <button
        className={`px-4 py-2 rounded-full font-semibold transition ${barber.is_available ? 'bg-gold text-navy hover:bg-yellow-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
      >
        {barber.is_available ? 'Book Now (Mock)' : 'Unavailable'}
      </button>
    </div>
  );

  // --- SCREEN RENDERS ---

  const renderHome = () => (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-gold mb-2">Welcome Back, {userProfile?.email.split('@')[0] || 'User'}</h1>
      <p className="text-lg text-white/70 mb-8">Precision Grooming. Zero Regrets.</p>
      
      {/* Mesh Status/360 Scan Mock */}
      <div className="bg-white/10 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className='flex items-center'>
              <Target className='w-6 h-6 text-gold mr-3'/>
              <span className='text-sm text-white'>Your 3D Profile is **Active**.</span>
          </div>
          <button className='text-xs text-gold underline hover:no-underline'>Re-Scan (Mock)</button>
      </div>

      {/* Main CTA Cards */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h2 className="text-xl font-bold text-navy mb-2">Discover Your Look</h2>
          <p className="text-gray-600 mb-4">Browse our AI-ready style library and try-on styles $360^{\circ}$.</p>
          <button
            onClick={() => setScreen('library')}
            className="w-full py-3 rounded-lg font-bold text-lg bg-gold text-navy hover:opacity-90 transition"
          >
            Start Styling
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-5">
          <h2 className="text-xl font-bold text-navy mb-2">Find Your Barber</h2>
          <p className="text-gray-600 mb-4">Find geo-tagged, top-rated service providers near you.</p>
          <button
            onClick={() => setScreen('map')}
            className="w-full py-3 rounded-lg font-bold text-lg border-2 border-gold text-gold hover:bg-gold/10 transition"
          >
            <MapPin className='w-5 h-5 mr-2 inline-block'/> Open Map
          </button>
        </div>
      </div>
      
      {/* Referral & Monetization Tracker */}
      <div className="mt-8 pt-4 border-t border-white/20">
        <h3 className="text-md font-bold text-gold mb-3">Your Account & Rewards</h3>
        <p className="text-sm text-white mb-2">
          Styles Viewed (Free Tier): <span className='font-bold'>{userProfile?.styles_viewed_count || 0} / {FREE_STYLE_LIMIT}</span>
        </p>
        <p className="text-sm text-white/80 flex items-center">
            Your Referral Code: <span className='ml-2 px-3 py-1 bg-white/10 rounded font-mono text-gold'>{userProfile?.referral_code || 'N/A'}</span>
            <button className='ml-3 text-gold hover:text-white transition' onClick={() => {
                navigator.clipboard.writeText(userProfile.referral_code).then(() => console.log('Copied!'));
            }}>
                <Share className='w-4 h-4'/>
            </button>
        </p>
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-navy/80">
        <h1 className="text-2xl font-bold text-white mb-1">Style Library</h1>
        <p className="text-sm text-white/70">Tap a style to see the $360^{\circ}$ preview on your mesh.</p>
      </div>
      <StyleFilterComponent />
      <div className="p-4 grid grid-cols-2 gap-4 flex-grow overflow-y-auto">
        {styles.length === 0 ? (
            <p className='col-span-2 text-white/70 text-center py-10'>No styles found. Please refresh or check Firebase connection.</p>
        ) : (
            filteredStyles.map(style => <StyleCard key={style.id} style={style} />)
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="h-full flex flex-col bg-navy">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-xl font-bold text-gold">Preview: {selectedStyle?.name}</h1>
        <button
          onClick={() => {
            // Mock Share Action
            console.log(`Sharing mock image of ${selectedStyle.name}`);
            alert('Image saved! Ready to share (Mock).');
          }}
          className="p-2 rounded-full bg-gold text-navy hover:opacity-90 transition"
        >
          <Share className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow min-h-[50vh] flex flex-col justify-center items-center">
        {selectedStyle && (
            <ThreeDMockRenderer
                styleName={selectedStyle.name}
                styleImage={selectedStyle.model_ref_url}
            />
        )}
        <div className="w-full p-4 bg-navy text-center">
            <h2 className='text-lg font-bold text-white mb-1'>Find the Professional for this Look</h2>
            <p className='text-sm text-white/70 mb-4'>We'll match you with a barber that specializes in this style.</p>
            <button
                onClick={() => setScreen('map')}
                className="w-full py-3 rounded-lg font-bold text-lg bg-gold text-navy hover:opacity-90 transition"
            >
                <MapPin className='w-5 h-5 mr-2 inline-block'/> Find Nearby Barbers
            </button>
        </div>
      </div>

    </div>
  );

  const renderMap = () => (
    <div className="flex flex-col p-4">
        <h1 className="text-2xl font-bold text-white mb-1">Nearby Service Providers</h1>
        <p className="text-sm text-white/70 mb-4">Barbers filtered by distance and specialty.</p>

        {geoError && <p className="text-sm text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{geoError}</p>}
        <p className="text-sm text-white/70 mb-4">
            Current Geo-Location (Mock): <span className='font-mono text-gold'>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
        </p>

        <div className="mb-6 h-40 bg-gray-500 rounded-xl flex items-center justify-center text-white/80">
            {/* Mock Map View */}
            <p className='font-bold text-lg'>[Mock Google Map View with Barber Pins]</p>
        </div>

        <div className="space-y-4">
            {nearbyBarbers.length > 0 ? (
                nearbyBarbers.map(barber => <BarberCard key={barber.id} barber={barber} />)
            ) : (
                <p className='text-white/70 text-center py-10'>No barbers found near this location.</p>
            )}
        </div>
    </div>
  );

  // --- Main Structure ---
  if (loading || !isAuthReady) {
    return <LoadingScreen />;
  }

  // Determine which screen to render
  let content;
  switch (screen) {
    case 'library':
      content = renderLibrary();
      break;
    case 'preview':
      content = renderPreview();
      break;
    case 'map':
      content = renderMap();
      break;
    case 'home':
    default:
      content = renderHome();
      break;
  }

  return (
    <div className="min-h-screen bg-navy text-white font-sans flex flex-col">
      <style>{`
        body { background-color: ${PRIMARY_NAVY}; }
        /* Three.js canvas size for mobile responsiveness */
        #root { width: 100%; height: 100%; }
        canvas { display: block; }
        .bg-navy { background-color: ${PRIMARY_NAVY}; }
        .text-gold { color: ${SECONDARY_GOLD}; }
        .bg-gold { background-color: ${SECONDARY_GOLD}; }
      `}</style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/controls/OrbitControls.js"></script>

      {/* Main Header */}
      <header className="flex items-center justify-between p-4 bg-navy border-b border-gold/50 sticky top-0 z-20">
        <h1 className="text-2xl font-black text-white flex items-center">
          <Target className='w-6 h-6 mr-2 text-gold' /> ESDRAS
        </h1>
        <div className='flex items-center space-x-3'>
            <User className='w-5 h-5 text-white/80' />
            <span className='text-sm text-white/80'>{userProfile?.referral_code || 'Guest'}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-16">
        {content}
      </main>

      {/* Navigation Bar (Mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-navy border-t border-gold/50 shadow-2xl z-30 flex justify-around py-3">
        <NavItem icon={Layout} label="Home" active={screen === 'home'} onClick={() => setScreen('home')} />
        <NavItem icon={Grid3X3} label="Styles" active={screen === 'library'} onClick={() => setScreen('library')} />
        <NavItem icon={MapPin} label="Barbers" active={screen === 'map'} onClick={() => setScreen('map')} />
        <NavItem icon={Target} label="Preview" active={screen === 'preview'} onClick={() => selectedStyle && setScreen('preview')} disabled={!selectedStyle} />
      </nav>

      {/* Paywall Modal Display */}
      {showPaywall && <PaywallModal />}
    </div>
  );
};

// Nav Item Component
const NavItem = ({ icon: Icon, label, active, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center text-xs px-2 py-1 rounded-lg transition ${
            active ? 'text-gold' : 'text-white/60 hover:text-white/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <Icon className='w-5 h-5 mb-1' />
        {label}
    </button>
);

export default App;

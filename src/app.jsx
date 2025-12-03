import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, addDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// --- Global Variable Configuration ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Stripe Configuration ---
// !!! IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR ACTUAL STRIPE PUBLISHABLE KEY !!!
const STRIPE_PK = 'YOUR_STRIPE_PUBLISHABLE_KEY'; 

// Initialize Stripe Promise
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

// --- STUB COMPONENTS (To make the app runnable) ---
// Since we cannot import separate files, these are placeholders for your existing routes.
const UserDashboard = () => <div className="p-8 text-center bg-blue-100 rounded-xl">User Dashboard Content Placeholder</div>;
const Profile = () => <div className="p-8 text-center bg-blue-100 rounded-xl">User Profile Placeholder</div>;
const BarberProfile = () => <div className="p-8 text-center bg-green-100 rounded-xl">Barber Profile Placeholder</div>;
const BarberDashboard = () => <div className="p-8 text-center bg-green-100 rounded-xl">Barber Dashboard Placeholder</div>;
const ImportStyle = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Import Style Placeholder</div>;
const Login = () => <div className="p-8 text-center bg-yellow-100 rounded-xl">Login Screen Placeholder (Auth Logic runs in App.jsx)</div>;
const Home = ({ user }) => <div className="p-8 text-center bg-gray-200 rounded-xl">Welcome Home, {user?.uid.substring(0, 8)}...</div>;
const Styles = () => <div className="p-8 text-center bg-purple-100 rounded-xl">Styles Gallery Placeholder</div>;
const Barbers = () => <div className="p-8 text-center bg-teal-100 rounded-xl">Barber Listings Placeholder</div>;

// --- FIREBASE INITIALIZATION ---
let firebaseApp, db, auth;
try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
} catch (error) {
    console.error("Firebase Init Error:", error);
}


// --- STRIPE PAYMENT COMPONENTS ---

const CardInputOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#001F3F', 
            '::placeholder': { color: '#888' },
        },
        invalid: {
            color: '#dc2626', 
        },
    },
};

const PaymentForm = ({ prescription, savePrescription, navigate }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [status, setStatus] = useState('ready'); 
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setStatus('processing');
        setMessage('Processing payment...');

        // Simulate 5-second payment process
        await new Promise(resolve => setTimeout(resolve, 5000));
        const paymentSuccessful = Math.random() > 0.1; 

        if (paymentSuccessful) {
            setStatus('success');
            setMessage('Payment Successful! Prescription saved.');
            
            // Critical: Save the data only after simulated payment success
            await savePrescription(prescription); 

            setTimeout(() => {
                // Navigate back to the scan/home page after successful payment
                navigate('/'); 
            }, 2000);
            
        } else {
            setStatus('error');
            setMessage('Payment Failed. Please try again.');
        }
    };

    const StatusDisplay = () => {
        switch (status) {
            case 'processing': return <p className="text-yellow-600 font-semibold mt-4">Processing payment, please wait...</p>;
            case 'success': return <p className="text-green-600 font-bold mt-4">✅ {message}</p>;
            case 'error': return <p className="text-red-600 font-bold mt-4">❌ {message}</p>;
            default: return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-[#001F3F]">Secure Checkout</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg border">
                <CardElement options={CardInputOptions} />
            </div>

            <button 
                type="submit" 
                disabled={!stripe || status === 'processing' || status === 'success'}
                style={btn}
                className={`w-full mt-6 py-3 px-4 transition duration-300 ${status === 'processing' ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {status === 'processing' ? 'Processing...' : 'Pay $10.00 to Unlock'}
            </button>
            <StatusDisplay />
        </form>
    );
};

const StripeWrapper = (props) => {
    if (!STRIPE_PK || !stripePromise) {
        return (
            <div className="text-center p-8 bg-red-100 rounded-xl text-red-700 font-semibold">
                ⚠️ **Error:** Stripe Publishable Key is missing. Payment cannot load.
            </div>
        );
    }
    
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
        </Elements>
    );
};


// --- DEDICATED PAYMENT ROUTE ---
const Checkout = ({ prescription, savePrescription, navigate }) => {
    if (!prescription) {
        return (
            <div className="p-10 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="font-bold text-red-700">Error: No prescription data found.</p>
                <button onClick={() => navigate('/scan')} className="mt-4 text-sm text-blue-600 underline">Go back to Scan</button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-[#001F3F] border-b pb-2">Finalize Prescription</h2>
            <p className="text-gray-600">
                Unlock the full **{prescription.recommendation}** specification for $10.00. This will also save it to your permanent history.
            </p>
            
            <div className="bg-[#001F3F] p-4 rounded-lg shadow-md">
                <p className="text-lg font-bold text-white">Amount Due: $10.00</p>
                <p className="text-sm text-yellow-400">Prescription: {prescription.recommendation}</p>
            </div>

            <StripeWrapper 
                prescription={prescription} 
                savePrescription={savePrescription}
                navigate={navigate}
            />

            <button 
                onClick={() => navigate('/scan')}
                className="w-full py-2 mt-4 rounded-lg font-semibold text-sm bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-300"
            >
                Cancel and Return to Scan
            </button>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

function App() {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentPrescription, setCurrentPrescription] = useState(null);
    const navigate = useNavigate();

    // 1. Authentication Setup
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
            } else if (initialAuthToken) {
                await auth.signInWithCustomToken(initialAuthToken).catch(err => {
                    console.error("Custom Token Sign-In Failed:", err);
                    navigate('/login');
                });
            } else {
                await auth.signInAnonymously().catch(err => {
                    console.error("Anonymous Sign-In Failed:", err);
                    navigate('/login');
                });
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, [navigate]);

    // 2. Data Logic (Prescription Saving)
    const savePrescription = useCallback(async (prescriptionToSave) => {
        if (!db || !user) {
            console.error("Cannot save: DB or User not ready.");
            return;
        }

        const dataToSave = {
            ...prescriptionToSave,
            userId: user.uid,
            date: new Date(),
        };

        try {
            const userHistoryPath = `artifacts/${appId}/users/${user.uid}/prescriptions`;
            await addDoc(collection(db, userHistoryPath), dataToSave);
            console.log("Prescription saved successfully!");
        } catch (e) {
            console.error("Error adding document. Check Firestore rules and Auth:", e);
        }
    }, [user]);


    // 3. Logout
    const logout = () => signOut(auth).then(() => {
        setUser(null);
        navigate('/login');
    });

    if (!isAuthReady) {
        return (
             <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F0F0' }}>
                <p style={{ color: '#001F3F', fontSize: '1.2rem' }}>Loading authentication...</p>
            </div>
        );
    }


    // This is a stub for your actual Scan component, passing the necessary state/logic
    const ScanWrapper = () => (
        <Scan 
            user={user} 
            setCurrentPrescription={setCurrentPrescription}
            navigate={navigate}
        />
    );


    return (
        <div style={{ fontFamily: 'Montserrat, sans-serif', background: '#F0F0F0', minHeight: '100vh' }}>
            <header style={{ background: '#001F3F', color: '#B8860B', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                    <div>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>ESDRAS</span>
                        <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#fff', fontWeight: '400' }}>Precision Grooming</p>
                    </div>
                    
                    <nav style={{ display: 'flex', alignItems: 'center' }}>
                        {user && (
                            <>
                                <Link to="/" style={nav}>Home</Link>
                                <Link to="/scan" style={nav}>Scan</Link>
                                <Link to="/styles" style={nav}>Styles</Link>
                                <Link to="/barbers" style={nav}>Barbers</Link>
                                <button onClick={logout} style={{...btn, marginLeft: '1rem'}}>Logout</button>
                            </>
                        )}
                        {!user && <Link to="/login" style={nav}>Login</Link>}
                    </nav>
                </div>
            </header>

            <main style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
                <Routes> 
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/barber/:id" element={<BarberProfile />} />
                    <Route path="/barber/dashboard" element={<BarberDashboard />} />
                    <Route path="/import" element={<ImportStyle />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Main Application Routes */}
                    <Route path="/" element={user ? <Home user={user} /> : <Login />} />
                    <Route path="/scan" element={user ? <ScanWrapper /> : <Login />} />
                    <Route path="/styles" element={<Styles />} />
                    <Route path="/barbers" element={<Barbers />} />
                    
                    {/* NEW STRIPE CHECKOUT ROUTE */}
                    <Route 
                        path="/checkout" 
                        element={user 
                            ? <Checkout 
                                prescription={currentPrescription} 
                                savePrescription={savePrescription} 
                                navigate={navigate} 
                            /> 
                            : <Login />} 
                    />
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

                      

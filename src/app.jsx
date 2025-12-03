        import React, { useState, useEffect } from 'react';
import { Settings, Camera, CheckCircle, Send, History, ArrowRight } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, serverTimestamp } from 'firebase/firestore';

// --- FIREBASE CONFIG & GLOBAL VARS ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- WORKFLOW CONSTANTS ---
const STEP_INPUT = 1;
const STEP_CAPTURE = 2;
const STEP_RESULT = 3;

// Brand Colors
const BRAND_PRIMARY = 'bg-[#0A192F]'; 
const BRAND_ACCENT = 'text-[#FFC800]'; 
const ACCENT_BG = 'bg-[#FFC800]';

// Inline SVG for ESDRAS Logo
const EsdrasLogoSVG = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 200 70" 
    className="h-8 w-auto fill-current text-[#FFC800]"
  >
    {/* Outline Circle (Gold) */}
    <circle cx="35" cy="35" r="30" stroke="#FFC800" strokeWidth="6" fill="none" />
    <path 
      d="M35 15 C 20 15, 20 40, 35 40 C 50 40, 50 15, 35 15 M 25 40 L 45 40 L 45 60 L 25 60 Z" 
      fill="#0A192F" 
      transform="scale(0.8) translate(8 5)"
    />
    <text x="75" y="45" fontFamily="sans-serif" fontSize="30" fontWeight="bold" fill="white">
      ESDRAS
    </text>
  </svg>
);

// Helper component for styled dropdowns
const SelectInput = ({ label, options, value, onChange, name }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#FFC800] focus:border-[#FFC800] shadow-sm transition duration-150 ease-in-out"
        >
            <option value="" disabled>Select an option</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

// Main Application Component
export default function App() {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [step, setStep] = useState(STEP_INPUT); // Current workflow step
  const [input, setInput] = useState({
    hairType: '',
    density: '',
    lengthChange: '',
  });
  const [recommendation, setRecommendation] = useState(null);
  const [isCaptureDone, setIsCaptureDone] = useState(false); // New state for capture

  // 1. Initialize Firebase and Authenticate
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setDb(dbInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (!user) {
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        }
        setUserId(authInstance.currentUser?.uid || 'guest');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Prescriptions (Real-time listener)
  useEffect(() => {
    if (!db || !userId || userId === 'guest') return;

    const prescriptionsRef = collection(db, `artifacts/${appId}/users/${userId}/prescriptions`);
    const q = query(prescriptionsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString() || 'Unknown Date', 
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPrescriptions(history);
    }, (error) => {
      console.error("Error fetching prescriptions:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
    setRecommendation(null);
    setStep(STEP_INPUT); // Reset step if input changes
  };

  const nextStep = () => {
    if (step === STEP_INPUT) {
        // Validation check for Step 1
        if (!input.hairType || !input.density || !input.lengthChange) {
            alert("Please complete all three input fields before proceeding to the next step.");
            return;
        }
        setStep(STEP_CAPTURE);
        setRecommendation(null);
    } else if (step === STEP_CAPTURE && isCaptureDone) {
        // Proceed to simulation after capture is confirmed
        runSimulation();
    }
  };

  /**
   * ESDRAS Core Logic: Runs simulation and saves to Firestore.
   */
  const runSimulation = async () => {
    setStep(STEP_RESULT);

    let cutStyle = "";
    let maintenance = "Medium";
    let color = "text-green-600"; 

    // --- Simulation Logic based on Hair Type & Length Change ---
    if (input.hairType === 'Wavy/Curly') {
        cutStyle = input.lengthChange === 'Shorten' ? 
            "Structured Fade with Tapered Neckline" : "Natural Layered Movement (Avoid thinning)";
        maintenance = input.lengthChange === 'Shorten' ? "High" : "Medium";
    } else if (input.hairType === 'Straight/Fine') {
        cutStyle = input.lengthChange === 'Shorten' ? 
            "Textured Crop or Undercut for Volume" : "Subtle Graduation for Density Illusion";
        maintenance = input.lengthChange === 'Shorten' ? "Low" : "Medium";
    } else if (input.hairType === 'Coily/Kinky') {
        cutStyle = input.lengthChange === 'Shorten' ? 
            "Sculpted Afro or Precision Line-Up" : "Freeform Coils (Moisture retention focus)";
        maintenance = input.lengthChange === 'Shorten' ? "Medium to High" : "High";
    }
    
    // --- Density Modifier ---
    if (input.density === 'Thin/Sparse' && input.lengthChange === 'Shorten') {
        cutStyle += " – Maximize Perimeter Density";
        maintenance = "Low to Medium";
        color = "text-blue-600";
    }

    const finalRecommendation = {
      title: "Precision Grooming Prescription",
      description: `The ESDRAS AI recommends the **${cutStyle}**. This prescription was optimized using your provided metrics and the 360° scan.`,
      maintenance: maintenance,
      color: color,
      input: input,
    };

    setRecommendation(finalRecommendation);

    // Save the result to Firestore
    if (db && userId && userId !== 'guest') {
        const prescriptionsRef = collection(db, `artifacts/${appId}/users/${userId}/prescriptions`);
        try {
            await addDoc(prescriptionsRef, {
                ...finalRecommendation,
                timestamp: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error saving prescription to Firestore:", error);
        }
    }
  };

  // --- RENDERING COMPONENTS FOR WORKFLOW STEPS ---

  const InputStep = () => (
    <>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 flex items-center">
            <Settings className={`mr-3 h-6 w-6 ${BRAND_ACCENT}`} />
            Step 1: Hair Profile Input
        </h2>
        <p className="text-gray-600 mb-6 border-b pb-4">
            Tell us about your hair so the AI can begin its analysis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SelectInput label="1. Hair Type/Texture" name="hairType" options={['Straight/Fine', 'Wavy/Curly', 'Coily/Kinky']} value={input.hairType} onChange={handleChange} />
            <SelectInput label="2. Hair Density" name="density" options={['Thin/Sparse', 'Medium', 'Thick/High']} value={input.density} onChange={handleChange} />
            <SelectInput label="3. Desired Length Change" name="lengthChange" options={['Shorten', 'Maintain/Grow', 'Experiment']} value={input.lengthChange} onChange={handleChange} />
        </div>

        <button
            onClick={nextStep}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-gray-900 shadow-md ${ACCENT_BG} hover:bg-yellow-400 transition duration-150 ease-in-out`}
        >
            Proceed to 360° Scan (Step 2)
            <ArrowRight className="w-5 h-5 ml-2" />
        </button>
    </>
  );

  const CaptureStep = () => (
    <>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 flex items-center">
            <Camera className={`mr-3 h-6 w-6 ${BRAND_ACCENT}`} />
            Step 2: 360° Structural Scan
        </h2>
        <p className="text-gray-600 mb-6 border-b pb-4">
            The ESDRAS AI requires a full structural assessment to eliminate guesswork.
        </p>

        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-blue-700 mb-3">Scanning Instructions:</h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Use a neutral background and good, even lighting.</li>
                <li>Take a minimum of **four photos**: Front, Left Side, Back, and Right Side.</li>
                <li>This placeholder simulation confirms image upload (for future feature).</li>
            </ul>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg mb-6">
            <label className="flex items-center text-lg font-medium text-gray-800 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isCaptureDone} 
                    onChange={() => setIsCaptureDone(!isCaptureDone)}
                    className="h-6 w-6 text-[#FFC800] border-gray-300 rounded focus:ring-[#FFC800]"
                />
                <span className="ml-3">I have completed the 360° photo capture.</span>
            </label>
        </div>

        <button
            onClick={nextStep}
            disabled={!isCaptureDone}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-gray-900 shadow-md transition duration-150 ease-in-out ${isCaptureDone ? ACCENT_BG + ' hover:bg-yellow-400' : 'bg-gray-300 cursor-not-allowed'}`}
        >
            <Send className="w-5 h-5 mr-2" />
            Run ESDRAS Precision Simulation (Step 3)
        </button>
    </>
  );

  const ResultStep = () => (
    <>
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 flex items-center">
            <CheckCircle className={`mr-3 h-6 w-6 ${BRAND_ACCENT}`} />
            Step 3: Precision Grooming Prescription
        </h2>
        <p className="text-gray-600 mb-6 border-b pb-4">
            Your final, zero-regrets recommendation is ready.
        </p>

        {recommendation && (
            <div className={`mt-8 p-6 rounded-xl shadow-lg border-2 ${recommendation.color.replace('text', 'border')} ${recommendation.color.replace('text', 'bg').replace('-600', '-50').replace('-500', '-50')}`}>
                <h3 className={`text-xl font-bold mb-2 flex items-center ${recommendation.color}`}>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    {recommendation.title}
                </h3>
                <p className="text-gray-800 mb-4">{recommendation.description}</p>
                
                <div className="mt-3 p-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-600">
                        Estimated Maintenance: 
                    </span>
                    <span className={`text-sm font-bold ml-1 ${recommendation.color}`}>
                        {recommendation.maintenance}
                    </span>
                </div>
            </div>
        )}

        <button
            onClick={() => setStep(STEP_INPUT)}
            className="w-full mt-8 flex justify-center items-center py-3 px-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
        >
            Start New Simulation
        </button>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case STEP_INPUT: return <InputStep />;
      case STEP_CAPTURE: return <CaptureStep />;
      case STEP_RESULT: return <ResultStep />;
      default: return <InputStep />;
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${BRAND_PRIMARY} flex items-center justify-center`}>
        <p className="text-white text-xl">Initializing ESDRAS system and authenticating user...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BRAND_PRIMARY} p-4 sm:p-6 font-sans flex flex-col items-center`}>
      
      {/* Header */}
      <header className={`w-full max-w-4xl p-4 flex justify-between items-center text-white border-b border-gray-700`}>
        <div className="flex items-center space-x-3">
          <EsdrasLogoSVG />
          <span className={`text-xl font-bold ${BRAND_ACCENT}`}>MVP SIMULATION</span>
        </div>
        <div className="text-sm opacity-60">
            User ID: {userId}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex justify-center w-full max-w-4xl pt-8 pb-16">
        <div className="w-full">
          
          {/* Workflow Card */}
          <div className="bg-white w-full p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-[#FFC800] mb-8">
            {renderContent()}
          </div>

          {/* User History Card */}
          <div className="bg-white w-full p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-[#FFC800]">
            <h2 className="text-2xl font-extrabold mb-4 text-gray-900 flex items-center">
              <History className={`mr-3 h-5 w-5 ${BRAND_ACCENT}`} />
              My Prescription History ({prescriptions.length})
            </h2>
            <p className="text-gray-600 mb-6 border-b pb-4">
                Saved prescriptions are tied to your User ID and persist across sessions.
            </p>

            {prescriptions.length === 0 ? (
                <p className="text-gray-500 italic">No previous prescriptions found. Complete a simulation to save your first result!</p>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {prescriptions.map((p, index) => (
                        <div key={p.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-gray-700">
                                    Prescription #{prescriptions.length - index}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {p.timestamp}
                                </span>
                            </div>
                            <p className="text-md font-semibold text-gray-800">
                                {p.input.hairType}, {p.input.density} — Recommended: {p.description.substring(p.description.indexOf('**') + 2, p.description.indexOf('**.')).trim()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full max-w-4xl text-center py-4 text-xs text-white opacity-80 mt-auto`}>
        &copy; {new Date().getFullYear()} ESDRAS Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}


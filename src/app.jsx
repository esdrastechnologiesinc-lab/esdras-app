import React, { useState, useEffect, useCallback } from 'react';
import { Target, Search, Scissors, Heart, X, Zap } from 'lucide-react';

// Color Palette & Constants based on I - ESDRAS LOGO COLOUR PALETTE.pdf
const COLORS = {
  NAVY: '#001F3F',
  GOLD: '#B8860B',
  WHITE: '#FFFFFF',
  GRAY: '#F0F0FO',
};

const MAX_FREE_STYLES = 10;
const INITIAL_STYLES_USED = 7; // Mock initial usage for demonstration

// Mock Data for the Style Library
const mockStyles = [
  { id: 1, name: "The Fade", texture: "African", length: "Short" },
  { id: 2, name: "Wavy Crew", texture: "Caucasian", length: "Medium" },
  { id: 3, name: "Coil Twist", texture: "African", length: "Short" },
  { id: 4, name: "Classic Side Part", texture: "Caucasian", length: "Short" },
];

// --- Component: Logo and Navigation ---
const Header = () => (
  <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-10">
    <div className="flex items-center space-x-2">
      <Target size={28} className="text-gray-900" />
      <h1 className="text-xl font-bold tracking-wider text-gray-900 font-sans">ESDRAS</h1>
    </div>
    <Search size={24} className="text-gray-500" />
  </header>
);

// --- Component: The Core Monetization Feature (C - MVP DESIGN STRATEGY.pdf) ---
const StyleCounter = ({ count }) => {
  const remaining = MAX_FREE_STYLES - count;
  const isLow = remaining <= 3;
  
  return (
    <div className={`p-3 mx-4 mt-4 rounded-xl shadow-lg transition-all duration-300 ${isLow ? 'bg-red-500' : 'bg-gray-100'}`}>
      <div className="flex justify-between items-center">
        <p className={`font-semibold ${isLow ? 'text-white' : 'text-gray-800'}`}>
          Styles Used: {count} / {MAX_FREE_STYLES}
        </p>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${isLow ? 'bg-white text-red-600' : 'bg-gold-500 text-white'}`} style={{ backgroundColor: isLow ? COLORS.WHITE : COLORS.GOLD }}>
          {remaining} {remaining === 1 ? 'Preview' : 'Previews'} Remaining
        </div>
      </div>
    </div>
  );
};

// --- Component: Simulated AI Preview Screen ---
const AIPreview = ({ styleName, onBook, onShare }) => {
  const [rotation, setRotation] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const handleRotate = useCallback((e) => {
    // Basic touch/mouse drag simulation
    if (e.buttons === 1 || e.touches) {
        const deltaX = e.movementX || (e.touches[0].clientX - e.touches[0].screenX);
        setRotation(prev => (prev + deltaX * 0.5) % 360);
    }
  }, []);

  const handlePreview = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    // Simulate AI Rendering delay (E - AI RENDERING TECHNICAL REQUIREMENTS (1).pdf)
    setTimeout(() => {
        setIsSimulating(false);
    }, 3000); 
  };
  
  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Preview: {styleName}</h2>
      
      {/* 360° Preview Area - Uses a placeholder as the AI is simulated */}
      <div 
        className="w-full h-80 bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl cursor-grab"
        style={{ maxWidth: '400px', transform: `rotateY(${rotation}deg)`, transition: isSimulating ? 'none' : 'transform 0.1s' }}
        onMouseMove={handleRotate}
        onTouchMove={handleRotate}
      >
        {isSimulating ? (
             <div className="flex flex-col items-center justify-center text-center p-8">
                <Zap size={48} className="animate-pulse text-indigo-600" />
                <p className="mt-4 text-lg font-semibold text-gray-700">AI Rendering...</p>
                <p className="text-sm text-gray-500">Processing complex hair physics model...</p>
            </div>
        ) : (
            <div className="text-center">
                <img 
                    src={`https://placehold.co/300x300/1F3F00/FFFFFF?text=3D+AI+PREVIEW\n${styleName}\nDrag+to+Rotate`} 
                    alt="AI Preview Placeholder" 
                    className="rounded-full border-4 border-navy-700"
                    style={{ backgroundColor: COLORS.NAVY }}
                />
                 <p className="text-xs text-gray-600 mt-2">Drag mouse/swipe to rotate 360°</p>
            </div>
        )}
      </div>

      <div className="w-full max-w-sm mt-8 space-y-3">
        {/* Book Now Button (Secondary: Metallic Gold/Copper) */}
        <button 
          onClick={onBook}
          style={{ backgroundColor: COLORS.GOLD }}
          className="w-full flex items-center justify-center py-3 rounded-xl text-white font-bold text-lg shadow-gold transition duration-300 hover:bg-yellow-700"
        >
          <Scissors size={20} className="mr-2" />
          Find Barber & Book Now
        </button>
        
        {/* Share Button (Monetization & Sharing - C - MVP DESIGN STRATEGY.pdf) */}
        <button 
          onClick={onShare}
          className="w-full flex items-center justify-center py-3 rounded-xl bg-gray-800 text-white font-bold text-lg shadow-lg transition duration-300 hover:bg-gray-700"
        >
          <Heart size={20} className="mr-2" />
          Save & Share Side-by-Side
        </button>
      </div>
      <button onClick={handlePreview} className="mt-4 text-sm text-indigo-600 font-medium hover:underline">
        {isSimulating ? 'Processing...' : 'Run AI Preview Simulation'}
      </button>
    </div>
  );
};

// --- Component: Subscription Paywall Modal (Step 11 - A - ESDRAS DETAILED USER FLOW.pdf) ---
const PaywallModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
    <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl relative" style={{ backgroundColor: COLORS.NAVY }}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
        <X size={24} />
      </button>
      
      <div className="text-center text-white">
        <Zap size={48} style={{ color: COLORS.GOLD }} className="mx-auto mb-4" />
        <h3 className="text-3xl font-extrabold mb-2 tracking-wide">Unlock Premium Styling</h3>
        <p className="text-gray-300 mb-6">
          You've used all 10 free styles. Upgrade to view unlimited premium styles and imports.
        </p>
        
        <ul className="text-left space-y-2 mb-8 text-lg font-medium">
          <li className="flex items-center">
            <span style={{ color: COLORS.GOLD }} className="mr-3">✓</span> Unlimited AI Previews
          </li>
          <li className="flex items-center">
            <span style={{ color: COLORS.GOLD }} className="mr-3">✓</span> StyleSnap & Import Feature
          </li>
          <li className="flex items-center">
            <span style={{ color: COLORS.GOLD }} className="mr-3">✓</span> Priority Booking Access
          </li>
        </ul>
        
        {/* Call to Action - Gold Accent */}
        <button 
          className="w-full py-4 rounded-xl text-navy-900 font-bold text-xl shadow-xl transition duration-300 hover:bg-yellow-300"
          style={{ backgroundColor: COLORS.GOLD }}
        >
          Subscribe Now - $9.99/mo
        </button>
        <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-white underline">
          Maybe later
        </button>
      </div>
    </div>
  </div>
);

// --- Main App Component ---
const App = () => {
  const [stylesUsed, setStylesUsed] = useState(INITIAL_STYLES_USED);
  const [selectedStyle, setSelectedStyle] = useState(mockStyles[0]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [message, setMessage] = useState('');

  // Function to simulate style selection and counter check
  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    
    if (stylesUsed >= MAX_FREE_STYLES) {
      setShowPaywall(true);
      setMessage("Limit reached. Please subscribe.");
      return;
    }
    
    // Simulate using a free style count
    setStylesUsed(prev => prev + 1);
    setMessage(`Previewing "${style.name}". Styles used: ${stylesUsed + 1}/${MAX_FREE_STYLES}`);
  };

  const handleBook = () => {
    setMessage(`Booking flow initiated for ${selectedStyle.name}. Redirecting to Barber Match...`);
  };

  const handleShare = () => {
    setMessage(`Image for ${selectedStyle.name} saved and ready to share!`);
  };

  useEffect(() => {
    // Clear message after 4 seconds
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header and Style Counter */}
      <Header />
      <StyleCounter count={stylesUsed} />
      
      {/* Global Message Box */}
      {message && (
        <div className="mx-4 mt-2 p-3 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg shadow-md transition-opacity duration-300">
          {message}
        </div>
      )}

      {/* Style Preview Section */}
      <main className="flex-grow p-4">
        <AIPreview 
          styleName={selectedStyle.name} 
          onBook={handleBook} 
          onShare={handleShare}
        />
        
        {/* Style Selection Library (Scrollable) */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-3 text-gray-800 border-b pb-2">Style Library</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {mockStyles.map(style => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style)}
                className={`flex-shrink-0 w-32 h-40 rounded-xl p-3 shadow-lg transition duration-200 text-left ${
                  selectedStyle.id === style.id ? 'border-4 border-indigo-600 ring-4 ring-indigo-300 bg-white' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="w-full h-2/3 bg-gray-300 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                  {style.name} Mock
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900 truncate">{style.name}</p>
                <p className="text-xs text-gray-500">{style.texture}</p>
              </button>
            ))}
            <button
                onClick={() => handleStyleSelect({ id: 99, name: "Premium Look", texture: "New", length: "Long" })}
                className="flex-shrink-0 w-32 h-40 rounded-xl p-3 shadow-lg transition duration-200 text-left bg-navy-800 border-2 border-gold-500 hover:scale-105"
                style={{ backgroundColor: COLORS.NAVY }}
            >
                <div className="w-full h-2/3 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-xs font-semibold text-white">
                    <Zap size={24} style={{ color: COLORS.GOLD }} className="mb-1" />
                    PREMIUM STYLE
                </div>
                <p className="mt-2 text-sm font-medium text-white truncate">Exclusive Import</p>
                <p className="text-xs" style={{ color: COLORS.GOLD }}>Requires Subscription</p>
            </button>
          </div>
        </div>
      </main>
      
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
};

export default App;


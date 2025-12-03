import React from 'react';

// Brand Colors
const BRAND_PRIMARY = 'bg-[#0A192F]'; // Dark Navy/Blue
const BRAND_ACCENT = 'text-[#FFC800]'; // Gold/Orange Accent

// Inline SVG for ESDRAS Logo (Matches visual identity and ensures no loading failure)
const EsdrasLogoSVG = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 200 70" 
    className="h-8 w-auto fill-current text-[#FFC800]"
  >
    {/* Outline Circle (Gold) */}
    <circle cx="35" cy="35" r="30" stroke="#FFC800" strokeWidth="6" fill="none" />
    
    {/* Inner Head Silhouette (Navy) */}
    <path 
      d="M35 15 C 20 15, 20 40, 35 40 C 50 40, 50 15, 35 15 M 25 40 L 45 40 L 45 60 L 25 60 Z" 
      fill="#0A192F" 
      transform="scale(0.8) translate(8 5)"
    />
    
    {/* Text Placeholder (ESDRAS MVP) */}
    <text x="75" y="45" fontFamily="sans-serif" fontSize="30" fontWeight="bold" fill="white">
      ESDRAS
    </text>
  </svg>
);


// Main Application Component - Static and Styled
export default function App() {
  return (
    // Outer container with Navy background
    <div className={`min-h-screen ${BRAND_PRIMARY} p-4 sm:p-6 font-sans flex flex-col items-center`}>
      
      {/* Navigation Bar/Header - Fixed Width */}
      <header className={`w-full max-w-4xl p-4 flex justify-between items-center text-white border-b border-gray-700`}>
        {/* Logo and App Title */}
        <div className="flex items-center space-x-3">
          <EsdrasLogoSVG />
          <span className={`text-xl font-bold ${BRAND_ACCENT}`}>
            MVP SIMULATION
          </span>
        </div>
        
        {/* Static Nav Links (Hidden on mobile, showing desktop width) */}
        <nav className="hidden sm:flex space-x-6 text-sm opacity-80">
          <a href="#" className="hover:underline">Dashboard</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Settings</a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex justify-center w-full max-w-4xl pt-8 pb-16">
        {/* Central Content Card */}
        <div className="bg-white w-full p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-[#FFC800]">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-900">
            Welcome to the ESDRAS Platform
          </h2>
          <p className="text-gray-600 mb-6">
            The application shell is now stable. This static view confirms that the styling engine (Tailwind) is fully operational and the logo is securely embedded. We are ready to integrate dynamic content.
          </p>
          
          {/* Status Check Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className={`font-semibold ${BRAND_ACCENT} mb-1`}>Next Step Readiness</p>
            <p className="text-sm text-gray-700">
              The next phase is adding real-time data input forms and simulation results logic.
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className={`w-full max-w-4xl text-center py-4 text-xs text-white opacity-80 mt-auto`}>
        &copy; {new Date().getFullYear()} ESDRAS Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}


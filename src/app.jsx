import React, { useState } from 'react';
import { Settings, CheckCircle, Send } from 'lucide-react';

// Brand Colors
const BRAND_PRIMARY = 'bg-[#0A192F]'; // Dark Navy/Blue
const BRAND_ACCENT = 'text-[#FFC800]'; // Gold/Orange Accent
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

// Helper component for styled dropdowns
const SelectInput = ({ label, options, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
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
  const [input, setInput] = useState({
    hairType: '',
    density: '',
    lengthChange: '',
  });
  const [recommendation, setRecommendation] = useState(null);

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
    // Clear recommendation on new input
    setRecommendation(null);
  };

  /**
   * ESDRAS Core Logic: Simplified function to generate a precision recommendation
   * based on selected inputs. This simulates the intelligence of the platform.
   */
  const runSimulation = () => {
    // Check if all fields are selected
    if (!input.hairType || !input.density || !input.lengthChange) {
      setRecommendation({
        title: "Incomplete Data",
        description: "Please select all three grooming parameters to run the precision simulation.",
        color: "text-red-500"
      });
      return;
    }

    let cutStyle = "";
    let maintenance = "Medium";
    let color = "text-green-600"; // Default Success

    // Logic based on Hair Type & Length Change
    if (input.hairType === 'Wavy/Curly') {
      if (input.lengthChange === 'Shorten') {
        cutStyle = "Structured Fade with Tapered Neckline";
        maintenance = "High (Requires specific curl products)";
      } else {
        cutStyle = "Natural Layered Movement (Avoid thinning)";
      }
    } else if (input.hairType === 'Straight/Fine') {
      if (input.lengthChange === 'Shorten') {
        cutStyle = "Textured Crop or Undercut for Volume";
        maintenance = "Low (Simple styling)";
      } else {
        cutStyle = "Subtle Graduation for Density Illusion";
        maintenance = "Medium (Blow-dry recommended)";
      }
    } else if (input.hairType === 'Coily/Kinky') {
       if (input.lengthChange === 'Shorten') {
        cutStyle = "Sculpted Afro or Precision Line-Up";
        maintenance = "Medium to High (Moisture essential)";
      } else {
        cutStyle = "Freeform Coils (Moisture retention focus)";
      }
    }
    
    // Logic based on Density
    if (input.density === 'Thin/Sparse' && input.lengthChange === 'Shorten') {
        cutStyle += " – Maximize Perimeter Density";
        maintenance = "Low to Medium";
        color = "text-blue-600";
    }

    setRecommendation({
      title: "Precision Grooming Prescription",
      description: `Based on your analysis (Hair Type: ${input.hairType}, Density: ${input.density}), the ESDRAS AI recommends the **${cutStyle}**. This style is optimized for maximum aesthetic impact and minimal regret.`,
      maintenance: maintenance,
      color: color,
    });
  };

  return (
    <div className={`min-h-screen ${BRAND_PRIMARY} p-4 sm:p-6 font-sans flex flex-col items-center`}>
      
      {/* Navigation Bar/Header */}
      <header className={`w-full max-w-4xl p-4 flex justify-between items-center text-white border-b border-gray-700`}>
        <div className="flex items-center space-x-3">
          <EsdrasLogoSVG />
          <span className={`text-xl font-bold ${BRAND_ACCENT}`}>
            MVP SIMULATION
          </span>
        </div>
        <nav className="hidden sm:flex space-x-6 text-sm opacity-80">
          <a href="#" className="hover:underline">Dashboard</a>
          <a href="#" className="hover:underline">About</a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex justify-center w-full max-w-4xl pt-8 pb-16">
        {/* Central Content Card */}
        <div className="bg-white w-full p-6 sm:p-8 rounded-xl shadow-2xl border-t-4 border-[#FFC800]">
          
          <h2 className="text-3xl font-extrabold mb-4 text-gray-900 flex items-center">
            <Settings className={`mr-3 h-6 w-6 ${BRAND_ACCENT}`} />
            Grooming Simulation Input
          </h2>
          <p className="text-gray-600 mb-6 border-b pb-4">
            Input your key hair characteristics below for a **Precision Grooming Prescription** powered by the ESDRAS AI.
          </p>
          
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SelectInput
                label="1. Hair Type/Texture"
                name="hairType"
                options={['Straight/Fine', 'Wavy/Curly', 'Coily/Kinky']}
                value={input.hairType}
                onChange={handleChange}
            />
            <SelectInput
                label="2. Hair Density"
                name="density"
                options={['Thin/Sparse', 'Medium', 'Thick/High']}
                value={input.density}
                onChange={handleChange}
            />
            <SelectInput
                label="3. Desired Length Change"
                name="lengthChange"
                options={['Shorten', 'Maintain/Grow', 'Experiment']}
                value={input.lengthChange}
                onChange={handleChange}
            />
          </div>

          {/* Simulation Button */}
          <button
            onClick={runSimulation}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-gray-900 shadow-md ${ACCENT_BG} hover:bg-yellow-400 transition duration-150 ease-in-out`}
          >
            <Send className="w-5 h-5 mr-2" />
            Run ESDRAS Precision Simulation
          </button>
          
          {/* Simulation Output */}
          {recommendation && (
            <div className={`mt-8 p-6 rounded-xl shadow-lg border-2 ${recommendation.color === "text-red-500" ? 'border-red-500 bg-red-50' : 'border-green-600 bg-green-50'}`}>
              <h3 className={`text-xl font-bold mb-2 flex items-center ${recommendation.color}`}>
                <CheckCircle className="w-6 h-6 mr-2" />
                {recommendation.title}
              </h3>
              <p className="text-gray-800 mb-4">{recommendation.description}</p>
              
              {recommendation.maintenance && recommendation.color !== "text-red-500" && (
                <div className="mt-3 p-3 border-t border-green-200">
                    <span className="text-sm font-semibold text-gray-600">
                        Estimated Maintenance: 
                    </span>
                    <span className={`text-sm font-bold ml-1 ${recommendation.color}`}>
                        {recommendation.maintenance}
                    </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className={`w-full max-w-4xl text-center py-4 text-xs text-white opacity-80 mt-auto`}>
        &copy; {new Date().getFullYear()} ESDRAS Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}

  

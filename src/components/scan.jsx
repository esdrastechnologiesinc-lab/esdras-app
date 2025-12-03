// ... (Your existing imports)

// --- STUB COMPONENTS (Updated Scan component below) ---
// ... (The rest of your stubs remain here)

// --- SCAN COMPONENT (Interactive Mock to feed data to Checkout) ---
const Scan = ({ user, setCurrentPrescription, navigate }) => {
    const [hairType, setHairType] = useState('Wavy Medium');
    const [desiredLength, setDesiredLength] = useState('Shorten Significantly');
    const [status, setStatus] = useState('input'); // 'input', 'scanning', 'ready'

    const generatePrescription = useCallback(() => {
        // Mock data based on inputs
        const recommendation = hairType.includes('Wavy') && desiredLength.includes('Shorten') 
            ? "Textured Crop with Tapered Sides" 
            : "Precision Layering for Volume";
        
        return {
            recommendation,
            hairType,
            desiredLength,
            maintenance: "Medium (4-6 weeks)"
        };
    }, [hairType, desiredLength]);

    const handleRunScan = () => {
        setStatus('scanning');
        // Simulate scanning time
        setTimeout(() => {
            const result = generatePrescription();
            setCurrentPrescription(result);
            setStatus('ready');
        }, 1500);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const selectClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-[#B8860B] focus:border-[#B8860B] bg-white text-gray-800";
    const prescription = generatePrescription();

    return (
        <div className="p-8 bg-white shadow-lg rounded-xl space-y-6">
            <h2 className="text-2xl font-bold text-[#001F3F]">ESDRAS Precision Scan (Mock)</h2>
            
            {status === 'input' && (
                <div className="space-y-4">
                    <select value={hairType} onChange={(e) => setHairType(e.target.value)} className={selectClass}>
                        <option value="Straight Fine">Straight (Fine)</option>
                        <option value="Wavy Medium">Wavy (Medium)</option>
                        <option value="Curly Coarse">Curly (Coarse)</option>
                    </select>
                    <select value={desiredLength} onChange={(e) => setDesiredLength(e.target.value)} className={selectClass}>
                        <option value="Shorten Significantly">Shorten Significantly</option>
                        <option value="Maintain Current">Maintain Current</option>
                        <option value="Grow Out Slightly">Grow Out Slightly</option>
                    </select>
                    <button 
                        onClick={handleRunScan} 
                        style={btn} 
                        className="w-full py-3 mt-4"
                    >
                        Run Simulation
                    </button>
                </div>
            )}

            {status === 'scanning' && (
                <div className="text-center py-10">
                    <p className="text-[#001F3F] text-xl font-semibold">Scanning and Calculating...</p>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 bg-[#B8860B] w-1/2 animate-pulse"></div>
                    </div>
                </div>
            )}

            {status === 'ready' && (
                <div className="space-y-4 border p-4 rounded-lg bg-yellow-50 border-yellow-300">
                    <p className="text-lg font-bold text-[#001F3F]">Prescription Ready (Locked):</p>
                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                        <span className="text-gray-700 font-semibold">{prescription.recommendation}</span>
                        <span className="text-sm text-red-500 font-bold">LOCKED</span>
                    </div>
                    
                    <button 
                        onClick={handleCheckout} 
                        style={{...btn, background: '#001F3F'}} 
                        className="w-full py-3"
                    >
                        Proceed to Payment ($10)
                    </button>
                </div>
            )}
            
        </div>
    );
};

// ... (The rest of your original code follows)


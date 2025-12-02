import React from 'react';

// Basic App Component - you can place your full application code here.
const App = () => {
  return (
    <div className="min-h-screen bg-[#001F3F] text-[#FFFFFF] flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#B8860B] mb-2">
          ESDRAS App
        </h1>
        <p className="text-lg text-[#F0F0F0]">
          Deployment Success Test
        </p>
      </header>

      <main className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-[#B8860B]">
          Status: Ready to Build
        </h2>
        <p className="text-base mb-6">
          If you see this, your React environment is configured correctly.
          Now you can integrate your application logic and styles here!
        </p>
        <button
          onClick={() => console.log('App ready!')}
          className="w-full py-3 px-6 bg-[#B8860B] text-[#001F3F] font-bold rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md"
        >
          Check Console
        </button>
      </main>

      <footer className="mt-10 text-sm text-gray-500">
        Using Deep Navy, Metallic Gold, and Crisp White Palette
      </footer>
    </div>
  );
};

export default App;


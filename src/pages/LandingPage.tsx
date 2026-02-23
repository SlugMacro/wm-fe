import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Whales Market
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          The first over-the-counter (OTC) decentralized exchange platform. 
          Trade tokens, points, and pre-market assets securely.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
            Enter App
          </button>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all">
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

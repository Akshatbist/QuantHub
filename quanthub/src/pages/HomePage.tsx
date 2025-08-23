import React from "react";
import Header from "../components/Header";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            Welcome to Quant Hub
          </h1>
          <p className="text-lg text-gray-300 mb-12 text-center max-w-2xl mx-auto">
            Your quant trading platform. Explore strategies, run backtests, and
            connect with the community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">Strategies</h3>
              <p className="text-gray-400 text-sm">
                Browse and upload trading strategies
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-xl font-bold mb-2">Backtester</h3>
              <p className="text-gray-400 text-sm">
                Test strategies on historical data
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-gray-400 text-sm">
                Connect with other traders
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center hover:scale-105 transition-transform cursor-pointer">
              <div className="text-3xl mb-4">🗂️</div>
              <h3 className="text-xl font-bold mb-2">Datasets</h3>
              <p className="text-gray-400 text-sm">Access financial datasets</p>
            </div>
          </div>
        </div>
        <style>{`
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradientX 3s ease-in-out infinite;
          }
          @keyframes gradientX {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </main>
    </div>
  );
};

export default HomePage;

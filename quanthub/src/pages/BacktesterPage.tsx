import React from "react";
import Header from "../components/Header";

const mockBacktests = [
  {
    id: 1,
    strategy: "Mean Reversion Alpha",
    date: "2024-05-01",
    totalReturn: "18.2%",
    sharpe: 1.42,
    maxDrawdown: "-6.5%",
  },
  {
    id: 2,
    strategy: "Momentum Machine",
    date: "2024-04-28",
    totalReturn: "25.7%",
    sharpe: 1.88,
    maxDrawdown: "-8.1%",
  },
  {
    id: 3,
    strategy: "Pairs Trading Bot",
    date: "2024-04-20",
    totalReturn: "12.4%",
    sharpe: 1.11,
    maxDrawdown: "-4.2%",
  },
  {
    id: 4,
    strategy: "Breakout Hunter",
    date: "2024-04-15",
    totalReturn: "31.0%",
    sharpe: 2.05,
    maxDrawdown: "-10.3%",
  },
];

const BacktesterPage: React.FC = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
          Backtest Results
        </h1>
        <p className="text-lg text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          Review your recent backtests. Click on a result to view detailed
          performance, equity curve, and trade logs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mockBacktests.map((bt, i) => (
            <div
              key={bt.id}
              className="bg-gray-800 rounded-xl p-6 flex flex-col shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">{bt.strategy}</span>
                <span className="ml-auto text-xs text-gray-400">{bt.date}</span>
              </div>
              <div className="flex flex-col gap-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="font-semibold text-green-400">
                    {bt.totalReturn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio:</span>
                  <span className="font-semibold text-blue-300">
                    {bt.sharpe}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown:</span>
                  <span className="font-semibold text-red-400">
                    {bt.maxDrawdown}
                  </span>
                </div>
              </div>
              <a
                href={`/backtester/${bt.id}`}
                className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition shadow text-center font-semibold"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
        <style>{`
          .animate-fade-in {
            animation: fadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
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

export default BacktesterPage;

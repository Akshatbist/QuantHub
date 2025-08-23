import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";

const BacktesterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
          Backtest Details
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          Backtest ID: <span className="font-mono">{id}</span>
        </p>
        <p className="text-gray-400">
          Backtest details will be implemented here.
        </p>
      </main>
    </div>
  );
};

export default BacktesterDetailPage;

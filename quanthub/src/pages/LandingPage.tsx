import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <div className="w-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center py-24 px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              Democratizing Quant Strategy Sharing
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl">
              A Hugging Face-like platform for quant traders and ML strategy
              developers. Upload, test, run, and benchmark quant models in a
              user-friendly, API-accessible, community-driven platform.
            </p>
            <Link
              to="/auth"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105"
            >
              Get Started
            </Link>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="py-16 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Upload Strategies",
                desc: "Easily upload and share your quant strategies with the community.",
                icon: "⬆️",
              },
              {
                title: "Run Backtests",
                desc: "Test strategies on historical data with robust, fast backtesting.",
                icon: "📈",
              },
              {
                title: "Performance Metrics",
                desc: "Visualize returns, drawdowns, Sharpe ratios, and more.",
                icon: "📊",
              },
              {
                title: "Host Datasets",
                desc: "Access and contribute to a growing library of financial datasets.",
                icon: "🗂️",
              },
              {
                title: "Community Profiles",
                desc: "Showcase your work, fork strategies, and star your favorites.",
                icon: "👥",
              },
              {
                title: "API Access",
                desc: "Integrate with our platform programmatically for automation.",
                icon: "🔗",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="text-4xl mb-4 animate-bounce-slow">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-center">{f.desc}</p>
              </div>
            ))}
          </section>

          {/* Call to Action */}
          <section
            id="get-started"
            className="py-20 flex flex-col items-center bg-gradient-to-r from-blue-900/60 to-purple-900/60 mt-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to share your quant strategy?
            </h2>
            <a
              href="#upload"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105"
            >
              Upload Now
            </a>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-700 mt-12">
          &copy; {new Date().getFullYear()} Quant Hub. All rights reserved.
        </footer>

        {/* Animations */}
        <style>{`
          .animate-fade-in-up {
            animation: fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-bounce-slow {
            animation: bounceSlow 2.5s infinite;
          }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
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
      </div>
    </div>
  );
};

export default LandingPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { session, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
    navigate("/landing");
  };

  const getUserInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full flex items-center justify-between px-8 py-6 border-b border-gray-700">
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full animate-pulse" />
        <span className="text-2xl font-bold tracking-tight">Quant Hub</span>
      </Link>
      <nav className="hidden md:flex gap-8 text-gray-300">
        <Link to="/strategies" className="hover:text-white transition">
          Strategies
        </Link>
        <Link to="/community" className="hover:text-white transition">
          Community
        </Link>
        <Link to="/datasets" className="hover:text-white transition">
          Datasets
        </Link>
        <Link to="/docs" className="hover:text-white transition">
          Docs
        </Link>
      </nav>
      {loading ? (
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
      ) : session ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials(session.user.email || "")}
            </div>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                  {session.user.email}
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          to="/auth"
          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition shadow"
        >
          Get Started
        </Link>
      )}
    </header>
  );
};

export default Header;

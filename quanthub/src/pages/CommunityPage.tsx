import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

interface CommunityUser {
  email: string;
  strategies: number;
  datasets: number;
  totalContributions: number;
  lastActive: string;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  joinedDate: string;
}

type SortOption =
  | "contributions"
  | "strategies"
  | "datasets"
  | "recent"
  | "name";

const CommunityPage: React.FC = () => {
  const { session } = useAuth();
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("contributions");
  const [filterBy, setFilterBy] = useState<"all" | "strategies" | "datasets">(
    "all"
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [stratRes, dataRes] = await Promise.all([
          supabase.from("strategies").select("author_email, created_at"),
          supabase.from("datasets").select("author_email, created_at"),
        ]);

        if (stratRes.error || dataRes.error)
          throw stratRes.error || dataRes.error;

        const stratCounts: Record<string, number> = {};
        const stratDates: Record<string, string[]> = {};
        stratRes.data?.forEach((s) => {
          if (!s.author_email) return;
          stratCounts[s.author_email] = (stratCounts[s.author_email] || 0) + 1;
          stratDates[s.author_email] = stratDates[s.author_email] || [];
          stratDates[s.author_email].push(s.created_at);
        });

        const dataCounts: Record<string, number> = {};
        const dataDates: Record<string, string[]> = {};
        dataRes.data?.forEach((d) => {
          if (!d.author_email) return;
          dataCounts[d.author_email] = (dataCounts[d.author_email] || 0) + 1;
          dataDates[d.author_email] = dataDates[d.author_email] || [];
          dataDates[d.author_email].push(d.created_at);
        });

        const allEmails = Array.from(
          new Set([...Object.keys(stratCounts), ...Object.keys(dataCounts)])
        );

        const users: CommunityUser[] = allEmails.map((email) => {
          const strategies = stratCounts[email] || 0;
          const datasets = dataCounts[email] || 0;
          const totalContributions = strategies + datasets;
          const allDates = [
            ...(stratDates[email] || []),
            ...(dataDates[email] || []),
          ].sort();
          const lastActive = allDates[allDates.length - 1] || "";
          const joinedDate = allDates[0] || "";

          const displayName = email
            .split("@")[0]
            .replace(/[0-9]/g, "")
            .replace(/[._-]/g, " ")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          return {
            email,
            strategies,
            datasets,
            totalContributions,
            lastActive,
            joinedDate,
            displayName,
          };
        });

        setUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load community profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    if (filterBy === "strategies") {
      result = result.filter((u) => u.strategies > 0);
    } else if (filterBy === "datasets") {
      result = result.filter((u) => u.datasets > 0);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "contributions":
          return b.totalContributions - a.totalContributions;
        case "strategies":
          return b.strategies - a.strategies;
        case "datasets":
          return b.datasets - a.datasets;
        case "recent":
          return (
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
        case "name":
          return a.displayName.localeCompare(b.displayName);
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchTerm, sortBy, filterBy]);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
    return `${Math.floor(diff / 365)} years ago`;
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12">
        {/* TITLE */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
          Community Profiles
        </h1>

        {/* FILTER + SEARCH */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="contributions">Most Active</option>
              <option value="strategies">Most Strategies</option>
              <option value="datasets">Most Datasets</option>
              <option value="recent">Recently Active</option>
              <option value="name">Name A-Z</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">All Users</option>
              <option value="strategies">Strategy Creators</option>
              <option value="datasets">Dataset Contributors</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} community members
          </div>
        </div>

        {/* LOADING / ERROR / RESULTS */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm
              ? "No users match your search."
              : "No community members yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredUsers.map((user, i) => {
              const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.displayName
              )}&background=4f46e5&color=fff&size=128`;
              return (
                <div
                  key={user.email}
                  className="bg-gray-800 rounded-xl p-6 flex flex-col shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in border border-gray-700 hover:border-blue-500"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={avatarUrl}
                      className="w-12 h-12 rounded-full border-2 border-blue-500 shadow"
                    />
                    <div>
                      <h3 className="text-lg font-bold">{user.displayName}</h3>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mb-4 text-xs">
                    <span className="bg-blue-700/30 text-blue-300 px-2 py-1 rounded">
                      {user.strategies} Strategies
                    </span>
                    <span className="bg-green-700/30 text-green-300 px-2 py-1 rounded">
                      {user.datasets} Datasets
                    </span>
                    <span className="bg-purple-700/30 text-purple-300 px-2 py-1 rounded">
                      {user.totalContributions} Total
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    <div>Last active: {getTimeAgo(user.lastActive)}</div>
                    <div>Joined: {getTimeAgo(user.joinedDate)}</div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <a
                      href={`/community/${encodeURIComponent(user.email)}`}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-center font-semibold"
                    >
                      View Profile
                    </a>
                    {session?.user.email !== user.email && (
                      <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STYLES */}
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.6s ease-in-out both;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradientX 4s ease-in-out infinite;
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

export default CommunityPage;

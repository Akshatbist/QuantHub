import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

interface Strategy {
  id: number;
  name: string;
  description: string;
  category: string;
  risk_level: string;
  time_frame: string;
  assets: string;
  tags: string[];
  file_url: string;
  file_name: string;
  file_size: number;
  author_email: string;
  created_at: string;
}

interface Dataset {
  id: number;
  name: string;
  description: string;
  category: string;
  data_type: string;
  time_frame: string;
  assets: string;
  tags: string[];
  file_url: string;
  file_name: string;
  file_size: number;
  author_email: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const { session, loading } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoadingData(true);
    const fetchData = async () => {
      const userEmail = session.user.email;
      const [stratRes, dataRes] = await Promise.all([
        supabase
          .from("strategies")
          .select("*")
          .eq("author_email", userEmail)
          .order("created_at", { ascending: false }),
        supabase
          .from("datasets")
          .select("*")
          .eq("author_email", userEmail)
          .order("created_at", { ascending: false }),
      ]);
      setStrategies(stratRes.data || []);
      setDatasets(dataRes.data || []);
      setLoadingData(false);
    };
    fetchData();
  }, [session]);

  if (loading || !session) {
    return (
      <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-300">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  const userEmail = session.user.email;
  const userInitials = userEmail
    ? userEmail.split("@")[0].substring(0, 2).toUpperCase()
    : "U";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userEmail || ""
  )}&background=4f46e5&color=fff`;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <Header />
      <main className="flex-1 px-4 py-12 max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-gray-800 rounded-2xl p-8 shadow-lg">
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg mb-4 md:mb-0"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{userEmail}</h2>
            <div className="flex gap-6 text-gray-400 text-lg mb-2">
              <span>
                <span className="font-bold text-white text-2xl">
                  {strategies.length}
                </span>{" "}
                Strategies
              </span>
              <span>
                <span className="font-bold text-white text-2xl">
                  {datasets.length}
                </span>{" "}
                Datasets
              </span>
            </div>
            {/* <p className="text-gray-400">Add a bio or display name here in the future.</p> */}
          </div>
        </div>

        {/* My Strategies */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">My Strategies</h3>
          {loadingData ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : strategies.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No strategies uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {strategies.map((strategy, i) => (
                <div
                  key={strategy.id}
                  className="bg-gray-900 rounded-xl p-6 flex flex-col shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">{strategy.name}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(strategy.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">
                    {strategy.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {strategy.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-700/30 text-blue-300 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4 text-xs">
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded font-medium">
                      {strategy.category}
                    </span>
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded font-medium">
                      {strategy.risk_level}
                    </span>
                  </div>
                  <a
                    href={`/strategies/${strategy.id}`}
                    className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition shadow text-center font-semibold"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Datasets */}
        <section>
          <h3 className="text-2xl font-bold mb-4">My Datasets</h3>
          {loadingData ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No datasets uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {datasets.map((dataset, i) => (
                <div
                  key={dataset.id}
                  className="bg-gray-900 rounded-xl p-6 flex flex-col shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">{dataset.name}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(dataset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">
                    {dataset.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dataset.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-700/30 text-blue-300 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4 text-xs">
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded font-medium">
                      {dataset.category}
                    </span>
                    <span className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded font-medium">
                      {dataset.data_type}
                    </span>
                  </div>
                  <a
                    href={`/datasets/${dataset.id}`}
                    className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition shadow text-center font-semibold"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;

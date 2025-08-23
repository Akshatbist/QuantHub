// frontend/quantai/src/pages/DatasetsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import AuthNotification from "../components/AuthNotification";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

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

const DatasetsPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasets();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("datasets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "datasets",
        },
        () => {
          // Refetch datasets when there are changes
          fetchDatasets();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDatasets(data || []);
    } catch (err) {
      console.error("Error fetching datasets:", err);
      setError("Failed to load datasets");
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!session) {
      setShowAuthNotification(true);
      return;
    }
    navigate("/datasets/upload");
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            Datasets
          </h1>
          <button
            className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold shadow transition"
            onClick={handleUploadClick}
          >
            Upload Dataset
          </button>
        </div>
        <p className="text-lg text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          Browse and download community datasets for quant research. Click on a
          dataset to view details, schema, and download options.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchDatasets}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No Datasets Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Be the first to upload a dataset! Share your data with the
                community.
              </p>
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Upload Your First Dataset
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {datasets.map((dataset, i) => (
              <div
                key={dataset.id}
                className="bg-gray-800 rounded-xl p-6 flex flex-col shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold">{dataset.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    by {dataset.author_email}
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
                  View Dataset
                </a>
              </div>
            ))}
          </div>
        )}
        <AuthNotification
          isVisible={showAuthNotification}
          onClose={() => setShowAuthNotification(false)}
          message="You need to be signed in to upload datasets. Please sign in to continue."
        />
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

export default DatasetsPage;

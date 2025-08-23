import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

interface Strategy {
  id: number;
  name: string;
  description: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  author_email: string;
}

const StrategiesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // 1. get the ID from URL
  const [strategy, setStrategy] = useState<Strategy | null>(null); // 2. store the row
  const [loading, setLoading] = useState(true); // spinner state
  const [error, setError] = useState<string | null>(null); // error state
  const [code, setCode] = useState<string>(""); // Python file preview

  useEffect(() => {
    const fetchStrategy = async () => {
      setLoading(true);
      setError(null);

      // 3. Fetch one row from Supabase by ID
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Failed to load strategy.");
        setStrategy(null);
      } else {
        setStrategy(data as Strategy);

        // 4. If we have a file URL, try fetching its contents for preview
        if (data?.file_url && data?.file_name?.endsWith(".py")) {
          try {
            const res = await fetch(data.file_url);
            const text = await res.text();
            setCode(text);
          } catch {
            setCode("// Could not load code preview.");
          }
        }
      }
      setLoading(false);
    };

    if (id) {
      fetchStrategy();
    }
  }, [id]);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12 max-w-4xl mx-auto">
        {/* 5. Spinner */}
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading strategy...</p>
          </div>
        ) : error ? (
          // 6. Error message
          <div className="text-center text-red-400">{error}</div>
        ) : strategy ? (
          // 7. Show strategy details
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              {strategy.name}
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              Strategy ID: <span className="font-mono">{strategy.id}</span>
            </p>
            <p className="text-gray-400 mb-6">{strategy.description}</p>

            {/* 8. Download button */}
            {strategy.file_url && (
              <a
                href={strategy.file_url}
                download={strategy.file_name || undefined}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow transition"
              >
                Download Code
              </a>
            )}

            {/* 9. Code preview */}
            {code && (
              <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                  <span className="font-mono text-sm">
                    {strategy.file_name}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-auto text-sm">
                  <code>{code}</code>
                </pre>
              </div>
            )}
          </>
        ) : (
          // 10. Fallback if no row found
          <p className="text-center text-gray-400">No strategy found.</p>
        )}
      </main>
    </div>
  );
};

export default StrategiesDetailPage;

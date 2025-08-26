import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { createClient } from "@supabase/supabase-js";
import { codeToHtml } from "shiki"; // <-- Shiki

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface Strategy {
  id: number;
  name: string;
  description: string;
  file_path: string | null; // <-- make sure this matches your DB column
  file_name: string | null;
  created_at: string;
  author_email: string;
}

const StrategiesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  // --- Fetch row + file text ---
  useEffect(() => {
    const fetchStrategy = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Failed to load strategy.");
        setStrategy(null);
        setLoading(false);
        return;
      }

      setStrategy(data as Strategy);

      if (data.file_path) {
        try {
          const { data: file, error: fileError } = await supabase.storage
            .from("strategies")
            .download(data.file_path);

          if (fileError) throw fileError;

          const rawText = await file.text();

          // For .ipynb, try to extract code cells for a nicer preview
          if (data.file_name?.toLowerCase().endsWith(".ipynb")) {
            try {
              const asJson = JSON.parse(rawText);
              const cells: string[] = (asJson?.cells || [])
                .filter((c: any) => c.cell_type === "code")
                .map((c: any, idx: number) => {
                  const src = Array.isArray(c.source)
                    ? c.source.join("")
                    : String(c.source ?? "");
                  return `# In [${idx}]\n${src}`;
                });
              setCode(
                cells.length
                  ? cells.join("\n\n")
                  : JSON.stringify(asJson, null, 2)
              );
            } catch {
              // If parsing fails, just show the raw text
              setCode(rawText);
            }
          } else {
            setCode(rawText);
          }
        } catch {
          setCode("// Could not load code preview.");
        }
      }

      setLoading(false);
    };

    if (id) fetchStrategy();
  }, [id]);

  // --- Shiki highlighting when code or filename changes ---
  useEffect(() => {
    const doHighlight = async () => {
      if (!code) {
        setHighlightedHtml("");
        return;
      }

      // pick language from filename; default to python
      let lang = "python";
      const fname = strategy?.file_name?.toLowerCase() || "";
      if (fname.endsWith(".ipynb"))
        lang = "python"; // after extracting cells above
      else if (fname.endsWith(".py")) lang = "python";
      else if (fname.endsWith(".json")) lang = "json";
      else if (fname.endsWith(".ts")) lang = "ts";
      else if (fname.endsWith(".tsx")) lang = "tsx";
      else if (fname.endsWith(".js")) lang = "js";
      else if (fname.endsWith(".jsx")) lang = "jsx";
      else if (fname.endsWith(".md")) lang = "md";

      const html = await codeToHtml(code, {
        lang,
        theme: "github-dark", // swap to your preferred theme
      });

      setHighlightedHtml(html);
    };

    doHighlight();
  }, [code, strategy?.file_name]);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading strategy...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : strategy ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              {strategy.name}
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              Strategy ID: <span className="font-mono">{strategy.id}</span>
            </p>
            <p className="text-gray-400 mb-6">{strategy.description}</p>

            {/* --- Shiki preview box --- */}
            {highlightedHtml ? (
              <div className="rounded-xl overflow-hidden border border-gray-700/60 bg-black/40">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/60 text-sm text-gray-300">
                  <span className="font-mono truncate">
                    {strategy.file_name || "code"}
                  </span>
                  <button
                    className="px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200"
                    onClick={() => navigator.clipboard.writeText(code)}
                  >
                    Copy
                  </button>
                </div>
                <div
                  className="p-4 overflow-auto"
                  // Shiki returns full HTML (pre > code) block
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </div>
            ) : code ? (
              // Fallback plain text if Shiki not ready
              <pre className="p-4 rounded-xl bg-black/40 border border-gray-700/60 overflow-auto">
                <code>{code}</code>
              </pre>
            ) : null}
          </>
        ) : (
          <p className="text-center text-gray-400">No strategy found.</p>
        )}
      </main>
    </div>
  );
};

export default StrategiesDetailPage;

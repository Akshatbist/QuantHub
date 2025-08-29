import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { createClient } from "@supabase/supabase-js";
import { codeToHtml } from "shiki";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

interface DatasetRow {
  id: number;
  name: string;
  description: string;
  category: string;
  data_type: string; // <-- matches upload
  time_frame: string; // <-- matches upload
  assets: string | null;
  tags: string[] | string | null; // accept either array or string just in case
  file_path: string | null; // <-- matches upload (NOT file_url)
  file_name: string | null;
  file_size: number | null;
  author_id: string | null;
  author_email: string | null;
  created_at: string;
}

const DatasetsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [dataset, setDataset] = useState<DatasetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [rawText, setRawText] = useState<string>("");
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Normalize tags to an array of strings for display
  const tagsArray: string[] =
    typeof dataset?.tags === "string"
      ? dataset!.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(dataset?.tags)
      ? (dataset!.tags as string[])
      : [];

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) fetch dataset row
        const { data, error } = await supabase
          .from("datasets")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          setErr("Failed to load dataset.");
          setDataset(null);
          return;
        }

        setDataset(data as DatasetRow);

        // 2) fetch file via file_path (private bucket flow)
        if (data.file_path) {
          const { data: file, error: fileError } = await supabase.storage
            .from("datasets")
            .download(data.file_path);

          if (fileError) throw fileError;

          setFileBlob(file);

          // read for preview
          const text = await file.text();

          // Show human-friendly preview for .ipynb (like strategies)
          const fname = (data.file_name || "").toLowerCase();
          if (fname.endsWith(".ipynb")) {
            try {
              const asJson = JSON.parse(text);
              const cells: string[] = (asJson?.cells || [])
                .filter((c: any) => c.cell_type === "code")
                .map((c: any, idx: number) => {
                  const src = Array.isArray(c.source)
                    ? c.source.join("")
                    : String(c.source ?? "");
                  return `# In [${idx}]\n${src}`;
                });
              setRawText(
                cells.length
                  ? cells.join("\n\n")
                  : JSON.stringify(asJson, null, 2)
              );
            } catch {
              setRawText(text);
            }
          } else {
            setRawText(text);
          }
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to download dataset file.");
      } finally {
        setLoading(false);
      }
    };

    if (id) run();
  }, [id]);

  // Syntax highlight with Shiki (CSV/TSV as plaintext)
  useEffect(() => {
    const doHighlight = async () => {
      if (!rawText) {
        setHighlightedHtml("");
        return;
      }
      const fname = (dataset?.file_name || "").toLowerCase();
      let lang: string = "txt";
      if (fname.endsWith(".ipynb")) lang = "python";
      else if (fname.endsWith(".py")) lang = "python";
      else if (fname.endsWith(".json")) lang = "json";
      else if (fname.endsWith(".md")) lang = "md";
      else if (fname.endsWith(".ts")) lang = "ts";
      else if (fname.endsWith(".tsx")) lang = "tsx";
      else if (fname.endsWith(".js")) lang = "js";
      else if (fname.endsWith(".jsx")) lang = "jsx";
      else if (fname.endsWith(".sql")) lang = "sql";
      else if (fname.endsWith(".yaml") || fname.endsWith(".yml")) lang = "yaml";
      else if (fname.endsWith(".csv") || fname.endsWith(".tsv")) lang = "txt";

      const html = await codeToHtml(rawText, {
        lang,
        theme: "github-dark",
      });
      setHighlightedHtml(html);
    };

    doHighlight();
  }, [rawText, dataset?.file_name]);

  const handleCopy = () => {
    if (rawText) navigator.clipboard.writeText(rawText);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      let blob = fileBlob;

      if (!blob) {
        const fname = (dataset?.file_name || "").toLowerCase();
        let mime = "text/plain;charset=utf-8";
        if (fname.endsWith(".json") || fname.endsWith(".ipynb"))
          mime = "application/json;charset=utf-8";
        else if (fname.endsWith(".md")) mime = "text/markdown;charset=utf-8";
        else if (fname.endsWith(".sql")) mime = "application/sql;charset=utf-8";
        blob = new Blob([rawText || ""], { type: mime });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dataset?.file_name || "dataset.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Sorry — couldn't download the file.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dataset...</p>
          </div>
        ) : err ? (
          <div className="text-center text-red-400">{err}</div>
        ) : dataset ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              {dataset.name}
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              ID <span className="font-mono">{dataset.id}</span> · Uploaded{" "}
              {new Date(dataset.created_at).toLocaleString()}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-300">{dataset.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                    <div className="text-gray-400">Category</div>
                    <div className="font-medium">{dataset.category}</div>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                    <div className="text-gray-400">Data Type</div>
                    <div className="font-medium">{dataset.data_type}</div>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                    <div className="text-gray-400">Time Frame</div>
                    <div className="font-medium">{dataset.time_frame}</div>
                  </div>
                  {dataset.assets && (
                    <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                      <div className="text-gray-400">Assets/Coverage</div>
                      <div className="font-medium">{dataset.assets}</div>
                    </div>
                  )}
                  <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                    <div className="text-gray-400">File</div>
                    <div className="font-medium">
                      {dataset.file_name || "—"}{" "}
                      {dataset.file_size != null &&
                        `(${(dataset.file_size / 1024 / 1024).toFixed(2)} MB)`}
                    </div>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/40">
                    <div className="text-gray-400">Uploader</div>
                    <div className="font-medium">
                      {dataset.author_email || "Unknown"}
                    </div>
                  </div>
                </div>

                {tagsArray.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm text-gray-400 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {tagsArray.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 rounded-md bg-gray-700/70 border border-gray-600/60 text-xs"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-3">Actions</h3>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
                    onClick={handleCopy}
                    disabled={!rawText}
                    title={!rawText ? "No content to copy yet" : "Copy preview"}
                  >
                    Copy Preview
                  </button>
                  <button
                    className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm"
                    onClick={handleDownload}
                    disabled={downloading || (!fileBlob && !rawText)}
                    title={
                      !fileBlob && !rawText ? "No file loaded yet" : "Download"
                    }
                  >
                    {downloading ? "Downloading…" : "Download File"}
                  </button>
                </div>
                {!dataset.file_path && (
                  <p className="text-xs text-yellow-400 mt-3">
                    No file_path set for this row.
                  </p>
                )}
              </div>
            </div>

            {/* Preview box */}
            {highlightedHtml ? (
              <div className="rounded-xl overflow-hidden border border-gray-700/60 bg-black/40">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/60 text-sm text-gray-300">
                  <span className="font-mono truncate">
                    {dataset.file_name || "dataset"}
                  </span>
                </div>
                <div
                  className="p-4 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </div>
            ) : rawText ? (
              <pre className="p-4 rounded-xl bg-black/40 border border-gray-700/60 overflow-auto">
                <code>{rawText}</code>
              </pre>
            ) : (
              <p className="text-gray-400">No preview available.</p>
            )}
          </>
        ) : (
          <p className="text-center text-gray-400">No dataset found.</p>
        )}
      </main>
    </div>
  );
};

export default DatasetsDetailPage;

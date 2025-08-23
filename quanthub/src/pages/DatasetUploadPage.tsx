import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface DatasetForm {
  name: string;
  description: string;
  category: string;
  dataType: string;
  timeFrame: string;
  assets: string;
  tags: string;
  file: File | null;
}

const DatasetUploadPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState<DatasetForm>({
    name: "",
    description: "",
    category: "market-data",
    dataType: "price-data",
    timeFrame: "daily",
    assets: "",
    tags: "",
    file: null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "text/csv",
        "application/json",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a CSV, JSON, Excel, or text file.");
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.file || !session) {
      alert("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", form.file);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("dataType", form.dataType);
      formData.append("timeFrame", form.timeFrame);
      formData.append("assets", form.assets);
      formData.append("tags", form.tags);
      formData.append("authorId", session.user.id);
      formData.append("authorEmail", session.user.email || "");

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from("datasets")
        .upload(
          `${session.user.id}/${Date.now()}_${form.file.name}`,
          form.file
        );

      if (fileError) {
        throw new Error("File upload failed: " + fileError.message);
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("datasets").getPublicUrl(fileData.path);

      // Save dataset metadata to database
      const { data: datasetData, error: dbError } = await supabase
        .from("datasets")
        .insert([
          {
            name: form.name,
            description: form.description,
            category: form.category,
            data_type: form.dataType,
            time_frame: form.timeFrame,
            assets: form.assets,
            tags: form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
            file_url: publicUrl,
            file_name: form.file.name,
            file_size: form.file.size,
            author_id: session.user.id,
            author_email: session.user.email,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (dbError) {
        throw new Error("Database save failed: " + dbError.message);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Success - redirect to datasets page
      setTimeout(() => {
        navigate("/datasets");
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-300 mb-6">
              You need to be signed in to upload datasets.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Sign In
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Upload Dataset
            </h1>
            <p className="text-gray-300">
              Share your quantitative datasets with the community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Dataset Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., S&P 500 Historical Data"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="market-data">Market Data</option>
                    <option value="economic-data">Economic Data</option>
                    <option value="alternative-data">Alternative Data</option>
                    <option value="sentiment-data">Sentiment Data</option>
                    <option value="technical-indicators">
                      Technical Indicators
                    </option>
                    <option value="fundamental-data">Fundamental Data</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  placeholder="Describe your dataset, its sources, and potential use cases..."
                />
              </div>
            </div>

            {/* Data Specifications */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">
                Data Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Data Type *
                  </label>
                  <select
                    name="dataType"
                    value={form.dataType}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="price-data">Price Data</option>
                    <option value="volume-data">Volume Data</option>
                    <option value="fundamental-data">Fundamental Data</option>
                    <option value="sentiment-data">Sentiment Data</option>
                    <option value="economic-indicators">
                      Economic Indicators
                    </option>
                    <option value="alternative-metrics">
                      Alternative Metrics
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Time Frame *
                  </label>
                  <select
                    name="timeFrame"
                    value={form.timeFrame}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  >
                    <option value="tick">Tick Data</option>
                    <option value="minute">Minute</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Assets/Coverage
                  </label>
                  <input
                    type="text"
                    name="assets"
                    value={form.assets}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    placeholder="e.g., S&P 500, Crypto, Forex"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="Enter tags separated by commas (e.g., stocks, historical, clean)"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">
                Dataset File *
              </h3>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.json,.xlsx,.xls,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-semibold mb-2">
                    {form.file
                      ? form.file.name
                      : "Choose a file or drag it here"}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    CSV, JSON, Excel, or text files up to 50MB
                  </div>
                  <div className="text-xs text-gray-500">
                    Supported formats: .csv, .json, .xlsx, .xls, .txt
                  </div>
                </label>
              </div>
              {form.file && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {form.file.name} (
                      {(form.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, file: null }))
                      }
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">
                  Uploading Dataset...
                </h3>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">
                  {uploadProgress}% complete
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/datasets")}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !form.file}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex-1"
              >
                {isUploading ? "Uploading..." : "Upload Dataset"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DatasetUploadPage;

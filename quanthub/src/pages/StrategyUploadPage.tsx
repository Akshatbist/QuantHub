import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface StrategyFormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  risk_level: string;
  expected_return: string;
  max_drawdown: string;
  strategy_type: string;
  time_horizon: string;
  minimum_capital: string;
}

const StrategyUploadPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [activeStep, setActiveStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<StrategyFormData>({
    name: "",
    description: "",
    category: "",
    tags: "",
    risk_level: "",
    expected_return: "",
    max_drawdown: "",
    strategy_type: "",
    time_horizon: "",
    minimum_capital: "",
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError("");
        setActiveStep(2);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "text/plain",
      "text/x-python",
      "application/x-python-code",
      "text/x-script.python",
      "application/octet-stream",
      "application/x-ipynb+json",
      "application/json", // For .ipynb files
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".py") &&
      !file.name.endsWith(".ipynb")
    ) {
      setError(
        "Please upload a Python file (.py) or Jupyter Notebook (.ipynb)"
      );
      return false;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError("");
        setActiveStep(2);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Note: Removed real-time name validation since we allow duplicate names
  };

  // Note: Removed validateStrategyName function since we allow duplicate names

  const validateForm = (): {
    isValid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};

    // File validation
    if (!selectedFile) {
      errors.file = "Please select a strategy file";
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Strategy name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Strategy name must be at least 3 characters long";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Strategy name must be less than 100 characters";
    } else if (!/^[a-zA-Z0-9_\-\s]+$/.test(formData.name.trim())) {
      errors.name =
        "Strategy name can only contain letters, numbers, hyphens, underscores, and spaces";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Strategy description is required";
    }

    // Category validation
    if (!formData.category) {
      errors.category = "Please select a category";
    }

    // Tags validation
    if (formData.tags.trim()) {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      if (tags.length > 10) {
        errors.tags = "Maximum 10 tags allowed";
      }
      for (const tag of tags) {
        if (tag.length > 20) {
          errors.tags = "Each tag must be less than 20 characters";
          break;
        }
        if (!/^[a-zA-Z0-9_\-\s]+$/.test(tag)) {
          errors.tags =
            "Tags can only contain letters, numbers, hyphens, and underscores";
          break;
        }
      }
    }

    // Numeric validations
    if (
      formData.expected_return &&
      (isNaN(Number(formData.expected_return)) ||
        Number(formData.expected_return) < -100 ||
        Number(formData.expected_return) > 1000)
    ) {
      errors.expected_return =
        "Expected return must be between -100% and 1000%";
    }

    if (
      formData.max_drawdown &&
      (isNaN(Number(formData.max_drawdown)) ||
        Number(formData.max_drawdown) < 0 ||
        Number(formData.max_drawdown) > 100)
    ) {
      errors.max_drawdown = "Max drawdown must be between 0% and 100%";
    }

    if (
      formData.minimum_capital &&
      (isNaN(Number(formData.minimum_capital)) ||
        Number(formData.minimum_capital) < 0 ||
        Number(formData.minimum_capital) > 1000000000)
    ) {
      errors.minimum_capital =
        "Minimum capital must be between $0 and $1 billion";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${session?.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("strategies")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    return filePath;
  };

  // Note: Removed checkStrategyNameExists function since we allow duplicate names

  const saveStrategyToDatabase = async (filePath: string) => {
    // Note: We're allowing multiple strategies with the same name
    // Users can have multiple versions or variations of the same strategy

    const strategyData = {
      user_id: session?.user.id,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      risk_level: formData.risk_level,
      expected_return: parseFloat(formData.expected_return) || null,
      max_drawdown: parseFloat(formData.max_drawdown) || null,
      strategy_type: formData.strategy_type,
      time_horizon: formData.time_horizon,
      minimum_capital: parseFloat(formData.minimum_capital) || null,
      file_path: filePath,
      file_name: selectedFile?.name,
      file_size: selectedFile?.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: true,
      downloads: 0,
      stars: 0,
      forks: 0,
      status: "active",
    };

    try {
      const { error: dbError } = await supabase
        .from("strategies")
        .insert([strategyData]);

      if (dbError) {
        if (dbError.message.includes("foreign key")) {
          throw new Error("Invalid user session. Please log in again and try.");
        } else if (dbError.message.includes("not null")) {
          throw new Error(
            "Required fields are missing. Please check your form and try again."
          );
        } else {
          throw new Error(`Database error: ${dbError.message}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred while saving the strategy");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setError("Please log in to upload a strategy");
      return;
    }

    const validation = validateForm();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      // Show the first error as a general error message
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      return;
    }

    // Clear any previous errors
    setFieldErrors({});
    setError("");

    setIsUploading(true);
    setUploadProgress(0);
    setError("");
    setSuccess("");

    try {
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

      // Upload file
      const filePath = await uploadFile(selectedFile!);

      // Save to database
      await saveStrategyToDatabase(filePath);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess("Strategy uploaded successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        tags: "",
        risk_level: "",
        expected_return: "",
        max_drawdown: "",
        strategy_type: "",
        time_horizon: "",
        minimum_capital: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/strategies");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Please log in to upload and share your strategies with the community
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Upload Strategy
              </h1>
              <p className="text-gray-400 mt-1">
                Share your quantitative trading strategy with the community
              </p>
            </div>
            <button
              onClick={() => navigate("/strategies")}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`flex items-center ${
                activeStep >= 1 ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  activeStep >= 1
                    ? "border-blue-400 bg-blue-400/20"
                    : "border-gray-600"
                }`}
              >
                {activeStep > 1 ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="font-semibold">1</span>
                )}
              </div>
              <span className="ml-3 font-medium">Upload File</span>
            </div>

            <div
              className={`w-16 h-0.5 transition-all duration-300 ${
                activeStep >= 2 ? "bg-blue-400" : "bg-gray-600"
              }`}
            ></div>

            <div
              className={`flex items-center ${
                activeStep >= 2 ? "text-blue-400" : "text-gray-500"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  activeStep >= 2
                    ? "border-blue-400 bg-blue-400/20"
                    : "border-gray-600"
                }`}
              >
                <span className="font-semibold">2</span>
              </div>
              <span className="ml-3 font-medium">Strategy Details</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-300">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Strategy File</h2>
                <p className="text-gray-400">
                  Upload your Python strategy file or Jupyter notebook
                </p>
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-blue-400 bg-blue-900/20 scale-105"
                  : selectedFile
                  ? "border-green-400 bg-green-900/20"
                  : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="animate-in slide-in-from-bottom-2 duration-500">
                  <div className="text-green-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-400 mb-4">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setActiveStep(1);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold mb-3">
                    Drop your Python strategy file or notebook here
                  </p>
                  <p className="text-gray-400 mb-6">
                    or click to browse from your computer
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Choose File
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".py,.ipynb"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
              <div className="flex items-center text-sm text-gray-400">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Supported formats: Python (.py) and Jupyter Notebook (.ipynb)
                files up to 10MB
              </div>
            </div>
          </div>

          {/* Strategy Details Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Strategy Details</h2>
                <p className="text-gray-400">
                  Provide information about your strategy
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Strategy Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      fieldErrors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-600/50 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    placeholder="Enter strategy name"
                  />
                  {fieldErrors.name && (
                    <p className="mt-2 text-sm text-red-400">
                      {fieldErrors.name}
                    </p>
                  )}
                  {!fieldErrors.name && formData.name.trim().length >= 3 && (
                    <p className="mt-2 text-sm text-green-400">
                      ✓ Strategy name is valid
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      fieldErrors.category
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-600/50 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="">Select category</option>
                    <option value="momentum">Momentum</option>
                    <option value="mean_reversion">Mean Reversion</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="statistical_arbitrage">
                      Statistical Arbitrage
                    </option>
                    <option value="trend_following">Trend Following</option>
                    <option value="contrarian">Contrarian</option>
                    <option value="pairs_trading">Pairs Trading</option>
                    <option value="options">Options</option>
                    <option value="futures">Futures</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.category && (
                    <p className="mt-2 text-sm text-red-400">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="python, ml, momentum, stocks (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Strategy Type
                  </label>
                  <select
                    name="strategy_type"
                    value={formData.strategy_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="">Select type</option>
                    <option value="discretionary">Discretionary</option>
                    <option value="systematic">Systematic</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Risk Level
                  </label>
                  <select
                    name="risk_level"
                    value={formData.risk_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="">Select risk level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Time Horizon
                  </label>
                  <select
                    name="time_horizon"
                    value={formData.time_horizon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="">Select horizon</option>
                    <option value="intraday">Intraday</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="long_term">Long Term</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    name="expected_return"
                    value={formData.expected_return}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="15.5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Max Drawdown (%)
                  </label>
                  <input
                    type="number"
                    name="max_drawdown"
                    value={formData.max_drawdown}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="10.0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">
                    Minimum Capital ($)
                  </label>
                  <input
                    type="number"
                    name="minimum_capital"
                    value={formData.minimum_capital}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    placeholder="10000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                    fieldErrors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-600/50 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Describe your strategy, its logic, key features, and how it works..."
                />
                {fieldErrors.description && (
                  <p className="mt-2 text-sm text-red-400">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 animate-pulse">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Uploading Strategy...</h3>
                  <p className="text-gray-400">
                    Please wait while we process your strategy
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 text-center">
                {uploadProgress}% complete
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                "Upload Strategy"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/strategies")}
              className="px-8 py-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl font-semibold transition-all duration-300 border border-gray-600/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StrategyUploadPage;

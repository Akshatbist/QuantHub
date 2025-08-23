import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

interface UserProfile {
  email: string;
  displayName: string;
  strategies: Strategy[];
  datasets: Dataset[];
  totalContributions: number;
  lastActive: string;
  joinedDate: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "strategies" | "datasets" | "activity"
  >("strategies");

  useEffect(() => {
    if (!id) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userEmail = decodeURIComponent(id);

        // Fetch strategies and datasets for this user
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

        if (stratRes.error || dataRes.error) {
          throw stratRes.error || dataRes.error;
        }

        const strategies = stratRes.data || [];
        const datasets = dataRes.data || [];
        const totalContributions = strategies.length + datasets.length;

        // Get activity dates
        const allDates = [
          ...strategies.map((s) => s.created_at),
          ...datasets.map((d) => d.created_at),
        ].sort();

        const lastActive =
          allDates.length > 0 ? allDates[allDates.length - 1] : "";
        const joinedDate = allDates.length > 0 ? allDates[0] : "";

        // Generate display name
        const displayName = userEmail
          .split("@")[0]
          .replace(/[0-9]/g, "")
          .replace(/[._-]/g, " ");

        const userProfile: UserProfile = {
          email: userEmail,
          displayName:
            displayName.charAt(0).toUpperCase() + displayName.slice(1),
          strategies,
          datasets,
          totalContributions,
          lastActive,
          joinedDate,
          followers: Math.floor(Math.random() * 100) + 10, // Mock data for now
          following: Math.floor(Math.random() * 50) + 5, // Mock data for now
          isFollowing: false, // Mock data for now
        };

        setProfile(userProfile);
      } catch (err: any) {
        setError("Failed to load user profile.");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handleFollow = () => {
    if (!session) {
      navigate("/auth");
      return;
    }
    // TODO: Implement follow functionality
    if (profile) {
      setProfile({
        ...profile,
        isFollowing: !profile.isFollowing,
        followers: profile.isFollowing
          ? profile.followers - 1
          : profile.followers + 1,
      });
    }
  };

  if (loading) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-400">
              Profile Not Found
            </h1>
            <p className="text-gray-300 mb-6">
              {error || "This user profile could not be loaded."}
            </p>
            <Link
              to="/community"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Back to Community
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.displayName
  )}&background=4f46e5&color=fff&size=256`;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="flex-1 px-4 py-12 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={avatarUrl}
              alt={profile.displayName}
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{profile.displayName}</h1>
              <p className="text-gray-400 mb-4">{profile.email}</p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {profile.strategies.length}
                  </div>
                  <div className="text-sm text-gray-400">Strategies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {profile.datasets.length}
                  </div>
                  <div className="text-sm text-gray-400">Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {profile.totalContributions}
                  </div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {profile.followers}
                  </div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {profile.following}
                  </div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Joined:</span>{" "}
                  {profile.joinedDate
                    ? getTimeAgo(profile.joinedDate)
                    : "Unknown"}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="font-semibold">Last active:</span>{" "}
                  {profile.lastActive
                    ? getTimeAgo(profile.lastActive)
                    : "Unknown"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {session && session.user.email !== profile.email && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    profile.isFollowing
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </button>
              )}
              {session && session.user.email === profile.email && (
                <Link
                  to="/profile"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-center"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "strategies"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Strategies ({profile.strategies.length})
          </button>
          <button
            onClick={() => setActiveTab("datasets")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "datasets"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Datasets ({profile.datasets.length})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "activity"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === "strategies" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Strategies</h2>
            {profile.strategies.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No strategies uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.strategies.map((strategy, i) => (
                  <div
                    key={strategy.id}
                    className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">
                        {strategy.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {getTimeAgo(strategy.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                      {strategy.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {strategy.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-700/30 text-blue-300 px-2 py-1 rounded text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {strategy.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">
                          +{strategy.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-4 text-xs">
                      <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded font-medium">
                        {strategy.category}
                      </span>
                      <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded font-medium">
                        {strategy.risk_level}
                      </span>
                    </div>
                    <Link
                      to={`/strategies/${strategy.id}`}
                      className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition shadow text-center font-semibold"
                    >
                      View Strategy
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "datasets" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Datasets</h2>
            {profile.datasets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No datasets uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.datasets.map((dataset, i) => (
                  <div
                    key={dataset.id}
                    className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">
                        {dataset.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {getTimeAgo(dataset.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                      {dataset.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dataset.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-green-700/30 text-green-300 px-2 py-1 rounded text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {dataset.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">
                          +{dataset.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-4 text-xs">
                      <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded font-medium">
                        {dataset.category}
                      </span>
                      <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded font-medium">
                        {dataset.data_type}
                      </span>
                    </div>
                    <Link
                      to={`/datasets/${dataset.id}`}
                      className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition shadow text-center font-semibold"
                    >
                      View Dataset
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[...profile.strategies, ...profile.datasets]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 10)
                .map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          "risk_level" in item ? "bg-blue-500" : "bg-green-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {"risk_level" in item
                              ? "Created strategy"
                              : "Uploaded dataset"}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">
                            {getTimeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityDetailPage;

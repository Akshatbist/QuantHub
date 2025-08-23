import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

function AuthenticationPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) setError(error.message);
        setSession(session);
        setLoading(false);
        if (session) {
          navigate("/");
        }
      })
      .catch(() => {
        setError("Failed to fetch session.");
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-lg flex flex-col items-center animate-fade-in border border-gray-700/50">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
            Welcome to Quant Hub
          </h2>
          <p className="text-gray-400 text-sm">
            Your AI-powered trading strategy platform
          </p>
        </div>
        {loading ? (
          <div className="text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-red-400 mb-4">{error}</div>
        ) : (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: {
                default: {
                  colors: {
                    brand: "#6366f1",
                    brandAccent: "#a21caf",
                    inputBorder: "#374151",
                    inputBackground: "#1f2937",
                    inputText: "#fff",
                    anchorTextColor: "#818cf8",
                    inputLabelText: "#cbd5e1",
                    inputPlaceholder: "#9ca3af",
                    messageText: "#f3f4f6",
                    messageTextDanger: "#fca5a5",
                    dividerBackground: "#374151",
                  },
                },
              },
              style: {
                button: {
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #a21caf 100%)",
                  color: "#fff",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                  marginTop: "1.5rem",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.3)",
                  transition: "all 0.2s ease-in-out",
                  fontSize: "1rem",
                },
                input: {
                  background: "#1f2937",
                  color: "#fff",
                  borderRadius: "0.75rem",
                  border: "2px solid #374151",
                  marginBottom: "1rem",
                  padding: "0.875rem 1rem",
                  fontSize: "1rem",
                  transition: "all 0.2s ease-in-out",
                },
                label: {
                  color: "#cbd5e1",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                },
                anchor: {
                  color: "#818cf8",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s ease-in-out",
                },
                message: {
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                },
              },
            }}
            providers={[]}
            showLinks={true}
            onlyThirdPartyProviders={false}
            redirectTo={window.location.origin}
            view="sign_in"
          />
        )}
      </div>
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
    </div>
  );
}

export default AuthenticationPage;

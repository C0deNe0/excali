import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Pencil, Sparkles, Share2, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { login } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault(); //prevents default form submission behavior and reload
    if (username && email) {
      login(username, email);
      onEnterApp();
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center relative overflow-hidden text-white font-['Patrick_Hand']">
      {/* Background Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute top-20 left-20 w-32 h-32 border-4 border-indigo-500  rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute bottom-40 right-20 w-40 h-40 border-4 border-pink-500 transform rotate-12 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-10 w-24 h-24 border-4 border-yellow-400 transform -rotate-45 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-1/4 w-16 h-16 bg-blue-500 rounded-lg animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="z-10 max-w-4xl w-full px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Left Side: Hero Text */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block bg-indigo-600 px-3 py-1 rounded-full text-sm mb-4 transform -rotate-2 border-2 border-white/20">
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-300" />
              Now with Freehand & Sharing!
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
            Draw Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 scribble-underline">
              Imagination
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-lg">
            A simple, fun, and totally free whiteboard tool. Sketch, plan, or
            just doodle. Login to save and share your masterpieces with the
            world!
          </p>

          <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Pencil size={20} />
              <span>Pressure sensitivity</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Share2 size={20} />
              <span>Easy Sharing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="flex-1 w-full max-w-md relative group">
          {/* Decorative offset box behind */}
          <div className="absolute inset-0 bg-pink-500 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6"></div>

          <div className="relative bg-[#1E1E2F] border-2 border-white/10 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              {isRegistering ? "Join the Club!" : "Welcome Back!"}
              <span className="text-2xl">👋</span>
            </h2>
            <p className="text-gray-400 mb-6 text-lg">
              {isRegistering
                ? "Create an account to save & share files."
                : "Enter your details to continue."}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-lg mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#121212] border-2 border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors text-xl font-['Patrick_Hand']"
                  placeholder="ArtisticPanda"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-lg mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border-2 border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors text-xl font-['Patrick_Hand']"
                  placeholder="panda@bamboo.com"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-[2px] transition-all text-xl flex justify-center items-center gap-2"
              >
                {isRegistering ? "Register & Start" : "Login & Draw"}
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-indigo-400 hover:text-indigo-300 underline decoration-wavy"
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Need an account? Register"}
              </button>

              <div className="border-t border-white/10 my-1"></div>

              <button
                onClick={onEnterApp}
                className="text-gray-500 hover:text-white transition-colors"
              >
                Just let me draw as a guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

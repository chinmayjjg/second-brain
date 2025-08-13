import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Brain } from "lucide-react";
import { cn } from "../utils/cn";
import { getErrorMessage } from "../utils/getErrorMessage";
import Loader from "./Loader";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-2xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your Second Brain</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="px-4 py-3 text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="password"
            />
          </div>

          <button
            type="submit"
            disabled={true}
            className="flex justify-center items-center px-4 py-2 w-full h-10 text-white bg-purple-600 rounded-md transition-colors felx hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader className="h-4" size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

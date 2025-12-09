import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ArrowRight, Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />

        {/* Animated Shapes */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Brain className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Second Brain</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Capture your thoughts, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">organize your life.</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your personal knowledge base for everything you learn, create, and want to remember.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>© 2024 Second Brain Inc.</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>Privacy Policy</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden mb-8">
            <div className="flex items-center space-x-2 text-purple-600 mb-6">
              <Brain className="h-8 w-8" />
              <span className="text-2xl font-bold text-gray-900">Second Brain</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              New here?{' '}
              <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      await googleLogin(credentialResponse.credential);
                      navigate('/dashboard');
                    } catch (err: any) {
                      setError(err.message || 'Google login failed');
                    }
                  }
                }}
                onError={() => {
                  setError('Google Login Failed');
                }}
                useOneTap
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
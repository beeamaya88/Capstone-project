import React, { useState } from "react";
import userStore from "../slices/userSlice";

export default function Signin({ onSignupClick, onClose }) {
  const { login, loading, error, clearError } = userStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ text: "", type: "" });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setMessage({ 
        text: "Login successful! Redirecting...", 
        type: "success" 
      });
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage({ 
        text: result.error || "Login failed", 
        type: "error" 
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-center text-2xl font-bold text-white mb-6">
        Sign in to your account
      </h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === "success" 
            ? "bg-green-500/20 text-green-300" 
            : "bg-red-500/20 text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      {error && !message.text && (
        <div className="mb-4 p-3 rounded-md text-sm bg-red-500/20 text-red-300">
          {error}
        </div>
      )}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-100">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="mt-2 block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-indigo-500"
            disabled={loading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-100">
              Password
            </label>
            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="mt-2">
            <input
              id="password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="block w-full rounded-md bg-white/5 px-3 py-2 text-base text-white outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 sm:text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white 
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-400'} 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Not a member?{" "}
        <button
          onClick={onSignupClick}
          className="font-semibold text-indigo-400 hover:text-indigo-300 focus:outline-2 focus:outline-indigo-500 cursor-pointer"
          disabled={loading}
        >
          Sign up here
        </button>
      </p>
    </div>
  );
}
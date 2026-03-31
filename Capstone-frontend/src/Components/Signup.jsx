import { useState } from "react";
import userStore from "../slices/userSlice";

export default function Signup({ onSigninClick, onClose }) {
  const { signup, loading, error, clearError } = userStore();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ text: "", type: "" });
    clearError();
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ 
        text: "Passwords do not match!", 
        type: "error" 
      });
      return;
    }

    const result = await signup({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setMessage({ 
        text: "Account created successfully! Logging you in...", 
        type: "success" 
      });
      
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setMessage({ 
        text: result.error || "Signup failed. Please try again.", 
        type: "error" 
      });
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md focus:outline-2 focus:outline-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-gray-400 text-sm">
        Already have an account?{" "}
        <button
          onClick={onSigninClick}
          disabled={loading}
          className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer disabled:opacity-50"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
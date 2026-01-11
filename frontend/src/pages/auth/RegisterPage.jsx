import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Field Validation
  const validateField = (name, value) => {
    const nameRegex = /^[a-zA-Z\s]*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'full_name':
        if (!value) return "Full Name is required";
        if (!nameRegex.test(value)) return "Name cannot contain numbers or symbols";
        if (value.length < 2) return "Name must be at least 2 characters";
        break;
      case 'email':
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email address";
        break;
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        break;
      case 'confirmPassword':
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        break;
      case 'phone':
        if (!value) return "Phone number is required";
        if (!/^\d{10,15}$/.test(value)) return "Phone must be 10-15 digits";
        break;
      default:
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow digits for phone
    if (name === 'phone' && !/^\d*$/.test(value)) return;

    setFormData(prev => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    ['full_name', 'email', 'password', 'confirmPassword', 'phone'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Helper to extract error message from API response
  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;
    if (!detail) return 'Registration failed';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
    }
    if (typeof detail === 'object' && detail.msg) return detail.msg;
    return 'Registration failed';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      });

      if (result.requiresEmailConfirmation) {
        setSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white placeholder-gray-400";
    return `${baseClass} ${validationErrors[fieldName]
        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
        : 'border-gray-200 dark:border-gray-700'
      }`;
  };

  // Success state - email confirmation required
  if (success) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-primary-50 to-accent-50'
        } flex items-center justify-center p-4`}>
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-white/50'
          }`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-100 dark:bg-accent-900/30 mb-6 animate-fade-in">
              <CheckCircleIcon className="w-10 h-10 text-accent-600 dark:text-accent-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've sent a confirmation link to<br />
              <span className="font-semibold text-primary-600 dark:text-primary-400">{formData.email}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Please click the link in the email to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full gap-2 py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all"
            >
              Go to Login
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-primary-50 to-accent-50'
      } flex items-center justify-center p-4`}>
      {/* Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:scale-105 transition-transform"
      >
        {isDarkMode ? (
          <SunIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <MoonIcon className="w-6 h-6 text-slate-700" />
        )}
      </button>

      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-white/50'
        }`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
            RISKOFF
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={getInputClass('full_name')}
                placeholder="John Doe"
                required
              />
            </div>
            {validationErrors.full_name && (
              <p className="text-red-500 text-xs ml-1">{validationErrors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={getInputClass('email')}
                placeholder="you@example.com"
                required
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-xs ml-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={getInputClass('phone')}
                placeholder="1234567890"
                maxLength="15"
                required
              />
            </div>
            {validationErrors.phone && (
              <p className="text-red-500 text-xs ml-1">{validationErrors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={getInputClass('password')}
                placeholder="••••••••"
                required
              />
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-xs ml-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={getInputClass('confirmPassword')}
                placeholder="••••••••"
                required
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs ml-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
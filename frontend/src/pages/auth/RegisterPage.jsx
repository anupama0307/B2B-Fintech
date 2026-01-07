import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    date_of_birth:  '',
    gender:  'male',
    address: '',
    city: '',
    state: '',
    pincode: '',
    occupation: '',
    employer_name: '',
    employment_years: 0,
    annual_income: 0,
    monthly_expenses: 0,
    account_balance: 0,
    mutual_funds: 0,
    stocks: 0,
    fixed_deposits: 0,
    existing_loans: 0,
    existing_loan_amount: 0
  });

  const { register, verifyRegisterOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?. detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e. preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await verifyRegisterOTP(formData. email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?. detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ RISKON + VisualPe</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-blue-600 text-white' :  'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData. email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData. password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 mt-4"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Employment Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Employment Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                <input
                  type="text"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years at Job</label>
                <input
                  type="number"
                  name="employment_years"
                  value={formData.employment_years}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  name="annual_income"
                  value={formData.annual_income}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (₹)</label>
                <input
                  type="number"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={prevStep} className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50">
                ← Back
              </button>
              <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Info */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Balance (₹)</label>
                <input
                  type="number"
                  name="account_balance"
                  value={formData.account_balance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutual Funds (₹)</label>
                <input
                  type="number"
                  name="mutual_funds"
                  value={formData. mutual_funds}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stocks (₹)</label>
                <input
                  type="number"
                  name="stocks"
                  value={formData.stocks}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Deposits (₹)</label>
                <input
                  type="number"
                  name="fixed_deposits"
                  value={formData.fixed_deposits}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Loans Count</label>
                <input
                  type="number"
                  name="existing_loans"
                  value={formData.existing_loans}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing Loan Amount (₹)</label>
                <input
                  type="number"
                  name="existing_loan_amount"
                  value={formData.existing_loan_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button type="button" onClick={prevStep} className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50">
                ← Back
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: OTP Verification */}
        {step === 4 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Verify Your Email</h2>
            <p className="text-gray-600 text-center mb-4">
              Enter the OTP sent to {formData.email}
            </p>
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus: ring-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Check your console/terminal for OTP (demo mode)
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying.. .' : 'Verify & Continue'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
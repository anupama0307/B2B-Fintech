import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/user/profile', formData);
      setProfile(formData);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <LoadingSpinner text="Loading profile..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">👤 My Profile</h1>
            {! editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile);
                  }}
                  className="px-4 py-2 border rounded-lg hover: bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover: bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Score Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Score</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    stroke={profile?. customer_score >= 650 ? '#10B981' : profile?.customer_score >= 550 ? '#F59E0B' :  '#EF4444'}
                    strokeWidth="12"
                    strokeDasharray={`${(profile?.customer_score / 900) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{profile?. customer_score || 0}</span>
                </div>
              </div>
              <p className="text-gray-500">out of 900</p>
              {profile?.expense_mismatch && (
                <p className="text-red-500 text-sm mt-2">⚠️ Expense mismatch detected</p>
              )}
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg: col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.full_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData. city || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?. city || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Employment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Occupation</label>
                  {editing ? (
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.occupation || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Employer</label>
                  {editing ?  (
                    <input
                      type="text"
                      name="employer_name"
                      value={formData. employer_name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.employer_name || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Years at Job</label>
                  {editing ? (
                    <input
                      type="number"
                      name="employment_years"
                      value={formData.employment_years || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.employment_years || 0} years</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Annual Income (₹)</label>
                  {editing ?  (
                    <input
                      type="number"
                      name="annual_income"
                      value={formData. annual_income || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-green-600">
                      ₹{profile?.annual_income?. toLocaleString('en-IN') || 0}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Monthly Expenses (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="monthly_expenses"
                      value={formData.monthly_expenses || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-red-600">
                      ₹{profile?.monthly_expenses?.toLocaleString('en-IN') || 0}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Balance (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="account_balance"
                      value={formData.account_balance || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-blue-600">
                      ₹{profile?.account_balance?.toLocaleString('en-IN') || 0}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Mutual Funds (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="mutual_funds"
                      value={formData.mutual_funds || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">₹{profile?.mutual_funds?.toLocaleString('en-IN') || 0}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Stocks (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="stocks"
                      value={formData. stocks || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">₹{profile?.stocks?. toLocaleString('en-IN') || 0}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Fixed Deposits (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="fixed_deposits"
                      value={formData.fixed_deposits || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">₹{profile?.fixed_deposits?.toLocaleString('en-IN') || 0}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Existing Loans</label>
                  {editing ? (
                    <input
                      type="number"
                      name="existing_loans"
                      value={formData.existing_loans || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus: ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium">{profile?.existing_loans || 0}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Existing Loan Amount (₹)</label>
                  {editing ? (
                    <input
                      type="number"
                      name="existing_loan_amount"
                      value={formData. existing_loan_amount || 0}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus: ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-orange-600">
                      ₹{profile?.existing_loan_amount?.toLocaleString('en-IN') || 0}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
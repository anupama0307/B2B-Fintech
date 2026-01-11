import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      // FIXED: Use correct backend endpoint
      const res = await api.get('/grievances/admin/all');
      setGrievances(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setResponse(grievance.admin_response || '');
    setNewStatus(grievance.status === 'resolved' ? 'resolved' : 'in_progress');
  };

  const handleSubmitResponse = async () => {
    if (!selectedGrievance || !response) return;

    setSubmitting(true);
    setError('');

    try {
      // FIXED: Use correct backend endpoint and method (PATCH instead of PUT)
      await api.patch(`/grievances/admin/${selectedGrievance.id}`, {
        status: newStatus,
        admin_response: response
      });

      // Refresh the list
      await fetchGrievances();
      setSelectedGrievance(null);
      setResponse('');
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    };
    return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">💬 Grievances Management</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner text="Loading grievances..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grievances List */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
                  All Grievances ({grievances.length})
                </h2>
                {grievances.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No grievances found</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {grievances.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleSelectGrievance(g)}
                        className={`p-4 border dark:border-slate-600 rounded-lg cursor-pointer transition ${selectedGrievance?.id === g.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white truncate">{g.subject}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {g.grievance_type} • {new Date(g.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${getStatusBadge(g.status)}`}>
                            {g.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grievance Detail */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                {selectedGrievance ? (
                  <div>
                    <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Grievance Details</h2>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                        <p className="font-medium dark:text-white">{selectedGrievance.subject}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                        <p className="dark:text-white">{selectedGrievance.grievance_type}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedGrievance.description}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                        <p className="dark:text-white">{new Date(selectedGrievance.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t dark:border-slate-600 pt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Admin Response</label>
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white"
                          placeholder="Enter your response to this grievance..."
                        />
                      </div>

                      <button
                        onClick={handleSubmitResponse}
                        disabled={submitting || !response}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {submitting ? 'Submitting...' : 'Submit Response'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-4xl mb-4">👈</p>
                    <p>Select a grievance to view details and respond</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
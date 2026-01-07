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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const res = await api.get('/admin/grievances');
      setGrievances(res.data);
    } catch (error) {
      console. error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGrievance = async (id) => {
    try {
      const res = await api. get(`/admin/grievances/${id}`);
      setSelectedGrievance(res.data);
      setResponse(res. data.grievance. ai_suggested_response || '');
    } catch (error) {
      console.error('Error fetching grievance:', error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedGrievance || !response) return;
    
    setSubmitting(true);
    try {
      await api.put(`/admin/grievances/${selectedGrievance.grievance. id}/reply`, {
        status: 'resolved',
        admin_response: response
      });
      fetchGrievances();
      setSelectedGrievance(null);
      setResponse('');
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">💬 Grievances</h1>

          {loading ? (
            <LoadingSpinner text="Loading grievances..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grievances List */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-4">All Grievances</h2>
                {grievances.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No grievances found</p>
                ) : (
                  <div className="space-y-3">
                    {grievances.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleViewGrievance(g.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          selectedGrievance?.grievance?. id === g.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{g.subject}</p>
                            <p className="text-sm text-gray-500">{g.user_name}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(g. status)}`}>
                            {g. status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grievance Detail */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                {selectedGrievance ?  (
                  <div>
                    <h2 className="font-semibold text-gray-800 mb-4">Grievance Details</h2>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedGrievance.user?. full_name}</p>
                      <p className="text-sm text-gray-500">{selectedGrievance.user?. email}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{selectedGrievance.grievance?.subject}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{selectedGrievance. grievance?.description}</p>
                    </div>

                    {selectedGrievance.grievance?.ai_suggested_response && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 mb-1">🤖 AI Suggested Response: </p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                          {selectedGrievance. grievance.ai_suggested_response}
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Response</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your response..."
                      />
                    </div>

                    <button
                      onClick={handleSubmitResponse}
                      disabled={submitting || !response}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Response & Resolve'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Select a grievance to view details
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
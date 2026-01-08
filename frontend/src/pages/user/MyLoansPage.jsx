import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import api from "../../services/api";

export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get("/loans/my-loans");
      // Backend returns { loans: [...], total: N } - extract the array
      setLoans(response.data.loans || response.data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoans([]); // Ensure loans is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExplanation = async (loanId) => {
    try {
      const response = await api.post(
        `/grievances/request-explanation/${loanId}`
      );
      alert(
        response.data.immediate_response || "Explanation request submitted"
      );
      fetchLoans();
    } catch (error) {
      console.error("Error requesting explanation:", error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const icons = { pending: "⏳", approved: "✅", rejected: "❌" };
    return icons[status] || "📋";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              📋 My Loan Applications
            </h1>
            <Link
              to="/apply-loan"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover: bg-blue-700"
            >
              + New Application
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading loans..." />
          ) : loans.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Loan Applications
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't applied for any loans yet.
              </p>
              <Link
                to="/apply-loan"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Apply for Loan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">
                        {getStatusIcon(loan.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 capitalize">
                          {loan.purpose || "Personal"} Loan
                        </h3>
                        <p className="text-sm text-gray-500">ID: #{loan.id}</p>
                        <p className="text-sm text-gray-500">
                          Applied:{" "}
                          {loan.created_at
                            ? new Date(loan.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        loan.status
                      )}`}
                    >
                      {loan.status.toUpperCase()}
                      {loan.auto_decision && " (Auto)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-semibold">
                        ₹{(loan.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="font-semibold">
                        {loan.tenure_months || 0} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EMI</p>
                      <p className="font-semibold text-blue-600">
                        ₹{(loan.emi || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p
                        className={`font-semibold ${
                          (loan.risk_score || 0) <= 30
                            ? "text-green-600"
                            : (loan.risk_score || 0) <= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {loan.risk_score || 0}%
                      </p>
                    </div>
                  </div>

                  {loan.status === "APPROVED" && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ Approved Amount:{" "}
                        <strong>
                          ₹{(loan.amount || 0).toLocaleString("en-IN")}
                        </strong>
                        {loan.interest_rate &&
                          ` @ ${loan.interest_rate}% interest`}
                      </p>
                    </div>
                  )}

                  {loan.status === "REJECTED" && (
                    <div className="mt-4">
                      {loan.ai_explanation ? (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-700">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-600 whitespace-pre-wrap">
                            {loan.ai_explanation}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestExplanation(loan.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ❓ Request Explanation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MapPin, Image as ImageIcon } from "lucide-react";

export default function ComplaintHistory() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyComplaints();
  }, [navigate]);

  const fetchMyComplaints = async () => {
    try {
      const res = await fetch("/api/complaints/my-complaints", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      setError("Could not load your complaint history.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "In Progress": return <Clock className="w-5 h-5 text-blue-500" />;
      case "Rejected": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-50 text-green-700 border-green-200";
      case "In Progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Rejected": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => navigate("/")} className="mr-4 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">My Complaint History</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading your complaints...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
            You haven't submitted any complaints yet.
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map(complaint => (
              <div key={complaint._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{complaint.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{new Date(complaint.timestamp).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{complaint.complaintID}</h3>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(complaint.complaintStatus)}`}>
                    {getStatusIcon(complaint.complaintStatus)}
                    <span className="ml-2">{complaint.complaintStatus}</span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col sm:flex-row gap-5">
                  {complaint.photoURL ? (
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={complaint.photoURL} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm mb-4">{complaint.description}</p>
                    
                    <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-4">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {complaint.locationDetails}
                    </div>

                    {complaint.resolutionNotes && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-bold text-green-800 mb-1">Admin Notes:</p>
                        <p className="text-sm text-green-700">{complaint.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

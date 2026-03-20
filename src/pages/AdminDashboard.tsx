import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, AlertTriangle, CheckCircle, Clock, MapPin, Image as ImageIcon, LogOut, X } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc" | "status">("dateDesc");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/complaints/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      fetchComplaints();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      await fetch(`/api/complaints/${id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ notes })
      });
      fetchComplaints();
    } catch (err) {
      console.error("Failed to update notes");
    }
  };

  const markAsFake = async (id: string) => {
    try {
      await fetch(`/api/complaints/${id}/mark-fake`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (err) {
      console.error("Failed to mark as fake");
    }
  };

  const filteredComplaints = complaints
    .filter(c => {
      const matchesSearch = c.complaintID.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || c.verificationStatus === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === "dateAsc") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === "status") {
        return a.verificationStatus.localeCompare(b.verificationStatus);
      }
      return 0;
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Complaint ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VALID">Valid</option>
              <option value="POSSIBLE_FAKE">Possible Fake</option>
              <option value="FAKE">Fake</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
            >
              <option value="dateDesc">Newest First</option>
              <option value="dateAsc">Oldest First</option>
              <option value="status">Verification Status</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">No complaints found.</div>
        ) : (
          <div className="grid gap-6">
            {filteredComplaints.map(complaint => (
              <div 
                key={complaint._id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedComplaint(complaint)}
              >
                {/* Image Section */}
                <div className="md:w-64 h-48 md:h-auto bg-slate-100 relative flex-shrink-0">
                  {complaint.photoURL ? (
                    <img src={complaint.photoURL} alt="Evidence" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {(complaint.verificationStatus === "POSSIBLE_FAKE" || complaint.verificationStatus === "FAKE") && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-sm">
                      <AlertTriangle className="w-3 h-3 mr-1" /> FAKE DETECTED
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{complaint.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{new Date(complaint.timestamp).toLocaleString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{complaint.complaintID}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2" onClick={e => e.stopPropagation()}>
                      <select
                        value={complaint.complaintStatus}
                        onChange={(e) => updateStatus(complaint.complaintID, e.target.value)}
                        className={`text-sm font-semibold rounded-full px-3 py-1 border-0 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer ${
                          complaint.complaintStatus === "Resolved" ? "bg-green-50 text-green-700 ring-green-600/20" :
                          complaint.complaintStatus === "Rejected" ? "bg-red-50 text-red-700 ring-red-600/20" :
                          complaint.complaintStatus === "In Progress" ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                          "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      {complaint.complaintStatus === "Resolved" && !complaint.resolutionNotes && (
                        <button 
                          onClick={() => {
                            const note = prompt("Enter resolution notes:");
                            if (note) updateNotes(complaint.complaintID, note);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          + Add Note
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 text-sm mb-4 flex-1">{complaint.description}</p>
                  
                  {complaint.resolutionNotes && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-800 mb-1">Resolution Notes:</p>
                      <p className="text-sm text-green-700">{complaint.resolutionNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-2 rounded-lg mt-auto">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {complaint.locationDetails}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Complaint Details</h2>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 flex-1">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Complaint ID</p>
                    <p className="text-lg font-bold text-slate-900">{selectedComplaint.complaintID}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                    <p className="text-base text-slate-900">{selectedComplaint.category}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                    <p className="text-base text-slate-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                    <div className="flex items-center text-base text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                      {selectedComplaint.locationDetails}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Submission Date</p>
                      <p className="text-base text-slate-900">{new Date(selectedComplaint.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Verification Status</p>
                      <p className={`text-base font-semibold ${
                        selectedComplaint.verificationStatus === "VALID" ? "text-green-600" :
                        selectedComplaint.verificationStatus === "FAKE" ? "text-red-600" :
                        selectedComplaint.verificationStatus === "POSSIBLE_FAKE" ? "text-orange-600" :
                        "text-slate-600"
                      }`}>
                        {selectedComplaint.verificationStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:w-72 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-2">Evidence Photo</p>
                    <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 aspect-square flex items-center justify-center">
                      {selectedComplaint.photoURL ? (
                        <img src={selectedComplaint.photoURL} alt="Evidence" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 mb-2" />
                          <span className="text-sm">No photo provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedComplaint.verificationStatus !== "FAKE" && (
                    <button
                      onClick={() => markAsFake(selectedComplaint.complaintID)}
                      className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-medium flex items-center justify-center transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" /> Mark as Fake
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

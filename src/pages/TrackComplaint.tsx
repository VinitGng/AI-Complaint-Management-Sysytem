import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;
      if (!userId) return;

      const socket: Socket = io(window.location.origin);
      socket.on("connect", () => {
        socket.emit("join", userId);
      });

      socket.on("complaint_updated", (data: any) => {
        setComplaint((prev: any) => {
          if (prev && prev.complaintID === data.complaintID) {
            return {
              ...prev,
              ...(data.complaintStatus && { complaintStatus: data.complaintStatus }),
              ...(data.resolutionNotes && { resolutionNotes: data.resolutionNotes })
            };
          }
          return prev;
        });
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      console.error("Socket connection failed", err);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/complaints/${complaintId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Complaint not found");
      setComplaint(data);
    } catch (err: any) {
      setError(err.message);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "VALID": return "text-green-600";
      case "POSSIBLE_FAKE": return "text-orange-600";
      case "FAKE": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Track Complaint Status</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g., CMP-123456)"
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 rounded-2xl flex items-start text-left mb-8">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {complaint && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Complaint ID</p>
                  <h2 className="text-2xl font-bold text-slate-900">{complaint.complaintID}</h2>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center w-fit ${getStatusColor(complaint.complaintStatus)}`}>
                  {complaint.complaintStatus === "Resolved" && <CheckCircle className="w-4 h-4 mr-2" />}
                  {complaint.complaintStatus === "In Progress" && <Clock className="w-4 h-4 mr-2" />}
                  {complaint.complaintStatus === "Pending" && <Clock className="w-4 h-4 mr-2" />}
                  {complaint.complaintStatus === "Rejected" && <AlertCircle className="w-4 h-4 mr-2" />}
                  {complaint.complaintStatus}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                  <p className="text-lg font-medium text-slate-900">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Submission Date</p>
                  <div className="flex items-center text-slate-900 font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(complaint.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-slate-500 mb-1">Location Details</p>
                  <div className="flex items-start text-slate-900 font-medium bg-slate-50 p-3 rounded-xl">
                    <MapPin className="w-5 h-5 mr-3 text-slate-400 mt-0.5 flex-shrink-0" />
                    {complaint.locationDetails}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                  <p className="text-slate-700 leading-relaxed">{complaint.description}</p>
                </div>
                {complaint.resolutionNotes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-slate-500 mb-1">Resolution Notes</p>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                      <p className="text-green-800 leading-relaxed">{complaint.resolutionNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Verification Status</h3>
              <div className="flex items-center">
                <div className={`flex items-center font-medium ${getVerificationColor(complaint.verificationStatus)}`}>
                  {complaint.verificationStatus === "VALID" && <CheckCircle className="w-5 h-5 mr-2" />}
                  {complaint.verificationStatus === "POSSIBLE_FAKE" && <AlertCircle className="w-5 h-5 mr-2" />}
                  {complaint.verificationStatus === "FAKE" && <AlertCircle className="w-5 h-5 mr-2" />}
                  {complaint.verificationStatus === "PENDING" && <Clock className="w-5 h-5 mr-2" />}
                  {complaint.verificationStatus.replace("_", " ")}
                </div>
                <span className="mx-4 text-slate-300">|</span>
                <span className="text-sm text-slate-500">
                  {complaint.verificationStatus === "VALID" ? "AI verified image matches description" : 
                   complaint.verificationStatus === "POSSIBLE_FAKE" ? "AI flagged potential mismatch or location issue" : 
                   complaint.verificationStatus === "FAKE" ? "Marked as fake by administrator" :
                   "Awaiting verification"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

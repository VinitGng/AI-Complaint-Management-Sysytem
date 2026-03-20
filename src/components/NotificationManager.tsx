import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Bell, X } from "lucide-react";
import { useLocation } from "react-router-dom";

type Notification = {
  id: string;
  message: string;
  complaintID: string;
  complaintStatus?: string;
  resolutionNotes?: string;
};

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      if (!user.id && !user._id) return;
      
      const userId = user.id || user._id;

      // Connect to the same host
      const socket: Socket = io(window.location.origin);

      socket.on("connect", () => {
        console.log("Connected to notification server");
        socket.emit("join", userId);
      });

      socket.on("complaint_updated", (data: any) => {
        const newNotification: Notification = {
          id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9),
          message: data.message,
          complaintID: data.complaintID,
          complaintStatus: data.complaintStatus,
          resolutionNotes: data.resolutionNotes
        };
        
        setNotifications(prev => [...prev, newNotification]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      console.error("Failed to setup notifications", err);
    }
  }, [location.pathname]); // Re-run if user logs in and changes route

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map(notif => (
        <div key={notif.id} className="bg-white rounded-xl shadow-lg border border-indigo-100 p-4 flex items-start animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-indigo-100 rounded-full p-2 mr-3 flex-shrink-0">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 mr-2">
            <h4 className="text-sm font-bold text-slate-900">Update on {notif.complaintID}</h4>
            <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
          </div>
          <button onClick={() => dismiss(notif.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

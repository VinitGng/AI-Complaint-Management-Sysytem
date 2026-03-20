import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function LocationPermission() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAllow = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          localStorage.setItem("userLocation", JSON.stringify({ lat: latitude, lng: longitude, timestamp: Date.now() }));
          setTimeout(() => navigate("/login"), 2000);
        },
        (err) => {
          setError("Location access is required to submit complaints.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleDeny = () => {
    setError("Location access is required to submit complaints. You can only browse limited features.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Location Access Required</h2>
          <p className="text-slate-600 mb-8">
            This platform requires live location access to verify complaint authenticity.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start text-left">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {location ? (
            <div className="h-48 rounded-xl overflow-hidden mb-6">
              <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lng]}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleAllow}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Allow Location
              </button>
              <button
                onClick={handleDeny}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Deny
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

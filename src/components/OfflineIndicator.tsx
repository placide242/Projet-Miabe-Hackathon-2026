import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !showReconnected) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-elevated flex items-center gap-2 text-sm font-medium animate-fade-up ${
        online ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
      }`}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4" /> Reconnecté
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" /> Mode hors ligne — vos données sont en cache
        </>
      )}
    </div>
  );
};

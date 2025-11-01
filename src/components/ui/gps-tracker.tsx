import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface GPSTrackerProps {
  onLocationUpdate: (location: GPSLocation) => void;
  showMap?: boolean;
}

export const GPSTracker = ({ onLocationUpdate, showMap = true }: GPSTrackerProps) => {
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      toast.error("GPS not supported");
      return;
    }

    setIsTracking(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        // Get address from coordinates (reverse geocoding)
        try {
          const address = await reverseGeocode(newLocation.latitude, newLocation.longitude);
          newLocation.address = address;
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
        }

        setLocation(newLocation);
        onLocationUpdate(newLocation);
        setIsTracking(false);
        toast.success("Location captured successfully");
      },
      (error) => {
        setIsTracking(false);
        let errorMessage = "Failed to get location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Using a free geocoding service (in production, use a proper service)
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.display_name || data.locality || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return "bg-green-500";
    if (accuracy <= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          GPS Location Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            disabled={isTracking}
            className="flex-1"
          >
            {isTracking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            {isTracking ? "Getting Location..." : "Get Current Location"}
          </Button>
          
          {location && (
            <Button variant="outline" onClick={openInMaps}>
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {location && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Coordinates</p>
                <p className="font-mono">
                  {formatCoordinates(location.latitude, location.longitude)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Accuracy</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getAccuracyColor(location.accuracy)}`} />
                  <span>{Math.round(location.accuracy)}m</span>
                </div>
              </div>
            </div>

            {location.address && (
              <div>
                <p className="text-muted-foreground text-sm">Address</p>
                <p className="text-sm">{location.address}</p>
              </div>
            )}

            <div>
              <p className="text-muted-foreground text-sm">Captured</p>
              <p className="text-sm">
                {new Date(location.timestamp).toLocaleString()}
              </p>
            </div>

            {showMap && (
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="200"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                  className="rounded-lg border"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
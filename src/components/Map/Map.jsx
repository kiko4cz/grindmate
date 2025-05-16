import React, { useState, useEffect } from 'react';
import { FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map() {
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize map
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const mapInstance = L.map(mapElement, {
      center: [50.0755, 14.4378],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true, // Use canvas renderer for better performance
      maxZoom: 18, // Limit max zoom for better performance
      minZoom: 3,
      wheelDebounceTime: 40, // Reduce debounce time for smoother zooming
      wheelPxPerZoomLevel: 60, // Adjust zoom speed
      updateWhenIdle: true, // Only update when user stops moving
      updateWhenZooming: false, // Don't update tiles while zooming
      keepBuffer: 2 // Reduce number of tiles kept in memory
    });

    // Add OpenStreetMap tiles with a lighter style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    }).addTo(mapInstance);

    // Add zoom control in a better position
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapInstance);

    // Add attribution in a better position
    L.control.attribution({
      position: 'bottomleft'
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  const getUserLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];

          // Center map on user location with optimized animation
          map.flyTo(location, 15, {
            duration: 1,
            easeLinearity: 0.5,
            noMoveStart: true // Prevent unnecessary updates
          });

          // Remove existing marker if any
          if (userMarker) {
            map.removeLayer(userMarker);
          }

          // Add new marker with optimized icon
          const marker = L.marker(location, {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: '<div class="user-marker"></div>',
              iconSize: [16, 16] // Smaller icon for better performance
            })
          }).addTo(map);

          // Add accuracy circle with optimized styling
          const circle = L.circle(location, {
            radius: position.coords.accuracy,
            color: '#4CAF50',
            fillColor: '#4CAF50',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '5, 5',
            updateWhenIdle: true,
            updateWhenZooming: false
          }).addTo(map);

          setUserMarker(marker);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Nepodařilo se získat vaši polohu. Zkontrolujte prosím nastavení prohlížeče.');
        }
      );
    } else {
      setError('Váš prohlížeč nepodporuje geolokaci.');
    }
  };

  useEffect(() => {
    if (map) {
      getUserLocation();
    }
  }, [map]);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="map-container">
      <div id="map" className="map"></div>
      <button 
        className="location-button"
        onClick={getUserLocation}
        title="Zobrazit moji polohu"
      >
        <FaLocationArrow />
      </button>
    </div>
  );
}

export default Map; 
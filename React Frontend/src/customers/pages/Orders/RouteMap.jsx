import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Replace with your own Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoicmF6YS13ZWJkZXYiLCJhIjoiY2xkMGlmd2Q3MTd3bzNydGcxamRuYnB0OCJ9.Tmj5M-Wwq6iF0H6V_JM4WA";

const RouteMap = ({ pickupInformation, dropInformation }) => {
  const mapContainer = useRef(null); // Reference to map container
  const map = useRef(null); // Reference to map instance

  const [route, setRoute] = useState(null); // State to store the route

  console.log("In map");
  console.log(pickupInformation, dropInformation);

  // Coordinates for pickup and drop locations
  const pickup = [pickupInformation.longitude, pickupInformation.latitude]; // Sample coordinates (New York Pickup)
  const drop = [dropInformation.longitude, dropInformation.latitude]; // Sample coordinates (New York Drop)

  // Function to fetch directions from Mapbox Directions API
  const getRoute = async (pickup, drop) => {
    const accessToken =
      "pk.eyJ1IjoicmF6YS13ZWJkZXYiLCJhIjoiY2xkMGlmd2Q3MTd3bzNydGcxamRuYnB0OCJ9.Tmj5M-Wwq6iF0H6V_JM4WA"; // Replace with your Mapbox access token
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const routeData = data.routes[0].geometry.coordinates;
        setRoute(routeData); // Set the route state with the coordinates

        const distance = data.routes[0].distance / 1000; // Convert to km
        const duration = data.routes[0].duration / 60; // Convert to minutes
        // console.log(`Distance: ${distance.toFixed(2)} km`);
        // console.log(`Duration: ${duration.toFixed(2)} minutes`);

        return routeData;
      } else {
        console.error("No routes found:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      return null;
    }
  };

  // Initialize the map
  useEffect(() => {
    if (map.current) return; // If map is already initialized, return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: pickup,
      zoom: 12,
    });

    // After the map has loaded, fetch and display the route
    map.current.on("load", async () => {
      const routeCoordinates = await getRoute(pickup, drop);

      // Add the route line if available
      if (routeCoordinates) {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeCoordinates,
            },
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#3887be", "line-width": 5 },
        });

        // Create a bounding box for the route
        const bounds = new mapboxgl.LngLatBounds();

        // Extend the bounds to include the route coordinates
        routeCoordinates.forEach((coord) => {
          bounds.extend(coord);
        });

        // Fit the map to the route's bounding box
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
        });
      }

      // Add markers for the pickup and drop locations
      new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(pickup)
        .setPopup(new mapboxgl.Popup().setText("Pickup Location"))
        .addTo(map.current);

      new mapboxgl.Marker({ color: "#00FF00" })
        .setLngLat(drop)
        .setPopup(new mapboxgl.Popup().setText("Drop Location"))
        .addTo(map.current);
    });
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default RouteMap;

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const RouteMapRealtime = ({
  pickupInformation,
  dropInformation,
  deliveryBoyLocation,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarker = useRef(null);
  const [route, setRoute] = useState(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const pickup = [pickupInformation.longitude, pickupInformation.latitude];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: pickup,
      zoom: 12,
    });

    map.current.on("load", async () => {
      const drop = [dropInformation.longitude, dropInformation.latitude];

      // Get and display initial route
      const routeCoordinates = await getRoute(pickup, drop);

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
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.8,
          },
        });
      }

      // Add pickup marker (Restaurant)
      new mapboxgl.Marker({ color: "#FF6B6B" })
        .setLngLat(pickup)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<h3 style='color: black; font-weight: bold;'>Pickup Location</h3><p style='color: black;'>Restaurant</p>"
          )
        )
        .addTo(map.current);

      // Add drop marker (Customer)
      new mapboxgl.Marker({ color: "#4ECDC4" })
        .setLngLat(drop)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<h3 style='color: black; font-weight: bold;'>Delivery Location</h3><p style='color: black;'>Your Address</p>"
          )
        )
        .addTo(map.current);

      // Fit map to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(pickup);
      bounds.extend(drop);
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
      });
    });
  }, [pickupInformation, dropInformation]);

  // Update delivery boy location marker
  useEffect(() => {
    if (!map.current || !deliveryBoyLocation) return;

    const deliveryLocation = [
      deliveryBoyLocation.longitude,
      deliveryBoyLocation.latitude,
    ];

    // Create or update delivery boy marker
    if (!deliveryMarker.current) {
      // Create custom delivery boy marker element
      const el = document.createElement("div");
      el.className = "delivery-boy-marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#FFD700";
      el.style.border = "3px solid #FF6B6B";
      el.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.8)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.innerHTML = "🏍️";
      el.style.fontSize = "24px";
      el.style.animation = "pulse 2s infinite";

      deliveryMarker.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
        pitchAlignment: "map",
      })
        .setLngLat(deliveryLocation)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style='color: black;'>
              <h3 style='font-weight: bold; margin-bottom: 5px;'>Delivery Partner</h3>
              <p style='margin: 0;'>Status: ${deliveryBoyLocation.status.replace(
                /_/g,
                " "
              )}</p>
              ${
                deliveryBoyLocation.speed
                  ? `<p style='margin: 0;'>Speed: ${deliveryBoyLocation.speed.toFixed(
                      1
                    )} km/h</p>`
                  : ""
              }
            </div>`
          )
        )
        .addTo(map.current);

      // Add animation style
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    } else {
      // Update existing marker position with smooth animation
      deliveryMarker.current.setLngLat(deliveryLocation);

      // Update popup content
      deliveryMarker.current.setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style='color: black;'>
            <h3 style='font-weight: bold; margin-bottom: 5px;'>Delivery Partner</h3>
            <p style='margin: 0;'>Status: ${deliveryBoyLocation.status.replace(
              /_/g,
              " "
            )}</p>
            ${
              deliveryBoyLocation.speed
                ? `<p style='margin: 0;'>Speed: ${deliveryBoyLocation.speed.toFixed(
                    1
                  )} km/h</p>`
                : ""
            }
          </div>`
        )
      );

      // Rotate marker based on heading
      if (deliveryBoyLocation.heading) {
        const el = deliveryMarker.current.getElement();
        el.style.transform = `rotate(${deliveryBoyLocation.heading}deg)`;
      }
    }

    // Update route from current delivery boy location to drop
    const drop = [dropInformation.longitude, dropInformation.latitude];
    updateRouteFromDeliveryBoy(deliveryLocation, drop);

    // Smoothly pan map to show delivery boy location
    map.current.easeTo({
      center: deliveryLocation,
      zoom: 14,
      duration: 1000,
    });
  }, [deliveryBoyLocation, dropInformation]);

  // Get route from Mapbox API
  const getRoute = async (pickup, drop) => {
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates;
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
    return null;
  };

  // Update route from delivery boy's current position to drop location
  const updateRouteFromDeliveryBoy = async (deliveryLocation, drop) => {
    const routeCoordinates = await getRoute(deliveryLocation, drop);

    if (routeCoordinates && map.current.getSource("route")) {
      map.current.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      });
    }
  };

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default RouteMapRealtime;

<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    
    export let polyline = null;
    export let startLat = null;
    export let startLng = null;
    export let id = '';
    
    // Replace with your Mapbox access token
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFpa2FsbGwiLCJhIjoiY21hYmZyMjB3MmIwejJ3c2R4dnRvNmYxYiJ9.uI-yZ7Sgrb5WxtVNp14KdA';
    
    let map;
    let mapContainer;
    let mapboxgl;
    let mapLoaded = false;
    
    onMount(async () => {
        if (!browser || !polyline) return;
        
        try {
            // Dynamically import mapbox-gl
            const mapboxModule = await import('mapbox-gl');
            mapboxgl = mapboxModule.default;
            
            // Import mapbox-gl CSS
            const mapboxStyles = document.createElement('link');
            mapboxStyles.rel = 'stylesheet';
            mapboxStyles.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
            document.head.appendChild(mapboxStyles);
            
            // Initialize map
            setTimeout(initMap, 100);
        } catch (error) {
            console.error('Failed to load Mapbox:', error);
        }
    });
    
    onDestroy(() => {
        if (map) {
            try {
                map.remove();
            } catch (error) {
                console.error('Error removing map:', error);
            }
        }
    });
    
    function initMap() {
        if (!mapContainer || !polyline || !mapboxgl) return;
        
        try {
            // First decode the polyline to get coordinates
            const coordinates = decodePolyline(polyline);
            
            // Pre-calculate bounds to use for initial positioning
            let initialBounds = null;
            if (coordinates && coordinates.length > 0) {
                initialBounds = getRouteBounds(coordinates);
            }
            
            // Set access token
            mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
            
            // Create map options with initial positioning
            const mapOptions = {
                container: mapContainer,
                style: 'mapbox://styles/mapbox/dark-v11',
                interactive: false,
                attributionControl: false,
                minZoom: 12 // Enforce a minimum zoom level
            };
            
            // If we have route coordinates, set initial bounds
            if (initialBounds) {
                mapOptions.bounds = initialBounds;
                mapOptions.fitBoundsOptions = {
                    padding: 25, // Reduced from 30 for tighter fit
                    maxZoom: 16, // Limit how far it can zoom in
                    duration: 0 // Disable animation
                };
            } else if (startLat && startLng) {
                // Otherwise use start point with a closer zoom
                mapOptions.center = [startLng, startLat];
                mapOptions.zoom = 14.5; // Increased from 14
            }
            
            // Create the map with pre-positioned view
            map = new mapboxgl.Map(mapOptions);
            
            // Hide map until it's fully ready
            if (mapContainer) {
                mapContainer.style.opacity = '0';
            }
            
            map.on('load', () => {
                try {
                    // Add route data as before
                    if (coordinates && coordinates.length > 0) {
                        // Create a GeoJSON object for the route
                        const routeData = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: coordinates.map(coord => [coord[1], coord[0]]) // Convert [lat,lng] to [lng,lat] for GeoJSON
                            }
                        };
                        
                        // Add the route source
                        map.addSource('route', {
                            type: 'geojson',
                            data: routeData
                        });
                        
                        // Add route layer with glow effect
                        map.addLayer({
                            id: 'route-glow',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#FF5500',
                                'line-width': 8,
                                'line-opacity': 0.15,
                                'line-blur': 3
                            }
                        });
                        
                        // Add main route line
                        map.addLayer({
                            id: 'route-line',
                            type: 'line',
                            source: 'route',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#FF5500',
                                'line-width': 3,
                                'line-opacity': 0.8
                            }
                        });
                        
                        // Add start point marker
                        addMarker(coordinates[0], 'start');
                        
                        // Add end point marker
                        addMarker(coordinates[coordinates.length - 1], 'end');
                        
                        // Calculate route distance to determine if we should limit zoom
                        const totalDistance = calculateRouteDistance(coordinates);
                        
                        // For very short routes, set a maximum zoom
                        if (totalDistance < 0.5) { // If route is less than 500m
                            map.setZoom(15); // Set a fixed zoom level
                        } else {
                            // Fit to the route bounds with adjusted padding
                            const padding = (totalDistance < 2) ? 100 : 30; // More padding for longer routes
                            map.fitBounds(routePolyline.getBounds(), {
                                padding: padding,
                                duration: 0
                            });
                        }
                    }
                    
                    // Now show the map
                    if (mapContainer) {
                        mapContainer.style.opacity = '1';
                        mapContainer.style.transition = 'opacity 0.2s ease-in';
                    }
                    mapLoaded = true;
                    
                } catch (error) {
                    console.error('Error processing route data:', error);
                    // Show map anyway if there's an error
                    if (mapContainer) {
                        mapContainer.style.opacity = '1';
                    }
                    mapLoaded = true;
                }
            });
        } catch (error) {
            console.error('Error initializing map:', error);
            mapLoaded = true;
        }
    }
    
    // Rest of functions remain the same
    function addMarker(coordinates, type) {
        // Create marker element
        const el = document.createElement('div');
        el.className = `marker ${type}-marker`;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #fff';
        el.style.backgroundColor = type === 'start' ? '#00FF00' : '#FF0000';
        
        // Add marker to map
        new mapboxgl.Marker(el)
            .setLngLat([coordinates[1], coordinates[0]])
            .addTo(map);
    }
    
    function getRouteBounds(coordinates) {
        // Calculate the bounding box of all coordinates
        let minLat = Infinity;
        let maxLat = -Infinity;
        let minLng = Infinity;
        let maxLng = -Infinity;
        
        coordinates.forEach(coord => {
            const [lat, lng] = coord;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        });
        
        // Smaller padding for tighter view (reduced from 0.01)
        const padding = 0.004; // About 400m of padding
        return [
            [minLng - padding, minLat - padding], // Southwest corner
            [maxLng + padding, maxLat + padding]  // Northeast corner
        ];
    }
    
    // Decode polyline function
    function decodePolyline(str) {
        if (!str) return null;
        
        try {
            let index = 0,
                lat = 0,
                lng = 0,
                coordinates = [],
                shift = 0,
                result = 0,
                byte = null,
                latitude_change,
                longitude_change,
                factor = Math.pow(10, 5);

            while (index < str.length) {
                byte = null;
                shift = 0;
                result = 0;

                do {
                    byte = str.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);

                latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

                shift = result = 0;

                do {
                    byte = str.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);

                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

                lat += latitude_change;
                lng += longitude_change;

                coordinates.push([lat / factor, lng / factor]);
            }

            return coordinates;
        } catch (e) {
            console.error("Error decoding polyline:", e);
            return null;
        }
    }
    
    function calculateRouteDistance(coords) {
        let distance = 0;
        for (let i = 1; i < coords.length; i++) {
            distance += getDistanceBetweenPoints(coords[i-1], coords[i]);
        }
        return distance; // in kilometers
    }

    function getDistanceBetweenPoints(point1, point2) {
        // Haversine formula to calculate distance between two points
        const [lat1, lon1] = point1;
        const [lat2, lon2] = point2;
        
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
</script>

{#if browser}
<div class="relative h-[200px] w-full rounded-md overflow-hidden">
    <!-- Loading placeholder shown until map is ready -->
    {#if !mapLoaded}
    <div class="absolute inset-0 z-10 flex items-center justify-center bg-slate-700 bg-opacity-70">
        <p class="text-sm text-slate-300">Loading map...</p>
    </div>
    {/if}
    
    <!-- Map container initially hidden -->
    <div 
        bind:this={mapContainer} 
        class="route-map h-full w-full" 
        style="opacity: 0;"
    >
        {#if !polyline}
            <div class="flex h-full w-full items-center justify-center bg-slate-700 bg-opacity-30">
                <p class="text-sm text-slate-400">No route data available</p>
            </div>
        {/if}
    </div>
</div>
{:else}
<!-- Placeholder for server-side rendering -->
<div class="route-map h-[200px] w-full rounded-md overflow-hidden bg-slate-700 bg-opacity-30">
    <div class="flex h-full w-full items-center justify-center">
        <p class="text-sm text-slate-400">Loading map...</p>
    </div>
</div>
{/if}

<style>
    /* Map container styles */
    .route-map {
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Custom marker styles */
    :global(.marker) {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
    }
    
    :global(.start-marker) {
        box-shadow: 0 0 0 4px rgba(0, 255, 0, 0.2);
    }
    
    :global(.end-marker) {
        box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.2);
    }
</style>
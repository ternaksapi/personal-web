// Add polyline decoding functionality to Leaflet
// This file needs browser checks to avoid server-side errors

// Only run this code in the browser
if (typeof window !== 'undefined' && typeof L !== 'undefined') {
    L.Polyline.fromEncoded = function(encoded, options) {
        if (!encoded) {
            return null;
        }
        
        try {
            const decode = function(str, precision) {
                let index = 0,
                    lat = 0,
                    lng = 0,
                    coordinates = [],
                    shift = 0,
                    result = 0,
                    byte = null,
                    latitude_change,
                    longitude_change,
                    factor = Math.pow(10, precision || 5);

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
            };

            const points = decode(encoded);
            const latlngs = points.map(function(point) {
                return [point[0], point[1]];
            });

            return new L.Polyline(latlngs, options || {});
        } catch (e) {
            console.error("Error decoding polyline:", e);
            return null;
        }
    };
}
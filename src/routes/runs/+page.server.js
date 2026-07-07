export async function load({ fetch }) {
    try {
        const response = await fetch('/api/strava');
        
        // If the response isn't OK, handle it as an error
        if (!response.ok) {
            console.error('Strava API returned status:', response.status);
            let errorMessage = `API error: ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = [errorData.error, errorData.message].filter(Boolean).join(': ') || errorMessage;
            } catch {
                // Keep the status-only message when the endpoint does not return JSON.
            }

            return {
                activities: [],
                stats: {
                    totalRuns: 0,
                    totalDistance: '0.0',
                    longestRun: '0.0',
                    year: new Date().getFullYear(),
                    bestEfforts: []
                },
                error: errorMessage
            };
        }
        
        const data = await response.json();
        
        // Check if we received the expected data structure
        if (data.activities && Array.isArray(data.activities)) {
            console.log(`Successfully loaded ${data.activities.length} activities`);
            
            // Return the data directly as provided by the API
            return {
                activities: data.activities,
                stats: data.stats || {
                    totalRuns: data.activities.length,
                    totalDistance: '0.0',
                    longestRun: '0.0',
                    year: new Date().getFullYear(),
                    bestEfforts: []
                }
            };
        } else if (data.error) {
            console.error('API returned error:', data.error);
            return {
                activities: [],
                stats: {
                    totalRuns: 0,
                    totalDistance: '0.0',
                    longestRun: '0.0',
                    year: new Date().getFullYear(),
                    bestEfforts: []
                },
                error: [data.error, data.message].filter(Boolean).join(': ')
            };
        } else {
            console.error('Unexpected API response format:', data);
            return {
                activities: [],
                stats: {
                    totalRuns: 0,
                    totalDistance: '0.0',
                    longestRun: '0.0',
                    year: new Date().getFullYear(),
                    bestEfforts: []
                },
                error: 'Unexpected API response format'
            };
        }
    } catch (error) {
        console.error('Error in load function:', error);
        return {
            activities: [],
            stats: {
                totalRuns: 0,
                totalDistance: '0.0',
                longestRun: '0.0',
                year: new Date().getFullYear(),
                bestEfforts: []
            },
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Calculate pace (minutes per kilometer)
function formatPace(seconds, meters) {
    if (meters === 0) return '0:00';
    
    const paceInSeconds = seconds / (meters / 1000);
    const minutes = Math.floor(paceInSeconds / 60);
    const secs = Math.floor(paceInSeconds % 60);
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

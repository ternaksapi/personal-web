import { json } from '@sveltejs/kit';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } from '$env/static/private';

// Function to get a fresh access token using the refresh token
async function getAccessToken() {
    const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            refresh_token: STRAVA_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });

    const data = await response.json();
    return data.access_token;
}

// Function to fetch all runs from current year
async function getCurrentYearRuns(accessToken) {
    const allRuns = [];
    let page = 1;
    const perPage = 100; // Max allowed by Strava API
    let hasMoreActivities = true;
    
    // Get current year
    const currentYear = new Date().getFullYear();
    console.log(`Fetching activities for year: ${currentYear}`);
    
    // Set date boundaries for current year
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00Z`).getTime() / 1000;
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59Z`).getTime() / 1000;

    while (hasMoreActivities) {
        console.log(`Fetching page ${page} of activities...`);
        const response = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Strava API error: ${response.status} ${errorText}`);
            throw new Error(`Strava API error: ${response.status}`);
        }
        
        const activities = await response.json();
        console.log(`Retrieved ${activities.length} activities`);
        
        if (!activities || activities.length === 0) {
            console.log('No more activities found');
            hasMoreActivities = false;
            break;
        }
        
        // Filter to only include runs from current year
        const runsFromCurrentYear = activities.filter(activity => {
            const activityDate = new Date(activity.start_date);
            const activityTimestamp = activityDate.getTime() / 1000;
            const isRun = activity.type === 'Run';
            const isCurrentYear = activityTimestamp >= startOfYear && activityTimestamp <= endOfYear;
            
            return isRun && isCurrentYear;
        });
        
        console.log(`Found ${runsFromCurrentYear.length} runs from ${currentYear} in this batch`);
        allRuns.push(...runsFromCurrentYear);
        
        // Check if we've gone far enough back in time
        if (activities.length < perPage) {
            console.log('Retrieved less than requested page size, no more pages');
            hasMoreActivities = false;
        } else {
            const oldestActivityTime = new Date(activities[activities.length - 1].start_date).getTime() / 1000;
            if (oldestActivityTime < startOfYear) {
                console.log('Reached activities before current year, stopping pagination');
                hasMoreActivities = false;
            } else {
                page++;
            }
        }
    }
    
    console.log(`Total runs from ${currentYear} found: ${allRuns.length}`);
    return allRuns;
}

// GET endpoint to fetch activities
export async function GET() {
    try {
        const accessToken = await getAccessToken();
        const currentYearRuns = await getCurrentYearRuns(accessToken);
        
        // Process the runs for display
        const processedRuns = currentYearRuns.map(run => {
            // Handle potential missing or undefined properties
            const startLat = run.start_latlng && run.start_latlng.length > 0 ? run.start_latlng[0] : null;
            const startLng = run.start_latlng && run.start_latlng.length > 0 ? run.start_latlng[1] : null;
            
            return {
                id: run.id,
                name: run.name || 'Unnamed Activity',
                date: new Date(run.start_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                distance: (run.distance / 1000).toFixed(1), // kilometers
                time: formatTime(run.moving_time),
                pace: formatPace(run.moving_time, run.distance),
                elevation: Math.round(run.total_elevation_gain || 0), // meters
                kudos: run.kudos_count || 0,
                athleteId: run.athlete?.id || '',
                // Add map data with fallbacks for missing data
                map: run.map?.summary_polyline || null,
                startLat: startLat,
                startLng: startLng
            };
        });
        
        // Calculate stats for current year
        const totalDistance = currentYearRuns.reduce((sum, run) => sum + (run.distance / 1000), 0);
        const longestRun = currentYearRuns.length > 0 
            ? Math.max(...currentYearRuns.map(run => run.distance / 1000)) 
            : 0;
        
        const currentYear = new Date().getFullYear();
        
        return json({
            activities: processedRuns,
            stats: {
                totalRuns: currentYearRuns.length,
                totalDistance: totalDistance.toFixed(1),
                longestRun: longestRun.toFixed(1),
                year: currentYear
            }
        });
    } catch (error) {
        console.error('Error fetching Strava activities:', error);
        return json({ 
            error: 'Failed to fetch activities',
            message: error.message,
            activities: [],
            stats: {
                totalRuns: 0,
                totalDistance: '0.0',
                longestRun: '0.0',
                year: new Date().getFullYear()
            }
        }, { status: 500 });
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
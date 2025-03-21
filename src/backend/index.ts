import axios from "axios";
import { RecommendationCategory, AllergyRecommendation, ConditionRecommendation } from './gptHelper';
import { callGPTAPI, GPTResponse } from './gptHelper';

export type UserProfile = {
    age: number;
    gender: string;
    conditions: string[];
    allergies: string[];
};

export async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        return await response.json();
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}


// Function to fetch pollen data from Google Maps Pollen API
// To be added to src/backend/index.ts

/**
 * Fetches pollen forecast data for a specific location.
 * @param lat - Latitude
 * @param lon - Longitude
 * @param days - Number of forecast days (max 5)
 * @returns A promise resolving to the pollen data.
 */
export async function fetchPollenData(lat: number, lon: number, days: number = 1): Promise<any> {
  try {
    // Ensure days is within valid range (1-5)
    const forecastDays = Math.max(1, Math.min(5, days));
    
    const response = await axios.get(
      `https://pollen.googleapis.com/v1/forecast:lookup?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      {
        params: {
          'location.latitude': lat,
          'location.longitude': lon,
          'days': forecastDays,
          'languageCode': 'en',
          'plantsDescription': 1 // Include plant descriptions
        }
      }
    );
    
    console.log("Pollen API full response:", JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Pollen API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } else {
      console.error("Unexpected error:", error);
    }
    throw new Error("Error fetching pollen data");
  }
}
/**
 * Fetches the current location for the given ip address
 * @returns a promise resolving to Location object
 */
export async function fetchLocation(): Promise<any> {
    try {
        const ip = (await getIP() as any).ip
        const response = await axios.get(
            `https://api.weatherapi.com/v1/ip.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${ip}`
        )
        return response.data
    } catch (error) {
        throw new Error("Error fetching location data")
    }
}

/**
 * Fetches the current weather data for the given location.
 * @param location - The user's location.
 * @returns A promise resolving to the weather data.
 */
export async function fetchWeatherData(): Promise<any> {
    try {
        const location = await fetchLocation()
        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${location.lat},${location.lon}`
        );
        return response.data;
    } catch (error) {
        throw new Error("Error fetching weather data");
    }
}

export type EnvironmentAnalysisResult = {
  weather: any;
  airQuality: any;
  pollen: any;
  recommendations: string;
  riskLevel?: string;
  summary?: string;
  categories?: RecommendationCategory[];
  allergyRecommendations?: AllergyRecommendation[];
  conditionRecommendations?: ConditionRecommendation[];
  error?: {
    message: string;
    code: string;
  };
};

  /**
 * Fetches air quality data for the given coordinates.
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns A promise resolving to the air quality data.
 */
  export async function fetchAirQualityData(lat: number, lon: number): Promise<any> {
    try {
      const response = await axios({
        method: 'post',
        url: `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
        data: {
          universalAqi: true,
          location: {
            latitude: lat,
            longitude: lon
          },
          extraComputations: [
            "DOMINANT_POLLUTANT_CONCENTRATION",
            "POLLUTANT_CONCENTRATION",
            "LOCAL_AQI",
            "POLLUTANT_ADDITIONAL_INFO"
          ],
          languageCode: "en"
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Air quality API full response:", JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Air quality API error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Error fetching air quality data");
    }
  }
  /**
 * Analyzes environmental data and provides health recommendations
 * @param userProfile User profile information
 * @returns Analysis result with recommendations
 */
  
 // Updated analyzeEnvironment function with null checking

/**
 * Analyzes environmental data and provides health recommendations
 * @param userProfile User profile information
 * @returns Analysis result with recommendations
 */
export async function analyzeEnvironment(
  userProfile: UserProfile
): Promise<EnvironmentAnalysisResult> {
  try {
    const weatherData = await fetchWeatherData();
    const { lat, lon } = weatherData.location;
    
    // Fetch air quality data using the coordinates from weatherData
    const airQualityData = await fetchAirQualityData(lat, lon);
    
    // Fetch pollen data using the same coordinates
    const pollenData = await fetchPollenData(lat, lon, 1);

    // Safe access to user profile data with fallbacks for null/undefined values
    const userAge = userProfile?.age || 'Not specified';
    const userGender = userProfile?.gender || 'Not specified';
    const userAllergies = userProfile?.allergies && userProfile.allergies.length > 0 
      ? userProfile.allergies.join(', ') 
      : 'None listed';
    const userConditions = userProfile?.conditions && userProfile.conditions.length > 0 
      ? userProfile.conditions.join(', ') 
      : 'None listed';

    // Create a more detailed and instructive prompt
    // Enhanced prompt in analyzeEnvironment function in src/backend/index.ts
const gptPrompt = `Given the following environmental conditions: 
Weather: ${JSON.stringify(weatherData)}, 
Air Quality: ${JSON.stringify(airQualityData)},
Pollen Data: ${JSON.stringify(pollenData)}, 
and the user's profile: ${JSON.stringify(userProfile)}, 
analyze potential health risks and provide highly personalized recommendations.

User Profile Details:
- Age: ${userAge}
- Gender: ${userGender}
- Allergies: ${userAllergies}
- Medical Conditions: ${userConditions}

Please provide:
1. General environmental health recommendations based on weather, air quality, and pollen levels
2. PERSONALIZED recommendations for EACH specific allergy the user has listed (using their exact terminology)
3. PERSONALIZED recommendations for EACH specific medical condition the user has listed (using their exact terminology)

Consider all risk factors:
- Weather conditions (temperature, humidity, UV index, etc.)
- Air quality metrics (pollutant levels, AQI category)
- Pollen levels (types, intensity, seasonality)

For each allergy and condition, provide highly specific, tailored advice considering the current environmental conditions and assign a specific risk level. Focus on how the current environmental conditions specifically impact their exact allergies and conditions.

If the user lists "Pollen" as an allergy, provide specific recommendations based on the current pollen types and levels in their area. If they list a condition like "Eczema", provide recommendations specific to managing eczema in the current weather, air quality and pollen conditions.`;
    // Use the standardized GPT API helper
    const gptResponse: GPTResponse = await callGPTAPI(gptPrompt);

    if (!gptResponse.success) {
      throw new Error(gptResponse.error?.message || "Error analyzing environment");
    }

    return {
      weather: weatherData,
      airQuality: airQualityData,
      pollen: pollenData,
      recommendations: gptResponse.data?.recommendations || "No recommendations available",
      riskLevel: gptResponse.data?.riskLevel,
      summary: gptResponse.data?.summary,
      categories: gptResponse.data?.categories,
      allergyRecommendations: gptResponse.data?.allergyRecommendations || [],
      conditionRecommendations: gptResponse.data?.conditionRecommendations || []
    };
  } catch (error) {
    console.error("Error analyzing environment:", error);
    
    return {
      weather: null,
      airQuality: null,
      pollen: null,
      recommendations: "An error occurred while analyzing environmental data.",
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "ANALYSIS_ERROR"
      }
    };
  }
}
import axios from "axios";

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

type EnvironmentAnalysisResult = {
    weather: any;
    airQuality: any;
    pollen: any;  // Add this field
    recommendations: string;
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
  
      const gptPrompt = `Given the following environmental conditions: 
      Weather: ${JSON.stringify(weatherData)}, 
      Air Quality: ${JSON.stringify(airQualityData)},
      Pollen Data: ${JSON.stringify(pollenData)}, 
      and the user's profile: ${JSON.stringify(userProfile)}, 
      analyze potential health risks worth mentioning and provide recommendations for the user. 
      
      Consider all three environmental factors: weather conditions, air quality metrics, and pollen levels.
      
      If air quality is poor, provide specific recommendations based on pollutants present.
      
      If pollen levels are high, provide recommendations for allergy sufferers, particularly if the user has noted allergies.
      
      Format your recommendations in markdown with clear headings for different categories of advice.`;
  
      const gptResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: gptPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      return {
        weather: weatherData,
        airQuality: airQualityData,
        pollen: pollenData,  // Add pollen data to the result
        recommendations: gptResponse.data.choices[0].message.content,
      };
    } catch (error) {
      console.error("Error analyzing environment:", error);
      throw new Error("Error analyzing environment");
    }
  }


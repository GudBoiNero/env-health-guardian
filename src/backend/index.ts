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
    recommendations: string;
  };

export async function analyzeEnvironment(
    userProfile: UserProfile
  ): Promise<EnvironmentAnalysisResult> {
    try {
      const weatherData = await fetchWeatherData();
      const { lat, lon } = weatherData.location;
      
      // Fetch air quality data using the coordinates from weatherData
      const airQualityData = await fetchAirQualityData(lat, lon);
  
      const gptPrompt = `Given the following environmental conditions: 
      Weather: ${JSON.stringify(weatherData)}, 
      Air Quality: ${JSON.stringify(airQualityData)}, 
      and the user's profile: ${JSON.stringify(userProfile)}, 
      analyze potential health risks worth mentioning and provide recommendations for the user. 
      Consider both weather conditions and air quality metrics. 
      If air quality is poor, provide specific recommendations based on pollutants present.`;
  
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
        recommendations: gptResponse.data.choices[0].message.content,
      };
    } catch (error) {
      console.error("Error analyzing environment:", error);
      throw new Error("Error analyzing environment");
    }
  }

/**
 * Fetches air quality data for the given coordinates.
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns A promise resolving to the air quality data.
 */
export async function fetchAirQualityData(lat: number, lon: number): Promise<any> {
    try {
      const response = await axios.get(
        `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            location: {
              latitude: lat,
              longitude: lon,
            },
            extraComputations: ["HEALTH_RECOMMENDATIONS"],
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching air quality data:", error);
      throw new Error("Error fetching air quality data");
    }
  }
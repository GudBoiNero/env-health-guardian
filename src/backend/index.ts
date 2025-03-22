// Updated backend/index.ts with consistent location handling across all APIs

import axios from "axios";

export type UserProfile = {
    age: number;
    gender: string;
    conditions: string[];
    allergies: string[];
    useCustomLocation?: boolean;
    customLocation?: {
        city: string;
        state?: string;
        country: string;
    };
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
 * Fetches the current location for the given ip address or uses custom location if provided
 * @param customLocation Optional custom location data
 * @returns a promise resolving to Location object
 */
export async function fetchLocation(customLocation?: { city: string; state?: string; country: string; }): Promise<any> {
    try {
        // If custom location provided, use it instead of IP lookup
        if (customLocation && customLocation.city) {
            console.log("Using custom location:", customLocation);
            
            // Format the query string for the API
            let locationQuery = customLocation.city;
            
            // Add state if provided
            if (customLocation.state && customLocation.state.trim() !== '') {
                locationQuery += `,${customLocation.state}`;
            }
            
            // Add country if provided
            if (customLocation.country && customLocation.country.trim() !== '') {
                locationQuery += `,${customLocation.country}`;
            }
            
            // Fetch location data from weather API using city name
            const response = await axios.get(
                `https://api.weatherapi.com/v1/search.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${encodeURIComponent(locationQuery)}`
            );
            
            // Check if we got any results
            if (response.data && response.data.length > 0) {
                // Use the first (best) match
                const bestMatch = response.data[0];
                return {
                    name: bestMatch.name,
                    region: bestMatch.region,
                    country: bestMatch.country,
                    lat: bestMatch.lat,
                    lon: bestMatch.lon
                };
            } else {
                console.log("Location not found. Please check the city, state, and country names.")
                throw new Error("Location not found. Please check the city, state, and country names.");
            }
        } else {
            // Use IP-based location as before
            const ip = (await getIP() as any).ip;
            const response = await axios.get(
                `https://api.weatherapi.com/v1/ip.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${ip}`
            );
            return response.data;
        }
    } catch (error) {
        throw new Error("Error fetching location data: " + (error instanceof Error ? error.message : String(error)));
    }
}

/**
 * Fetches the current weather data for the given location.
 * @param customLocation - Optional custom location provided by the user
 * @returns A promise resolving to the weather data.
 */
export async function fetchWeatherData(customLocation?: { city: string; state?: string; country: string; }): Promise<any> {
    try {
        const location = await fetchLocation(customLocation);
        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${location.lat},${location.lon}`
        );
        return response.data;
    } catch (error) {
        throw new Error("Error fetching weather data: " + (error instanceof Error ? error.message : String(error)));
    }
}

/**
 * Fetches air quality data for the given coordinates or location.
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

export async function analyzeEnvironment(
  userProfile: UserProfile
): Promise<EnvironmentAnalysisResult> {
  try {
    // First, validate that userProfile is defined and has expected structure
    if (!userProfile) {
      throw new Error("User profile is undefined");
    }
    
    // Create a safely formatted profile with defaults for missing properties
    const safeProfile = {
      age: userProfile.age || 0,
      gender: userProfile.gender || "unknown",
      allergies: Array.isArray(userProfile.allergies) ? userProfile.allergies.filter(a => a && a.trim() !== "") : [],
      conditions: Array.isArray(userProfile.conditions) ? userProfile.conditions.filter(c => c && c.trim() !== "") : []
    };
    
    // Get custom location if provided
    const customLocation = userProfile.useCustomLocation && userProfile.customLocation 
      ? userProfile.customLocation 
      : undefined;
    
    // Fetch weather data with possible custom location
    const weatherData = await fetchWeatherData(customLocation);
    const { lat, lon } = weatherData.location;
    
    // Fetch air quality data using the coordinates from weatherData
    const airQualityData = await fetchAirQualityData(lat, lon);
    
    // Fetch pollen data using the same coordinates
    const pollenData = await fetchPollenData(lat, lon, 1);

    // Format specific weather info for GPT
    const weather = {
      location: `${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}`,
      temperature: {
        celsius: weatherData.current.temp_c,
        fahrenheit: weatherData.current.temp_f
      },
      condition: weatherData.current.condition.text,
      humidity: weatherData.current.humidity,
      uvIndex: weatherData.current.uv,
      wind: {
        speed: weatherData.current.wind_mph,
        direction: weatherData.current.wind_dir
      },
      feelsLike: {
        celsius: weatherData.current.feelslike_c,
        fahrenheit: weatherData.current.feelslike_f
      }
    };

    // Format air quality data for GPT
    let airQuality = {
      aqi: "N/A",
      category: "N/A",
      dominantPollutant: "N/A",
      pollutants: []
    };
    
    if (airQualityData && airQualityData.indexes && airQualityData.indexes.length > 0) {
      // Try to get the US EPA AQI first, then fallback to Universal AQI
      const usEpaIndex = airQualityData.indexes.find((index: any) => index.code === "usa_epa");
      const universalIndex = airQualityData.indexes.find((index: any) => index.code === "uaqi");
      const aqiIndex = usEpaIndex || universalIndex;
      
      if (aqiIndex) {
        airQuality.aqi = aqiIndex.aqi || aqiIndex.aqiDisplay || "N/A";
        airQuality.category = aqiIndex.category || "N/A";
        airQuality.dominantPollutant = aqiIndex.dominantPollutant || "N/A";
      }
      
      if (airQualityData.pollutants && airQualityData.pollutants.length > 0) {
        airQuality.pollutants = airQualityData.pollutants.map((p: any) => {
          const name = p.fullName || p.displayName || p.code || "";
          const value = p.concentration?.value;
          const units = p.concentration?.units;
          
          // Format units for display
          let formattedUnits = units;
          if (units === "PARTS_PER_BILLION") formattedUnits = "ppb";
          if (units === "MICROGRAMS_PER_CUBIC_METER") formattedUnits = "μg/m³";
          
          return {
            name,
            value: value !== undefined ? value : "N/A",
            units: formattedUnits || ""
          };
        });
      }
    }

    // Format pollen data for GPT
    // Updated portion of the analyzeEnvironment function

// Format pollen data for GPT - with handling for unavailable data
let pollen = {
  region: "Unknown",
  date: "Unknown",
  pollenTypes: [],
  dataAvailable: false // Flag to indicate if pollen data is available
};

if (pollenData) {
  pollen.region = pollenData.regionCode || "Unknown";
  
  if (pollenData.dailyInfo && pollenData.dailyInfo.length > 0) {
    const dailyInfo = pollenData.dailyInfo[0];
    pollen.dataAvailable = true; // Set data available flag to true
    
    // Format date if available
    if (dailyInfo.date) {
      const { year, month, day } = dailyInfo.date;
      pollen.date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    // Format pollen types
    if (dailyInfo.pollenTypeInfo && dailyInfo.pollenTypeInfo.length > 0) {
      pollen.pollenTypes = dailyInfo.pollenTypeInfo.map((type: any) => {
        if (!type) return null;
        
        const result: any = {
          name: type.displayName || type.code || "Unknown",
          inSeason: type.inSeason || false,
          index: "N/A",
          category: "Unknown"
        };
        
        if (type.indexInfo) {
          result.index = type.indexInfo.value !== undefined ? type.indexInfo.value : "N/A";
          result.category = type.indexInfo.category || "Unknown";
        }
        
        if (type.healthRecommendations && type.healthRecommendations.length > 0) {
          result.recommendations = type.healthRecommendations;
        }
        
        return result;
      }).filter(Boolean);
    }
  }
}

// Modify the GPT prompt to handle unavailable pollen data
const gptPrompt = `Based on the environmental data and user profile, create a concise health recommendation report.

USER PROFILE:
- Age: ${safeProfile.age}
- Gender: ${safeProfile.gender}
- Allergies: ${JSON.stringify(safeProfile.allergies)}
- Medical Conditions: ${JSON.stringify(safeProfile.conditions)}

CURRENT WEATHER:
- Location: ${weather.location}
- Temperature: ${weather.temperature.celsius}°C / ${weather.temperature.fahrenheit}°F
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uvIndex}
- Wind: ${weather.wind.speed} mph (${weather.wind.direction})
- Feels Like: ${weather.feelsLike.celsius}°C / ${weather.feelsLike.fahrenheit}°F

AIR QUALITY:
- Air Quality Index (AQI): ${airQuality.aqi}
- Category: ${airQuality.category}
- Dominant Pollutant: ${airQuality.dominantPollutant}
- Pollutant Levels:
${airQuality.pollutants.map((p: any) => `  * ${p.name}: ${p.value} ${p.units}`).join('\n')}

POLLEN:
${pollen.dataAvailable ? 
`- Region: ${pollen.region}
- Date: ${pollen.date}
- Pollen Types:
${pollen.pollenTypes.map((p: any) => {
  let result = `  * ${p.name}: ${p.category} (${p.index})${p.inSeason ? ' - In Season' : ''}`;
  if (p.recommendations && p.recommendations.length > 0) {
    result += `\n    Recommendations: ${p.recommendations.join(', ')}`;
  }
  return result;
}).join('\n')}` : 
`- Pollen data is unavailable for this location`}

FOCUS AREAS:
1. Start with a brief, one-sentence acknowledgment of the user's allergies and conditions
2. Provide a very brief environmental summary (1-2 sentences only)
3. For each of the user's allergies and conditions, create a separate section with:
   - A header in the format: "### 🟢/🟡/🔴/⚪ [Allergy/Condition Name]" using:
     - 🔴 Red circle for high risk conditions
     - 🟡 Yellow circle for medium risk conditions
     - 🟢 Green circle for low risk conditions
     - ⚪ White circle for undefined risk level (when data is unavailable)
   - Classify the risk level using colored text:
     - \`<span style="color:red">**High Risk**</span>\` 
     - \`<span style="color:#E6B800">**Medium Risk**</span>\` 
     - \`<span style="color:green">**Low Risk**</span>\`
     - \`<span style="color:gray">**Undefined Risk**</span>\` (when data is unavailable)
4. For pollen allergies specifically:
   - If pollen data is unavailable, mark them as "Undefined Risk" with a white circle (⚪)
   - Explain that pollen data is unavailable for the location, but provide general advice
5. For each risk assessment, provide brief specific recommendations
6. Avoid repeating information
7. Format in markdown with clear, concise sections

Remember that the primary value is in specific, personalized recommendations for managing allergies and conditions in the current environmental context, based on the available weather, air quality, and pollen data provided. Use both colored circle emojis (🔴, 🟡, 🟢, ⚪) in section headers AND colored text spans to clearly indicate risk levels.`;
    console.log("Sending to GPT:", {
      profile: safeProfile,
      weather: weather,
      airQuality: airQuality,
      pollen: pollen
    }); // Debug log

    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
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
      pollen: pollenData,
      recommendations: gptResponse.data.choices[0].message.content,
    };
  } catch (error: unknown) {
    // Proper error handling with unknown type
    let errorMessage = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    console.error("Error analyzing environment:", error);
    throw new Error(`Error analyzing environment: ${errorMessage}`);
  }
}

type EnvironmentAnalysisResult = {
  weather: any;
  airQuality: any;
  pollen: any;
  recommendations: string;
};
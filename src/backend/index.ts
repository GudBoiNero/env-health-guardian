import axios from "axios";

type UserProfile = {
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

/**
 * Generates health risk analysis and recommendations using GPT.
 * @param userProfile - The user's profile containing age, conditions, and location.
 * @param weatherData - The weather data fetched for the user's location.
 * @returns A promise resolving to GPT's analysis and recommendations.
 */
export async function analyzeEnvironment(
    userProfile: UserProfile
): Promise<{ weather: any; recommendations: string }> {
    try {
        const weatherData = await fetchWeatherData();

        const gptPrompt = `Given the following environmental conditions: ${JSON.stringify(
            weatherData
        )} and the user's profile: ${JSON.stringify(
            userProfile
        )}, analyze potential health risks worth mentioning and provide recommendations for the user if an environmental health risk is indentified.`;

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
            recommendations: gptResponse.data.choices[0].message.content,
        };
    } catch (error) {
        throw new Error("Error analyzing environment");
    }
}


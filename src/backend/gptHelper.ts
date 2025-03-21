// src/backend/gptHelper.ts

import axios from 'axios';

// Define interfaces for GPT responses
export interface GPTResponse {
  success: boolean;
  data?: {
    recommendations: string;
    riskLevel: RiskLevel;
    summary: string;
    categories: RecommendationCategory[];
    allergyRecommendations?: AllergyRecommendation[];
    conditionRecommendations?: ConditionRecommendation[];
  };
  error?: {
    message: string;
    code: string;
  };
}

export enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface RecommendationCategory {
  name: string;
  items: string[];
}

export interface AllergyRecommendation {
  allergy: string;
  recommendations: string[];
  riskLevel: RiskLevel;
}

export interface ConditionRecommendation {
  condition: string;
  recommendations: string[];
  riskLevel: RiskLevel;
}

/**
 * Standardized function to make calls to the OpenAI API
 * @param prompt The prompt to send to the API
 * @returns A standardized GPT response
 */
export async function callGPTAPI(prompt: string): Promise<GPTResponse> {
  try {
    // Create a system message with instructions for structured output
    // Update to the structured prompt in src/backend/gptHelper.ts
const structuredPrompt = `
${prompt}

Please structure your response in JSON format with the following fields:
- summary: A brief summary of the environmental health assessment specific to this user's needs
- riskLevel: An overall risk assessment (low, moderate, high, or very_high)
- categories: An array of recommendation categories for general environmental factors, each with:
  - name: Category name (e.g., "Weather Precautions", "Air Quality", "UV Protection")
  - items: Array of specific recommendations as strings

Most importantly, provide highly personalized recommendations for each specific allergy and condition:

- allergyRecommendations: An array of recommendations for EACH allergy listed by the user, with:
  - allergy: The specific allergy exactly as listed by the user (e.g., "Pollen", "Dust", "Pet Dander")
  - recommendations: Array of detailed, tailored recommendations for managing this allergy in current conditions
  - riskLevel: Risk level specific to this allergy in current conditions (low, moderate, high, or very_high)

- conditionRecommendations: An array of recommendations for EACH medical condition listed by the user, with:
  - condition: The specific condition exactly as listed by the user (e.g., "Asthma", "Eczema", "COPD")
  - recommendations: Array of detailed, tailored recommendations for managing this condition in current conditions
  - riskLevel: Risk level specific to this condition in current conditions (low, moderate, high, or very_high)

The JSON should be valid and parseable. If the user has not listed any allergies or conditions, include empty arrays for those fields.

Importantly, use the exact terminology the user provided for their allergies and conditions, and make the recommendations highly specific to those exact issues.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an environmental health assistant that provides structured recommendations."
          },
          {
            role: "user",
            content: structuredPrompt
          }
        ],
        response_format: { type: "json_object" } // Request JSON response format
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GPT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the response content
    const content = response.data.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(content);
      
      // Generate markdown from the structured data
      const recommendations = formatRecommendationsAsMarkdown(parsedResponse);
      
      return {
        success: true,
        data: {
          ...parsedResponse,
          recommendations
        }
      };
    } catch (parseError) {
      console.error("Error parsing GPT response as JSON:", parseError);
      
      // Fallback if JSON parsing fails - treat the whole response as recommendations
      return {
        success: true,
        data: {
          recommendations: content,
          riskLevel: RiskLevel.MODERATE, // Default risk level
          summary: "Environmental health assessment",
          categories: [],
          allergyRecommendations: [],
          conditionRecommendations: []
        }
      };
    }
  } catch (error) {
    console.error("Error calling GPT API:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "GPT_API_ERROR"
      }
    };
  }
}

/**
 * Formats the structured response as markdown for display
 */
function formatRecommendationsAsMarkdown(data: any): string {
  let markdown = `# Environmental Health Assessment\n\n`;
  
  // Add summary
  if (data.summary) {
    markdown += `## Summary\n\n${data.summary}\n\n`;
  }
  
  // Add risk level
  if (data.riskLevel) {
    markdown += `## Risk Level: ${data.riskLevel.toUpperCase()}\n\n`;
  }
  
  // Add recommendation categories
  if (data.categories && Array.isArray(data.categories)) {
    markdown += `## Environmental Recommendations\n\n`;
    
    data.categories.forEach((category: RecommendationCategory) => {
      markdown += `### ${category.name}\n\n`;
      
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach((item: string) => {
          markdown += `- ${item}\n`;
        });
      }
      
      markdown += '\n';
    });
  }
  
  // Add allergy-specific recommendations
  if (data.allergyRecommendations && Array.isArray(data.allergyRecommendations) && data.allergyRecommendations.length > 0) {
    markdown += `## Allergy-Specific Recommendations\n\n`;
    
    data.allergyRecommendations.forEach((item: AllergyRecommendation) => {
      markdown += `### ${item.allergy} (Risk: ${item.riskLevel.toUpperCase()})\n\n`;
      
      if (item.recommendations && Array.isArray(item.recommendations)) {
        item.recommendations.forEach((rec: string) => {
          markdown += `- ${rec}\n`;
        });
      }
      
      markdown += '\n';
    });
  }
  
  // Add condition-specific recommendations
  if (data.conditionRecommendations && Array.isArray(data.conditionRecommendations) && data.conditionRecommendations.length > 0) {
    markdown += `## Medical Condition Management\n\n`;
    
    data.conditionRecommendations.forEach((item: ConditionRecommendation) => {
      markdown += `### ${item.condition} (Risk: ${item.riskLevel.toUpperCase()})\n\n`;
      
      if (item.recommendations && Array.isArray(item.recommendations)) {
        item.recommendations.forEach((rec: string) => {
          markdown += `- ${rec}\n`;
        });
      }
      
      markdown += '\n';
    });
  }
  
  return markdown;
}
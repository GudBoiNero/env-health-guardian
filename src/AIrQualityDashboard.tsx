import React from "react";
import { Card, Col, Row, Statistic, Tag } from "antd";

interface AirQualityProps {
  data: any;
}

const AirQualityDashboard: React.FC<AirQualityProps> = ({ data }) => {
  if (!data) {
    return <div>No air quality data available</div>;
  }

  console.log("Air quality data in component:", data);

  // Get AQI information from indexes array
  let aqiValue = "N/A";
  let aqiCategory = "N/A";
  let aqiColor = "default";
  let dominantPollutant = "";
  
  // Try to get the US EPA AQI first, then fallback to Universal AQI
  if (data.indexes && Array.isArray(data.indexes)) {
    // First try to get the US EPA AQI (usa_epa)
    const usEpaIndex = data.indexes.find((index: any) => index.code === "usa_epa");
    
    // If US EPA AQI not found, try Universal AQI (uaqi)
    const universalIndex = data.indexes.find((index: any) => index.code === "uaqi");
    
    // Use whichever index was found, preferring US EPA
    const aqiIndex = usEpaIndex || universalIndex;
    
    if (aqiIndex) {
      aqiValue = aqiIndex.aqi || aqiIndex.aqiDisplay || "N/A";
      aqiCategory = aqiIndex.category || "N/A";
      dominantPollutant = aqiIndex.dominantPollutant || "";
      
      // Get color from API if available
      if (aqiIndex.color) {
        const color = aqiIndex.color;
        // Convert RGB values to hex color
        const r = Math.round(color.red * 255) || 0;
        const g = Math.round(color.green * 255) || 0;
        const b = Math.round(color.blue * 255) || 0;
        aqiColor = `rgb(${r}, ${g}, ${b})`;
      } else {
        // Fallback to determining color based on category
        aqiColor = getAqiColor(aqiCategory);
      }
    }
  }
  
  // Determine tag color based on AQI category if not already set
  function getAqiColor(category: string): string {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("excellent") || lowerCategory.includes("good")) return "green";
    if (lowerCategory.includes("moderate")) return "yellow";
    if (lowerCategory.includes("unhealthy") && lowerCategory.includes("sensitive")) return "orange";
    if (lowerCategory.includes("unhealthy")) return "red";
    if (lowerCategory.includes("very unhealthy")) return "purple";
    if (lowerCategory.includes("hazardous")) return "darkred";
    return "default";
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Air Quality Index">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="AQI"
                  value={aqiValue}
                  valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                />
              </Col>
              <Col span={12}>
                <div style={{ marginTop: "16px" }}>
                  <Tag color={aqiColor}>{aqiCategory}</Tag>
                  {dominantPollutant && (
                    <div style={{ marginTop: "8px" }}>
                      <small>Dominant pollutant: {dominantPollutant.toUpperCase()}</small>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AirQualityDashboard;
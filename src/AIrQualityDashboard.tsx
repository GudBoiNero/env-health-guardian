import React from "react";
import { Card, Col, Row, Statistic, Descriptions, Tag } from "antd";

interface AirQualityProps {
  data: any;
}

const AirQualityDashboard: React.FC<AirQualityProps> = ({ data }) => {
    if (!data) {
      return <div>No air quality data available</div>;
    }
  
    console.log("Air quality data structure:", data);
  
    // Get AQI information - try different possible formats
    let aqiValue = "N/A";
    let aqiCategory = "N/A";
    
    // Check if there's an indexes array with US AQI
    if (data.indexes && Array.isArray(data.indexes)) {
      const aqiIndex = data.indexes.find((index: any) => 
        index.code === "us_aqi" || index.code === "uaqi" || index.code === "aqi"
      );
      if (aqiIndex) {
        aqiValue = aqiIndex.aqi || aqiIndex.value || "N/A";
        aqiCategory = aqiIndex.category || "N/A";
      }
    } 
    // Check for universalAqi in the response
    else if (data.universalAqi !== undefined) {
      aqiValue = data.universalAqi;
      // Determine category based on AQI value
      aqiCategory = getCategoryFromAQI(data.universalAqi);
    }
    // Check for other common formats
    else if (data.aqi !== undefined) {
      aqiValue = data.aqi;
      aqiCategory = getCategoryFromAQI(data.aqi);
    } else if (data.index && data.index.aqi !== undefined) {
      aqiValue = data.index.aqi;
      aqiCategory = data.index.category || getCategoryFromAQI(data.index.aqi);
    }
  
    // Determine tag color based on AQI category
    const getAqiColor = (category: string) => {
      switch (category.toLowerCase()) {
        case "good": return "green";
        case "moderate": return "yellow";
        case "unhealthy for sensitive groups": return "orange";
        case "unhealthy": return "red";
        case "very unhealthy": return "purple";
        case "hazardous": return "darkred";
        default: return "default";
      }
    };
    
    // Helper function to determine AQI category based on value
    function getCategoryFromAQI(aqi: number): string {
      if (aqi <= 50) return "Good";
      if (aqi <= 100) return "Moderate";
      if (aqi <= 150) return "Unhealthy for Sensitive Groups";
      if (aqi <= 200) return "Unhealthy";
      if (aqi <= 300) return "Very Unhealthy";
      return "Hazardous";
    }
  
    // Check for pollutants in different formats
    let pollutants = [];
    if (data.pollutants && Array.isArray(data.pollutants)) {
      pollutants = data.pollutants;
    } else if (data.pollutantConcentrations && Array.isArray(data.pollutantConcentrations)) {
      pollutants = data.pollutantConcentrations;
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
                    <Tag color={getAqiColor(aqiCategory)}>{aqiCategory}</Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
  
          {pollutants && pollutants.length > 0 ? (
            <Col span={24}>
              <Card title="Pollutants">
                <Descriptions column={1}>
                  {pollutants.map((pollutant: any, index: number) => {
                    // Handle different possible pollutant formats
                    const name = pollutant.displayName || pollutant.name || pollutant.code || `Pollutant ${index+1}`;
                    const value = pollutant.concentration?.value || pollutant.value;
                    const units = pollutant.concentration?.units || pollutant.unit || "μg/m³";
                    
                    return (
                      <Descriptions.Item key={pollutant.code || index} label={name}>
                        {value} {units}
                      </Descriptions.Item>
                    );
                  })}
                </Descriptions>
              </Card>
            </Col>
          ) : (
            <Col span={24}>
              <Card title="Pollutants">
                <p>Detailed pollutant information is not available for this location.</p>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };
export default AirQualityDashboard;
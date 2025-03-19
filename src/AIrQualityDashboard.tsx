import React from "react";
import { Card, Col, Row, Statistic, Descriptions, Tag } from "antd";

interface AirQualityProps {
  data: any;
}

const AirQualityDashboard: React.FC<AirQualityProps> = ({ data }) => {
  if (!data || !data.indexes || !data.pollutants) {
    return <div>No air quality data available</div>;
  }

  // Get AQI information
  const aqiIndex = data.indexes.find((index: any) => index.code === "us_aqi");
  const aqiValue = aqiIndex ? aqiIndex.aqi : "N/A";
  const aqiCategory = aqiIndex ? aqiIndex.category : "N/A";
  
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

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Air Quality Index">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="US AQI"
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

        <Col span={24}>
          <Card title="Pollutants">
            <Descriptions column={1}>
              {data.pollutants.map((pollutant: any) => (
                <Descriptions.Item key={pollutant.code} label={pollutant.displayName}>
                  {pollutant.concentration.value} {pollutant.concentration.units}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        </Col>

        {data.healthRecommendations && (
          <Col span={24}>
            <Card title="Health Recommendations">
              <ul>
                {Object.entries(data.healthRecommendations).map(([group, recommendation]: [string, any]) => (
                  <li key={group}>
                    <strong>{group.replace(/_/g, ' ')}:</strong> {recommendation}
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AirQualityDashboard;
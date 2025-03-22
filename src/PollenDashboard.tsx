// Updated PollenDashboard.tsx
import React from "react";
import { Card, Col, Row, Statistic, Descriptions, Tag, Typography, Alert, Space } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface PollenProps {
  data: any;
}

const PollenDashboard: React.FC<PollenProps> = ({ data }) => {
  if (!data) {
    return (
      <Alert
        message="No Pollen Data Available"
        description="Pollen data is unavailable for this location. Any pollen-related allergies will be marked as undefined risk level."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    );
  }

  console.log("Pollen data in component:", data);

  // Extract region code if available
  const regionCode = data.regionCode || "Unknown";
  
  // Process daily information (first day by default)
  const dailyInfo = data.dailyInfo && data.dailyInfo.length > 0 ? data.dailyInfo[0] : null;
  
  if (!dailyInfo) {
    return (
      <Alert
        message="No Daily Pollen Data Available"
        description="Detailed pollen data is unavailable for this location. Any pollen-related allergies will be marked as undefined risk level."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    );
  }

  // Format date
  const formatDate = (dateObj: any) => {
    if (!dateObj) return "Unknown date";
    const { year, month, day } = dateObj;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const date = formatDate(dailyInfo.date);
  
  // Process pollen type info
  const pollenTypes = dailyInfo.pollenTypeInfo || [];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={`Pollen Forecast (${date})`} extra={<small>Region: {regionCode}</small>}>
            <Typography.Paragraph>
              Below is the pollen forecast for your location. This can be important if you have seasonal allergies.
            </Typography.Paragraph>

            {pollenTypes.length === 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Limited Pollen Data"
                  description="No specific pollen type information is available for this location. Any pollen-related allergies will be marked as undefined risk level."
                  type="info"
                  showIcon
                />
                <Typography.Paragraph>
                  Even without specific pollen data, we've taken into account your allergies in our health recommendations. 
                  Consider checking local weather services for more detailed pollen forecasts.
                </Typography.Paragraph>
              </Space>
            ) : (
              pollenTypes.map((pollenType: any) => {
                if (!pollenType) return null;
                
                const {
                  code,
                  displayName,
                  inSeason,
                  indexInfo,
                  healthRecommendations = []
                } = pollenType;
                
                // Skip if essential data is missing
                if (!code || !displayName) return null;
                
                // Get color for tag based on index category
                let tagColor = "default";
                let indexValue = "N/A";
                let indexCategory = "Unknown";
                
                if (indexInfo) {
                  const { value, category, color } = indexInfo;
                  indexValue = value !== undefined ? value.toString() : "N/A";
                  indexCategory = category || "Unknown";
                  
                  // Determine tag color based on category or use API-provided color if available
                  if (color) {
                    // Convert RGB values to hex for display
                    const r = Math.round(color.red * 255) || 0;
                    const g = Math.round(color.green * 255) || 0;
                    const b = Math.round(color.blue * 255) || 0;
                    tagColor = `rgb(${r}, ${g}, ${b})`;
                  } else {
                    // Fallback to determining color based on category
                    tagColor = getPollenTagColor(indexCategory);
                  }
                }
                
                return (
                  <Card 
                    key={code} 
                    type="inner" 
                    title={displayName} 
                    style={{ marginBottom: '16px' }}
                    extra={inSeason ? <Tag color="green">In Season</Tag> : <Tag color="gray">Out of Season</Tag>}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Pollen Index"
                          value={indexValue}
                          valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                        />
                        <div style={{ marginTop: '8px' }}>
                          <Tag color={tagColor}>{indexCategory}</Tag>
                        </div>
                      </Col>
                      <Col span={12}>
                        {healthRecommendations && healthRecommendations.length > 0 ? (
                          <div>
                            <Typography.Text strong>Health Recommendations:</Typography.Text>
                            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                              {healthRecommendations.map((recommendation: string, i: number) => (
                                <li key={i}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <Typography.Text>No health recommendations available.</Typography.Text>
                        )}
                      </Col>
                    </Row>
                    
                    {/* Plant Description if available */}
                    {pollenType.plantDescription && (
                      <div style={{ marginTop: '16px' }}>
                        <Typography.Text strong>Plant Details:</Typography.Text>
                        <Descriptions column={1} size="small" style={{ marginTop: '8px' }}>
                          {pollenType.plantDescription.type && (
                            <Descriptions.Item label="Type">{pollenType.plantDescription.type}</Descriptions.Item>
                          )}
                          {pollenType.plantDescription.family && (
                            <Descriptions.Item label="Family">{pollenType.plantDescription.family}</Descriptions.Item>
                          )}
                          {pollenType.plantDescription.season && (
                            <Descriptions.Item label="Season">{pollenType.plantDescription.season}</Descriptions.Item>
                          )}
                        </Descriptions>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Helper function to determine tag color based on pollen index category
function getPollenTagColor(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes("none")) return "green";
  if (lowerCategory.includes("very low")) return "cyan";
  if (lowerCategory.includes("low")) return "blue";
  if (lowerCategory.includes("medium")) return "gold";
  if (lowerCategory.includes("high")) return "orange";
  if (lowerCategory.includes("very high")) return "red";
  return "default";
}

export default PollenDashboard;
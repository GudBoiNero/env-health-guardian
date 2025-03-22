import React from "react";
import { Typography, Alert, Space, Divider } from "antd";

const { Text, Paragraph, Title } = Typography;

const HealthDisclaimerSection: React.FC = () => {
  return (
    <div style={{ marginTop: "2em", marginBottom: "2em" }}>
      <Divider />
      <Alert
        type="info"
        showIcon
        message={<Title level={4} style={{ margin: 0 }}>Health Disclaimer</Title>}
        description={
          <Space direction="vertical">
            <Paragraph>
              <strong>Not Medical Advice:</strong> The information provided by Environment Health Guardian is for informational and educational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </Paragraph>
            <Paragraph>
              <strong>Consult Healthcare Professionals:</strong> Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition or health objectives, especially before making any changes to your treatment or lifestyle.
            </Paragraph>
            <Text type="secondary">
              © {new Date().getFullYear()} EnviSafe | Last updated: {new Date().toLocaleDateString()}
            </Text>
          </Space>
        }
      />
    </div>
  );
};

export default HealthDisclaimerSection;
// src/EnhancedRecommendations.tsx

import React from 'react';
import { Card, Tag, Typography, Divider, List, Row, Col, Alert } from 'antd';
import MarkdownParser from './MarkdownParser';
import { AllergyRecommendation, ConditionRecommendation } from './backend/gptHelper';

const { Title, Paragraph, Text } = Typography;

interface EnhancedRecommendationsProps {
  data: {
    recommendations: string;
    riskLevel?: string;
    summary?: string;
    categories?: Array<{name: string; items: string[]}>;
    allergyRecommendations?: AllergyRecommendation[];
    conditionRecommendations?: ConditionRecommendation[];
    error?: {
      message: string;
      code: string;
    };
  };
}

const EnhancedRecommendations: React.FC<EnhancedRecommendationsProps> = ({ data }) => {
  if (data.error) {
    return (
      <Card>
        <Title level={3}>Error</Title>
        <Paragraph type="danger">{data.error.message}</Paragraph>
      </Card>
    );
  }

  // Get risk level color based on severity
  const getRiskColor = (level?: string) => {
    if (!level) return 'default';
    
    switch(level.toLowerCase()) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      case 'very_high': return 'magenta';
      default: return 'default';
    }
  };

  // Check if we have allergy or condition recommendations
  const hasAllergies = data.allergyRecommendations && data.allergyRecommendations.length > 0;
  const hasConditions = data.conditionRecommendations && data.conditionRecommendations.length > 0;
  const hasStructuredData = (data.categories && data.categories.length > 0) || hasAllergies || hasConditions;

  return (
    <Card>
      <Title level={3}>Health Recommendations</Title>
      
      {data.riskLevel && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Overall Risk Level: </Text>
          <Tag color={getRiskColor(data.riskLevel)}>
            {data.riskLevel.toUpperCase()}
          </Tag>
        </div>
      )}
      
      {data.summary && (
        <>
          <Paragraph>
            <Text strong>Summary: </Text>
            {data.summary}
          </Paragraph>
          <Divider />
        </>
      )}
      
      {/* If we have structured data, display it in organized sections */}
      {hasStructuredData ? (
        <>
          {/* Environmental Categories */}
          {data.categories && data.categories.length > 0 && (
            <>
              <Title level={4}>Environmental Factors</Title>
              {data.categories.map((category, index) => (
                <div key={`category-${index}`} style={{ marginBottom: 16 }}>
                  <Title level={5}>{category.name}</Title>
                  <List
                    dataSource={category.items}
                    renderItem={(item) => (
                      <List.Item>
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              ))}
              <Divider />
            </>
          )}
          
          {/* Allergy Recommendations */}
          {hasAllergies && (
            <>
              <Title level={4}>Allergy Management</Title>
              <Row gutter={[16, 16]}>
                {data.allergyRecommendations!.map((allergy, index) => (
                  <Col xs={24} md={12} key={`allergy-${index}`}>
                    <Card 
                      type="inner" 
                      title={
                        <span>
                          {allergy.allergy}{' '}
                          <Tag color={getRiskColor(allergy.riskLevel)}>
                            {allergy.riskLevel.toUpperCase()}
                          </Tag>
                        </span>
                      }
                    >
                      <List
                        size="small"
                        dataSource={allergy.recommendations}
                        renderItem={(item) => (
                          <List.Item>
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
              <Divider />
            </>
          )}
          
          {/* Medical Condition Recommendations */}
          {hasConditions && (
            <>
              <Title level={4}>Medical Condition Management</Title>
              <Row gutter={[16, 16]}>
                {data.conditionRecommendations!.map((condition, index) => (
                  <Col xs={24} md={12} key={`condition-${index}`}>
                    <Card 
                      type="inner" 
                      title={
                        <span>
                          {condition.condition}{' '}
                          <Tag color={getRiskColor(condition.riskLevel)}>
                            {condition.riskLevel.toUpperCase()}
                          </Tag>
                        </span>
                      }
                    >
                      <List
                        size="small"
                        dataSource={condition.recommendations}
                        renderItem={(item) => (
                          <List.Item>
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
          
          {/* Disclaimer */}
          <Alert
            message="Health Disclaimer"
            description="These recommendations are generated based on environmental data and your profile information. Always consult with healthcare professionals for personalized medical advice."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </>
      ) : (
        // Fall back to markdown parser if no structured data is available
        <>
          <MarkdownParser value={data.recommendations} />
          <Alert
            message="Health Disclaimer"
            description="These recommendations are generated based on environmental data and your profile information. Always consult with healthcare professionals for personalized medical advice."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </>
      )}
    </Card>
  );
};

export default EnhancedRecommendations;
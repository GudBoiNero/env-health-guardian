import React, { useState } from 'react';
import { Form, Input, Button, Divider, Space } from 'antd';
import { EnvironmentOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

interface LocationInputProps {
  form: any; // Form instance
}

const LocationInput: React.FC<LocationInputProps> = ({ form }) => {
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  const toggleCustomLocation = () => {
    setUseCustomLocation(!useCustomLocation);
    
    // Clear location fields when disabling custom location
    if (useCustomLocation) {
      form.setFieldsValue({
        customLocation: {
          city: '',
          state: '',
          country: ''
        }
      });
    }
  };

  return (
    <>
      <Divider orientation="left">
        <Space>
          <EnvironmentOutlined />
          Location
        </Space>
      </Divider>
      
      <Button 
        type={useCustomLocation ? "primary" : "default"}
        onClick={toggleCustomLocation}
        style={{ marginBottom: '16px' }}
        icon={useCustomLocation ? <UpOutlined /> : <DownOutlined />}
      >
        {useCustomLocation ? "Use IP-based location" : "Specify a different location"}
      </Button>
      
      {useCustomLocation && (
        <Form.Item noStyle name="useCustomLocation" initialValue={true}>
          <Input type="hidden" />
        </Form.Item>
      )}
      
      {useCustomLocation && (
        <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '16px' }}>
          <Form.Item
            name={['customLocation', 'city']}
            label="City"
            rules={[{ required: true, message: 'Please enter a city' }]}
          >
            <Input placeholder="Enter city name" />
          </Form.Item>
          
          <Form.Item
            name={['customLocation', 'state']}
            label="State/Province"
          >
            <Input placeholder="Optional" />
          </Form.Item>
          
          <Form.Item
            name={['customLocation', 'country']}
            label="Country"
            rules={[{ required: true, message: 'Please enter a country' }]}
          >
            <Input placeholder="Enter country name" />
          </Form.Item>
        </div>
      )}
    </>
  );
};

export default LocationInput;
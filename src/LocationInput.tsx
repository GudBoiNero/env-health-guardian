import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Space, message } from 'antd';
import { EnvironmentOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

interface LocationInputProps {
  form: any; // Form instance
}

const LocationInput: React.FC<LocationInputProps> = ({ form }) => {
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  // Debug: Log form values when component mounts and when state changes
  useEffect(() => {
    console.log("LocationInput initialized with state:", { useCustomLocation });
    console.log("Current form values:", form.getFieldsValue());
  }, [form, useCustomLocation]);

  const toggleCustomLocation = () => {
    const newState = !useCustomLocation;
    console.log("Toggling custom location from", useCustomLocation, "to", newState);
    setUseCustomLocation(newState);
    
    // Clear location fields when disabling custom location
    if (useCustomLocation) {
      console.log("Clearing custom location fields");
      form.setFieldsValue({
        useCustomLocation: false,
        customLocation: {
          city: '',
          state: '',
          country: ''
        }
      });
    } else {
      // Debug: Ensure useCustomLocation is explicitly set to true
      console.log("Setting useCustomLocation to true in form");
      form.setFieldsValue({
        useCustomLocation: true
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
      
      {/* Debug: Always include the useCustomLocation field, with value based on state */}
      <Form.Item noStyle name="useCustomLocation" initialValue={useCustomLocation}>
        <Input type="hidden" />
      </Form.Item>
      
      {useCustomLocation && (
        <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '16px' }}>
          <Form.Item
            name={['customLocation', 'city']}
            label="City"
            rules={[{ required: true, message: 'Please enter a city' }]}
          >
            <Input 
              placeholder="Enter city name" 
              onChange={(e) => {
                console.log("City input changed:", e.target.value);
              }}
            />
          </Form.Item>
          
          <Form.Item
            name={['customLocation', 'state']}
            label="State/Province"
          >
            <Input 
              placeholder="Optional" 
              onChange={(e) => {
                console.log("State input changed:", e.target.value);
              }}
            />
          </Form.Item>
          
          <Form.Item
            name={['customLocation', 'country']}
            label="Country"
            rules={[{ required: true, message: 'Please enter a country' }]}
          >
            <Input 
              placeholder="Enter country name" 
              onChange={(e) => {
                console.log("Country input changed:", e.target.value);
              }}
            />
          </Form.Item>
          
          {/* Debug: Button to show current form values */}
          <Button 
            type="dashed" 
            onClick={() => {
              const values = form.getFieldsValue();
              console.log("Current form values:", values);
              message.info('Form values logged to console');
            }}
            style={{ marginTop: '8px' }}
          >
            Debug: Log Form Values
          </Button>
        </div>
      )}
    </>
  );
};

export default LocationInput;
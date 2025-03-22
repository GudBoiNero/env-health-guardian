// Modified App.tsx with improved location data flow

import './App.css'
import './backend/index'
import { useState, useEffect } from 'react'
import { 
  analyzeEnvironment, 
  UserProfile 
} from './backend/index'
import { Button, Card, Form, FormProps, Input, Layout, Radio, Spin, Typography, Alert } from 'antd'
import DynamicTextAreaList from './DynamicTextAreaList'
import LocationInput from './LocationInput'
import WeatherDashboard from './WeatherDashboard'
import MarkdownParser from './MarkdownParser'
import AirQualityDashboard from './AIrQualityDashboard'
import PollenDashboard from './PollenDashboard'
import HealthDisclaimerSection from './HealthDisclaimerSection'



function App() {
  const [form] = Form.useForm();
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [weatherData, setWeatherData] = useState<any>();
  const [response, setResponse] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<string | undefined>(undefined);
  const [airQualityData, setAirQualityData] = useState<any>();
  const [pollenData, setPollenData] = useState<any>();
  const [error, setError] = useState<string | null>(null);

  // Use useEffect for initialization instead of direct calls during render
  useEffect(() => {
    // Set initial form values
    form.setFieldsValue({
      age: '',
      gender: '',
      allergies: [''],
      conditions: [''],
      useCustomLocation: false
    });
  }, [form]); // Only run on initial mount and if form changes

// In App.tsx
const onFinish: FormProps<UserProfile>['onFinish'] = (values) => {
  console.log('Form values:', values);
  setError(null); // Clear any previous errors

  // Make sure values has the correct structure
  const formattedValues: UserProfile = {
    age: Number(values.age) || 0,
    gender: values.gender || "unknown",
    allergies: Array.isArray(values.allergies) ? values.allergies.filter(a => a && a.trim() !== "") : [],
    conditions: Array.isArray(values.conditions) ? values.conditions.filter(c => c && c.trim() !== "") : [],
    useCustomLocation: values.useCustomLocation || false,
  };

  // Add custom location if provided
  if (values.useCustomLocation && values.customLocation) {
    formattedValues.customLocation = {
      city: values.customLocation.city?.trim(),
      state: values.customLocation.state?.trim(),
      country: values.customLocation.country?.trim()
    };
  }
  
  setLoading(true);
  setState('Getting weather data...');
  
  // Set the user profile
  setUserProfile(formattedValues);
  
  // Pass the complete user profile with custom location to analyzeEnvironment
  // This ensures all APIs use the same location coordinates consistently
  analyzeEnvironment(formattedValues)
    .then(data => {
      console.log('Response:', data);
      // Set all the state data from the response
      setWeatherData(data.weather);
      setAirQualityData(data.airQuality);
      setPollenData(data.pollen);
      setResponse(data);
      setState(undefined);
      setLoading(false);
    }).catch(error => {
      console.error('Error:', error);
      setError(error.message || "An unexpected error occurred");
      setState(undefined);
      setLoading(false);
    });
};

  const onFinishFailed: FormProps<UserProfile>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      {/* App Header with crimson background */}
      <Layout style={layoutStyle} className="app-header">
        <Typography.Title level={2} style={{ marginTop: 0, color: 'white' }}>Environment Health Guardian</Typography.Title>
        <Typography.Text style={{ color: 'white' }}>
          Monitor and manage your environmental health based on personalized risk assessments
        </Typography.Text>
      </Layout>
      
      <Layout style={layoutStyle}>
        <Card style={contentStyle}>
          <Typography.Title level={4} className="secondary-text">Personal Health Profile</Typography.Title>
          <Typography.Paragraph>
            Please input your health information below to receive a personalized environmental health assessment.
          </Typography.Paragraph>
          
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: '16px' }}
              onClose={() => setError(null)}
            />
          )}
          
          <Form
            form={form}
            name='form'
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            style={contentStyle}
            initialValues={{ age: '', gender: '' }} // Ensure initial values exist
          >
            <Form.Item label='Age' name='age' rules={[{ required: true, message: 'Please enter your age' }]}>
              <Input placeholder='Enter age' type='number' />
            </Form.Item>

            <Form.Item label='Sex' name='gender' rules={[{ required: true, message: 'Please select your gender' }]}>
              <Radio.Group>
                <Radio value='male'>Male</Radio>
                <Radio value='female'>Female</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label='Allergies' name='allergies'>
              <DynamicTextAreaList value={userProfile?.allergies} />
            </Form.Item>

            <Form.Item label='Conditions' name='conditions'>
              <DynamicTextAreaList value={userProfile?.conditions} />
            </Form.Item>
            
            {/* Location Input Component */}
            <LocationInput form={form} />

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading}>Generate Assessment</Button>
            </Form.Item>
          </Form>
        </Card>
      </Layout>

      {
        weatherData
          ?
          <Layout style={layoutStyle}>
            <WeatherDashboard data={weatherData} />
          </Layout>
          :
          <>
          </>
      }
      {
        airQualityData
          ?
          <Layout style={layoutStyle}>
            <AirQualityDashboard data={airQualityData} />
          </Layout>
          :
        <></>
      }
      {
        pollenData
          ?
          <Layout style={layoutStyle}>
            <PollenDashboard data={pollenData} />
          </Layout>
          :
        <></>
      }

      {state == undefined
        ? <>
          {response == undefined
            ? <></>
            :
            <Layout style={layoutStyle}>
              <Card style={contentStyle}>
                <MarkdownParser value={response?.recommendations} />
              </Card>
            </Layout>
          }
        </>
        : <>
          <Layout style={layoutStyle}>
            <Card style={contentStyle}>
              <Spin tip={state}>
                <div style={{ minHeight: '50px' }}></div> {/* This is just to ensure the spinner takes up space while loading */}
              </Spin>
            </Card>
          </Layout>
        </>}
        
      {/* Health Disclaimer */}
      <Layout style={layoutStyle}>
        <HealthDisclaimerSection />
      </Layout>
    </>
  )
}

const layoutStyle: React.CSSProperties = {
  borderRadius: 20,
  overflow: 'hidden',
  width: 'min(100%, 50em)',
  margin: 'auto',
  marginTop: '2em',
  marginBottom: '2em'
};

const contentStyle: React.CSSProperties = {
  width: '100%'
}

export default App;
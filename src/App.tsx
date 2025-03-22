// Modified sections of App.tsx to include pollen data

import './App.css'
import './backend/index'

import { useState } from 'react'
import { 
  analyzeEnvironment, 
  fetchWeatherData, 
  fetchAirQualityData,
  fetchPollenData,  // Add this import
  UserProfile 
} from './backend/index'
import { Button, Card, Form, FormProps, Input, Layout, Radio, Spin, Typography } from 'antd'
import DynamicTextAreaList from './DynamicTextAreaList'
import WeatherDashboard from './WeatherDashboard'
import Title from 'antd/es/typography/Title'
import MarkdownParser from './MarkdownParser'
import AirQualityDashboard from './AIrQualityDashboard'
import PollenDashboard from './PollenDashboard'  // Add this import


function App() {
  const [form] = Form.useForm();
form.setFieldsValue({
  age: '',
  gender: '',
  allergies: [''],  // Initialize as array with empty string
  conditions: ['']  // Initialize as array with empty string
});
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [weatherData, setWeatherData] = useState<any>();
  const [response, setResponse] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<string | undefined>(undefined);
  const [airQualityData, setAirQualityData] = useState<any>();
  const [pollenData, setPollenData] = useState<any>();  // Add this state variable


// In App.tsx
const onFinish: FormProps<UserProfile>['onFinish'] = (values) => {
  console.log('Success:', values);

  // Make sure values has the correct structure
  const formattedValues: UserProfile = {
    age: Number(values.age) || 0,
    gender: values.gender || "unknown",
    allergies: Array.isArray(values.allergies) ? values.allergies.filter(a => a && a.trim() !== "") : [],
    conditions: Array.isArray(values.conditions) ? values.conditions.filter(c => c && c.trim() !== "") : []
  };
  
  setLoading(true);
  setState('Getting weather data...');
  
  // Set the user profile
  setUserProfile(formattedValues);
  
  // Instead of relying on the state update, pass formattedValues directly
  fetchWeatherData().then(data => {
    console.log('Weather data:', data);
    setState('Getting air quality data...');
    setWeatherData(data);
    return data.location;
  }).then(location => {
    return fetchAirQualityData(location.lat, location.lon).then(airQualityData => {
      console.log('Air quality data:', airQualityData);
      setState('Getting pollen data...');
      setAirQualityData(airQualityData);
      return location;
    });
  })
  .then(location => {
    return fetchPollenData(location.lat, location.lon, 1).then(pollenData => {
      console.log('Pollen data:', pollenData);
      setState('Generating response...');
      setPollenData(pollenData);
      
      // Use the formattedValues directly instead of userProfile!
      return formattedValues;
    });
  })
  .then(profile => {
    // Pass the profile directly instead of relying on userProfile state
    return analyzeEnvironment(profile);
  })
  .then(data => {
    console.log('Response:', data);
    setState(undefined);
    setResponse(data);
    setLoading(false);
  }).catch(error => {
    console.error('Error:', error);
    setState('Error: ' + error.message);
    setLoading(false);
  });
};

  const onFinishFailed: FormProps<UserProfile>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <Layout style={layoutStyle}>
        <Card style={contentStyle}>
          <Title level={2} style={{ marginTop: 0 }}>Environment Health Guardian</Title>
          <Typography>Welcome! Please input health-risk assessment data below! Don't worry, your data is safe.</Typography>
        </Card>
      </Layout>
      <Layout style={layoutStyle}>
        <Card style={contentStyle}>
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

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading}>Submit</Button>
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
                <Typography.Title level={3}>Recommendations</Typography.Title>
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
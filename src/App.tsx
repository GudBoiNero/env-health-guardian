import './App.css'
import './backend/index'

import { useState } from 'react'
import { 
  analyzeEnvironment, 
  fetchWeatherData, 
  fetchAirQualityData, 
  UserProfile 
} from './backend/index'
import { Button, Card, Form, FormProps, Input, Layout, Radio, Spin, Typography } from 'antd'
import DynamicTextAreaList from './DynamicTextAreaList'
import WeatherDashboard from './WeatherDashboard'
import Title from 'antd/es/typography/Title'
import MarkdownParser from './MarkdownParser'
import AirQualityDashboard from './AIrQualityDashboard';



function App() {
  const [form] = Form.useForm(); // Use Ant Design's form instance
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [weatherData, setWeatherData] = useState<any>();
  const [response, setResponse] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<string | undefined>(undefined);
  const [airQualityData, setAirQualityData] = useState<any>();


  const onFinish: FormProps<UserProfile>['onFinish'] = (values) => {
    console.log('Success:', values);
  
    setLoading(true)
    setState('Getting weather data...')
    setUserProfile(values);
    fetchWeatherData().then(data => {
      console.log('Weather data:', data)
  
      setState('Getting air quality data...')
      setWeatherData(data)
      
      // Return the location for the next promise
      return data.location;
    }).then(location => {
      // Use the location to fetch air quality data
      return fetchAirQualityData(location.lat, location.lon);
    })// In your App.tsx
    .then(airQualityData => {
      console.log('Air quality data:', airQualityData)
      
      setState('Generating response...')
      setAirQualityData(airQualityData)
      
      // Check for required properties to show more informative errors
      if (!airQualityData) {
        console.error("Missing air quality data");
      } else if (!airQualityData.indexes) {
        console.error("Air quality data missing 'indexes' property");
      } else if (!airQualityData.pollutants) {
        console.error("Air quality data missing 'pollutants' property");
      }
      
      // Analyze environment with both weather and air quality data
      return analyzeEnvironment(values!);
    }).then(data => {
      console.log('Response:', data)
  
      setState(undefined)
      setResponse(data)
      setLoading(false)
    }).catch(error => {
      console.error('Error:', error)
      setState('Error: ' + error.message)
      setLoading(false)
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

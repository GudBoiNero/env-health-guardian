import './App.css'
import './backend/index'

import { useState } from 'react'
import { analyzeEnvironment, fetchWeatherData, UserProfile } from './backend/index'
import { Button, Card, Form, FormProps, Input, Layout, Radio } from 'antd'
import DynamicTextAreaList from './DynamicTextAreaList'
import Item from 'antd/es/list/Item'

function App() {
  const [form] = Form.useForm(); // Use Ant Design's form instance
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [weatherData, setWeatherData] = useState<any>();
  const [response, setResponse] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<string | undefined>(undefined);

  const onFinish: FormProps<UserProfile>['onFinish'] = (values) => {
    console.log('Success:', values);

    setLoading(true)
    setState('Getting weather data...')
    setUserProfile(values); // Store submitted values
    fetchWeatherData().then(data => {
      console.log('Weather data:', data)

      setState('Generating response...')
      setWeatherData(data)
    }).finally(() => {
      analyzeEnvironment(values!).then(data => {
        console.log('Response:', data)

        setState(undefined)
        setResponse(data)
        setLoading(false)
      })
    })
  };

  const onFinishFailed: FormProps<UserProfile>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
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

      <Layout style={layoutStyle}>
        <Input.TextArea
          value={(
            state != undefined ? state : response?.recommendations
          )}
          contentEditable={false}
          autoSize={{ minRows: 10 }}
        />
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

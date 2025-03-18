import { useEffect, useState } from 'react'
import './App.css'
import './backend/index'
import { fetchWeatherData, UserProfile } from './backend/index'
import { Card, Form, Input, Layout, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'

type _FormData = {
  age: number,
  gender: boolean,
  location?: {
    lat: number,
    lon: number
  }
}

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [formData, setFormData] = useState<_FormData>();

  return (
    <>
      <Layout style={layoutStyle}>
        <Card style={contentStyle}>
          <Form>
            <Typography>Age:</Typography>
            <Input placeholder='Enter age' type='number' />
          </Form>
        </Card>
      </Layout>
    </>
  )
}

const layoutStyle: React.CSSProperties = {
  borderRadius: 8,
  overflow: 'hidden',
  padding: '2em',
  width: 'min(100%, 50em)',
  margin: 'auto',
  backgroundColor: '#fff'
};

const contentStyle: React.CSSProperties = {
}

export default App

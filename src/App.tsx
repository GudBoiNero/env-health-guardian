import { useEffect, useState } from 'react'
import './App.css'
import './backend/index'
import { fetchWeatherData } from './backend/index'

function App() {
  const [weatherData, setWeatherData] = useState<any>();

  useEffect(() => {
    fetchWeatherData().then(data => {
      setWeatherData(data)
    })
  }, [])

  return (
    <>
    </>
  )
}

export default App

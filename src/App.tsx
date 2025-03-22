// Modified App.tsx with multi-page layout (without ApiDebugOverlay)
import './App.css'
import './backend/index'
import { useState, useEffect } from 'react'
import { 
  analyzeEnvironment, 
  UserProfile 
} from './backend/index'
import { 
  Button, 
  Card, 
  Form, 
  FormProps, 
  Input, 
  Layout, 
  Radio, 
  Spin, 
  Typography, 
  Alert, 
  Steps,
  Tabs,
  Space
} from 'antd'
import { 
  FormOutlined, 
  FileTextOutlined, 
  DashboardOutlined
} from '@ant-design/icons'
import DynamicTextAreaList from './DynamicTextAreaList'
import LocationInput from './LocationInput'
import WeatherDashboard from './WeatherDashboard'
import MarkdownParser from './MarkdownParser'
import AirQualityDashboard from './AIrQualityDashboard'
import PollenDashboard from './PollenDashboard'
// import HealthDisclaimerSection from './HealthDisclaimerSection'

const { TabPane } = Tabs;

// Page enum to control which page is shown
enum Page {
  FORM = 0,
  RECOMMENDATIONS = 1,
  DETAILS = 2
}

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
  const [currentPage, setCurrentPage] = useState<Page>(Page.FORM);

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

  // Check if assessment is ready (all required data is available)
  const isAssessmentReady = () => {
    return weatherData && airQualityData && pollenData && response?.recommendations;
  };

  // Navigate to a specific page
  const navigateToPage = (page: Page) => {
    // Only allow navigation to results pages if assessment is ready
    if ((page === Page.RECOMMENDATIONS || page === Page.DETAILS) && !isAssessmentReady()) {
      setError("Please complete the form and generate an assessment first");
      return;
    }
    
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Process form submission
  const onFinish: FormProps<UserProfile>['onFinish'] = (values) => {
    setError(null); // Clear any previous errors

    // Make sure values has the correct structure
    const formattedValues: UserProfile = {
      age: Number(values.age) || 0,
      gender: values.gender || "unknown",
      allergies: Array.isArray(values.allergies) ? values.allergies.filter(a => a && a.trim() !== "") : [],
      conditions: Array.isArray(values.conditions) ? values.conditions.filter(c => c && c.trim() !== "") : [],
      useCustomLocation: Boolean(values.useCustomLocation), // Ensure this is a boolean
    };

    // Add custom location if provided
    if (values.useCustomLocation && values.customLocation) {
      formattedValues.customLocation = {
        city: values.customLocation.city?.trim(),
        state: values.customLocation.state?.trim(),
        country: values.customLocation.country?.trim()
      };
      
      // Validate that required fields are present
      if (!formattedValues.customLocation.city) {
        setError("City is required for custom location");
        return;
      }
      if (!formattedValues.customLocation.country) {
        setError("Country is required for custom location");
        return;
      }
    } else if (values.useCustomLocation) {
      // useCustomLocation is true but customLocation is missing
      setError("Location data is incomplete. Please provide city and country.");
      return;
    }
    
    setLoading(true);
    setState('Getting weather data...');
    
    // Set the user profile
    setUserProfile(formattedValues);
    
    // Pass the complete user profile with custom location to analyzeEnvironment
    // This ensures all APIs use the same location coordinates consistently
    analyzeEnvironment(formattedValues)
      .then(data => {
        // Set all the state data from the response
        setWeatherData(data.weather);
        setAirQualityData(data.airQuality);
        setPollenData(data.pollen);
        setResponse(data);
        setState(undefined);
        setLoading(false);
        
        // Navigate to recommendations page automatically
        setCurrentPage(Page.RECOMMENDATIONS);
      }).catch(error => {
        console.error('Error:', error);
        
        // Create a more user-friendly error message based on the error content
        let userMessage = "An unexpected error occurred";
        
        if (error.message) {
          // Handle specific error messages with user-friendly translations
          if (error.message.includes("Location not found")) {
            userMessage = "The location you entered couldn't be found. Please check the spelling and try again.";
          } else if (error.message.includes("weather data")) {
            userMessage = "There was a problem fetching weather data for this location.";
          } else if (error.message.includes("air quality data")) {
            userMessage = "There was a problem fetching air quality data for this location.";
          } else if (error.message.includes("pollen data")) {
            userMessage = "There was a problem fetching pollen data for this location.";
          } else if (error.message.includes("Missing API key")) {
            userMessage = "The application is missing required API credentials. Please contact support.";
          } else if (error.message.includes("Network Error")) {
            userMessage = "A network error occurred. Please check your internet connection and try again.";
          }
        }
        
        setError(userMessage);
        setState(undefined);
        setLoading(false);
      });
  };

  const onFinishFailed: FormProps<UserProfile>['onFinishFailed'] = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    setError(`Form validation failed: ${errorInfo.errorFields.map(f => f.name.join('.')).join(', ')}`);
  };

 // Updated Steps navigation bar with crimson highlight and proper centering
// Updated Steps navigation with custom icons
const renderSteps = () => {
  return (
    <Steps
      current={currentPage}
      onChange={(value) => navigateToPage(value as Page)}
      items={[
        {
          title: 'Input',
          description: 'Your health profile',
          icon: <FormOutlined style={{ color: currentPage === Page.FORM ? '#93032E' : '#D9D9D9' }} />,
          disabled: loading
        },
        {
          title: 'Recommendations',
          description: 'Health assessment',
          icon: <FileTextOutlined style={{ color: currentPage === Page.RECOMMENDATIONS ? '#93032E' : '#D9D9D9' }} />,
          disabled: !isAssessmentReady() || loading
        },
        {
          title: 'Details',
          description: 'Environmental data',
          icon: <DashboardOutlined style={{ color: currentPage === Page.DETAILS ? '#93032E' : '#D9D9D9' }} />,
          disabled: !isAssessmentReady() || loading
        },
      ]}
      style={{
        margin: '0 auto',
        maxWidth: '90%'
      }}
    />
  );
};

  // Render page navigation controls
  // const renderPageControls = () => {
  //   return (
  //     <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
  //       {currentPage > 0 ? (
  //         <Button 
  //           type="default" 
  //           icon={<ArrowLeftOutlined />}
  //           onClick={() => navigateToPage(currentPage - 1 as Page)}
  //           disabled={loading}
  //         >
  //           Previous
  //         </Button>
  //       ) : (
  //         <div></div> // Empty div to maintain flex layout
  //       )}
        
  //       {currentPage < Page.DETAILS ? (
  //         <Button 
  //           type="primary" 
  //           onClick={() => navigateToPage(currentPage + 1 as Page)}
  //           disabled={!isAssessmentReady() || loading}
  //           icon={<ArrowRightOutlined />}
  //         >
  //           Next
  //         </Button>
  //       ) : (
  //         <div></div> // Empty div to maintain flex layout
  //       )}
  //     </div>
  //   );
  // };

  // Render the current page based on the currentPage state
  const renderCurrentPage = () => {
    switch(currentPage) {
      case Page.FORM:
        return renderFormPage();
      case Page.RECOMMENDATIONS:
        return renderRecommendationsPage();
      case Page.DETAILS:
        return renderDetailsPage();
      default:
        return renderFormPage();
    }
  };

  // Page 1: Form for user information
  const renderFormPage = () => {
    return (
      <>
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
            initialValues={{ age: '', gender: '' }}
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
              <DynamicTextAreaList value={userProfile?.allergies} fieldType="allergy" />
            </Form.Item>

            <Form.Item label='Medical Conditions' name='conditions'>
              <DynamicTextAreaList value={userProfile?.conditions} fieldType="condition" />
            </Form.Item>
            
            {/* Location Input Component */}
            <LocationInput form={form} />

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading}>Generate Assessment</Button>
            </Form.Item>
          </Form>
        </Card>
        
        {/* Loading state */}
        {loading && (
          <Card style={{...contentStyle, marginTop: '16px'}}>
            <Spin tip={state}>
              <div style={{ minHeight: '50px' }}></div>
            </Spin>
          </Card>
        )}
      </>
    );
  };

  // Page 2: Recommendations
  const renderRecommendationsPage = () => {
    if (!isAssessmentReady()) {
      return (
        <Card style={contentStyle}>
          <Alert
            message="Assessment Not Available"
            description="Please complete the form to generate your personalized health assessment."
            type="info"
            showIcon
          />
        </Card>
      );
    }

    const location = weatherData?.location;
    const locationName = location ? `${location.name}, ${location.region}, ${location.country}` : 'your location';

    return (
      <Card style={contentStyle}>
        <Typography.Title level={3}>Health Recommendations</Typography.Title>
        <Typography.Paragraph type="secondary">
          Based on current environmental conditions in {locationName}
        </Typography.Paragraph>
        
        <div style={{ marginTop: '16px' }}>
          <MarkdownParser value={response?.recommendations} />
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button 
            type="primary" 
            onClick={() => navigateToPage(Page.DETAILS)}
            icon={<DashboardOutlined />}
          >
            View Detailed Environmental Data
          </Button>
        </div>
      </Card>
    );
  };

  // Page 3: Detailed environmental data
  const renderDetailsPage = () => {
    if (!isAssessmentReady()) {
      return (
        <Card style={contentStyle}>
          <Alert
            message="Data Not Available"
            description="Please complete the form to view detailed environmental data."
            type="info"
            showIcon
          />
        </Card>
      );
    }

    return (
      <Card style={contentStyle}>
        <Typography.Title level={3}>Environmental Data</Typography.Title>
        <Typography.Paragraph type="secondary">
          Detailed weather, air quality, and pollen information
        </Typography.Paragraph>
        
        <Tabs defaultActiveKey="weather" style={{ marginTop: '16px' }}>
          <TabPane tab="Weather" key="weather">
            <WeatherDashboard data={weatherData} />
          </TabPane>
          <TabPane tab="Air Quality" key="airQuality">
            <AirQualityDashboard data={airQualityData} />
          </TabPane>
          <TabPane tab="Pollen" key="pollen">
            <PollenDashboard data={pollenData} />
          </TabPane>
        </Tabs>
        
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Space>
            <Button 
              onClick={() => navigateToPage(Page.RECOMMENDATIONS)}
              icon={<FileTextOutlined />}
            >
              Back to Recommendations
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigateToPage(Page.FORM)}
              icon={<FormOutlined />}
            >
              New Assessment
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* App Header with crimson background */}
      <Layout style={layoutStyle} className="app-header">
        <Typography.Title level={2} style={{ marginTop: 0, color: 'white' }}>EnviSafe</Typography.Title>
        <Typography.Text style={{ color: 'white' }}>
          Monitor and manage your environmental health based on personalized risk assessments
        </Typography.Text>
      </Layout>
      
      {/* Navigation Steps */}
      <Layout style={{
  ...layoutStyle, 
  marginBottom: '1em',
  padding: '0',
  display: 'flex',
  justifyContent: 'center'
}}>
  {renderSteps()}
</Layout>
      
      {/* Main Content */}
      <Layout style={layoutStyle}>
        {renderCurrentPage()}
      </Layout>
      
      {/* Page Navigation */}
      {/* <Layout style={{...layoutStyle, marginTop: '0.5em', marginBottom: '1em'}}>
        {renderPageControls()}
      </Layout> */}
      
      {/* Health Disclaimer */}
      {/* <Layout style={{
        ...layoutStyle,
        marginTop: '1rem',
        marginBottom: '2rem'
      }}>
        <HealthDisclaimerSection />
      </Layout> */}
    </>
  );
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
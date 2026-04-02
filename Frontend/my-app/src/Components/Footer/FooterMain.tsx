import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from '../../Assets/images/whitelogoghc.png';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the interface for the version info response
interface VersionInfo {
  version: string;
  release_date: string;
  key_updates: string;
  data_up_to_date: string; // Added field for "Data as of"
}

const FooterMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '',
    release_date: '',
    key_updates: '',
    data_up_to_date: '', // Initialize this new field
  });

  const [isKeyUpdatesVisible, setIsKeyUpdatesVisible] = useState(false); // State to track visibility of key updates

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await axios.get<VersionInfo>(`${apiUrl}/api/latest_version/`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        setVersionInfo({
          version: data.version || '',
          release_date: data.release_date || '',
          key_updates: data.key_updates || '',
          data_up_to_date: data.data_up_to_date || '', 
        });
      } catch (error) {
        console.error("Error fetching version info:", error);
        // navigate("/error");  
      }
    };

    fetchVersionInfo();
  }, [navigate]);

  const handleFewshotNavigation = () => {
    navigate('/fewshot_analysis_upload');
  };

  // Function to format the date to "Month Day, Year" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options); 
  };

  return (
    <Box
      sx={{
        backgroundColor: '#2a2e39', // Darker background color
        padding: isMobile ? '10px 0' : '20px 0',
        color: '#FFFFFF',
        textAlign: 'center',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          top: '-30px',
          width: '100%',
        }}
      >
      </Box>
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{
          fontWeight: 'bold',
          color: '#FFFFFF',
        }}
      >
        Monashee Insights & Data Application System
        <Box
          component="span"
          onClick={() => navigate('/sentiment_analysis')}
          sx={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#2a2e39',
            ml: 1,
            cursor: 'pointer',
            verticalAlign: 'middle',
            opacity: 0.6,
            '&:hover': { opacity: 1 },
          }}
        />
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
          }}
        >
          © {currentYear}{' '}
          <Box
            component="span"
            onClick={handleFewshotNavigation}
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            MIDAS
          </Box>
          , Developed in Collaboration with Golden Hills Capital India Pvt Ltd.
        </Typography>
        <img
          src={logo}
          alt="GHC Logo"
          style={{
            width: '130px',
            height: '50px',
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 ,alignContent:'center', justifyContent: 'center', marginTop: '5px',marginBottom: '5px' }}>
  {versionInfo.version && (
    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
      {`Version ${versionInfo.version} - Updated ${formatDate(versionInfo.release_date)}`}
    </Typography>
  )}
  {versionInfo.data_up_to_date && (
    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
      {`Data as of ${formatDate(versionInfo.data_up_to_date)}`}
    </Typography>
  )}
</Box>



      {/* Conditionally render Key Updates with clickable text */}
      {versionInfo.key_updates && (
        <>
          {!isKeyUpdatesVisible ? (
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                color: '#7bcf60', // Color for the clickable text
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onClick={() => setIsKeyUpdatesVisible(true)} // Show the key updates on click
            >
              Click here for Key Updates
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {`Key Updates: ${versionInfo.key_updates}`}
            </Typography>
          )}
        </>
      )}

     
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}
      >
      </Box>
    </Box>
  );
};

export default FooterMain;

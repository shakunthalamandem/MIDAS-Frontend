// import React from 'react';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import { useTheme } from '@mui/material/styles';
// import logo from '../../Assets/images/whitelogoghc.png';

// const FooterMain: React.FC = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const currentYear = new Date().getFullYear();

//   return (
//     <Box
//       sx={{
//         backgroundColor: '#2a2e39', // Darker background color
//         padding: isMobile ? '10px 0' : '20px 0',
//         color: '#FFFFFF',
//         textAlign: 'center',
//         boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
//       }}
//     >
//       <Typography
//         variant={isMobile ? 'body1' : 'h6'}
//         sx={{
//           fontWeight: 'bold',
//           color: '#FFFFFF',
//         }}
//       >
//         Monashee Insights & Data Application System
//       </Typography>
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: '10px',
//         }}
//       >
//         <Typography
//           variant="body2"
//           sx={{
//             color: '#FFFFFF',
//           }}
//         >
//           © {currentYear} MIDAS, Developed in Collaboration with Golden Hills Capital India Pvt Ltd.
//         </Typography>
//         <img
//           src={logo}
//           alt="GHC Logo"
//           style={{
//             width: '130px',
//             height: '50px',
//           }}
//         />
//       </Box>
//       <Typography
//           variant="body2"
//           sx={{
//             color: '#FFFFFF',
//           }}
//         >
// Version 1.0       </Typography>
//     </Box>
//   );
// };

// export default FooterMain;


import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from '../../Assets/images/whitelogoghc.png';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const FooterMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

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
        <ArrowUpwardIcon sx={{ color: '#FFFFFF', cursor: 'pointer' }} />
      </Box>
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{
          fontWeight: 'bold',
          color: '#FFFFFF',
        }}
      >
        Monashee Insights & Data Application System
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
          © {currentYear} MIDAS, Developed in Collaboration with Golden Hills Capital India Pvt Ltd.
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
        }}
      >
        <Box sx={{ textAlign: 'left', color: '#FFFFFF' ,justifyContent: 'flex-end', flexGrow: 1}}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Version 1.0
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            Last updated on 06/02/2025
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FooterMain;




import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActionArea, Alert, Collapse, IconButton, AlertTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import WaterIcon from '@mui/icons-material/Water';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HeightIcon from '@mui/icons-material/Height';
import TimerIcon from '@mui/icons-material/Timer';
import CropIcon from '@mui/icons-material/Crop';
import PowerIcon from '@mui/icons-material/Power';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OpacityIcon from '@mui/icons-material/Opacity';
import StraightenIcon from '@mui/icons-material/Straighten';
import SpeedIcon from '@mui/icons-material/Speed';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import AdjustIcon from '@mui/icons-material/Adjust';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import DescriptionIcon from '@mui/icons-material/Description';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const MainCalculatorsPage = () => {
  const [aboutOpen, setAboutOpen] = useState(false);

  // Section A - Irrigation Planning (Crop Demand Tools)
  // Order: How much? → How fast? → How long? → How often?
  const sectionA = [
    {
      title: 'Water Depth (Required Water)',
      description: 'Calculate the depth of water required for irrigation based on crop needs and soil conditions.',
      icon: <VerticalAlignCenterIcon sx={{ fontSize: 40 }} />,
      path: '/water-depth',
      color: '#1976d2',
      iconBg: '#e3f2fd',
      startHere: true
    },
    {
      title: 'Water Application Rate',
      description: 'Calculate the rate at which water is applied to a given area by your irrigation system.',
      icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
      path: '/water-application-rate',
      color: '#388e3c',
      iconBg: '#e8f5e9'
    },
    {
      title: 'Irrigation Run Time',
      description: 'Calculate the time needed for the irrigation system to run to apply the required water depth.',
      icon: <TimerIcon sx={{ fontSize: 40 }} />,
      path: '/irrigation-run-time',
      color: '#f57c00',
      iconBg: '#fff3e0'
    },
    {
      title: 'Irrigation Frequency',
      description: 'Determine how often irrigation should occur based on crop water use and soil characteristics.',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      path: '/irrigation-frequency',
      color: '#0288d1',
      iconBg: '#e1f5fe'
    }
  ];

  // Section B - System Capacity & Pumping Tools
  const sectionB = [
    {
      title: 'Irrigatable Area',
      description: 'Calculate the land area that can be irrigated with a given water supply and application rate.',
      icon: <CropSquareIcon sx={{ fontSize: 40 }} />,
      path: '/irrigatable-area',
      color: '#f9a825',
      iconBg: '#fff8e1'
    },
    {
      title: 'System Pumping Requirements',
      description: 'Calculate the total flow rate required to operate your irrigation system.',
      icon: <OpacityIcon sx={{ fontSize: 40 }} />,
      path: '/system-pumping-requirements',
      color: '#00796b',
      iconBg: '#e0f2f1'
    },
    {
      title: 'Required Water Pump Horsepower',
      description: 'Estimate brake horsepower and total power requirements for irrigation pumps.',
      icon: <PowerIcon sx={{ fontSize: 40 }} />,
      path: '/required-water-pump-horsepower',
      color: '#c2185b',
      iconBg: '#fce4ec'
    }
  ];

  // Section C - Hydraulic / Engineering Tools
  const sectionC = [
    {
      title: 'Irrigation Times',
      description: 'Determine set time required for given water application and flow rate.',
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      path: '/irrigation-times',
      color: '#7b1fa2',
      iconBg: '#f3e5f5'
    },
    {
      title: 'Pipe Water Velocity',
      description: 'Calculate water velocity inside a pipe using flow rate and diameter.',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      path: '/pipe-water-velocity',
      color: '#00897b',
      iconBg: '#e0f2f1'
    },
    {
      title: 'Pipe Friction Loss',
      description: 'Calculate pressure loss due to pipe friction using the Hazen-Williams equation.',
      icon: <DragHandleIcon sx={{ fontSize: 40 }} />,
      path: '/pipe-friction-loss',
      color: '#1976d2',
      iconBg: '#e3f2fd'
    },
    {
      title: 'Minimum Required Pipe Size',
      description: 'Calculate the minimum pipe diameter for a given flow, length, material, and pressure loss.',
      icon: <StraightenIcon sx={{ fontSize: 40 }} />,
      path: '/minimum-required-pipe-size',
      color: '#388e3c',
      iconBg: '#e8f5e9'
    },
    {
      title: 'Drip Line Application Rate',
      description: 'Calculate the application rate of a drip line irrigation system.',
      icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
      path: '/drip-line-application-rate',
      color: '#0288d1',
      iconBg: '#e1f5fe'
    },
    {
      title: 'Nozzle Application Rate',
      description: 'Calculate the effective application rate of a sprinkler nozzle system.',
      icon: <WaterfallChartIcon sx={{ fontSize: 40 }} />,
      path: '/nozzle-application-rate',
      color: '#f57c00',
      iconBg: '#fff3e0'
    },
    {
      title: 'Nozzle Flow Rate / Diameter',
      description: 'Calculate nozzle flow rate or required diameter for a given pressure.',
      icon: <CenterFocusStrongIcon sx={{ fontSize: 40 }} />,
      path: '/nozzle-flow-rate-diameter',
      color: '#7b1fa2',
      iconBg: '#f3e5f5'
    },
    {
      title: 'Garden Hose Flow Rate & Time',
      description: 'Calculate garden hose flow rate or time to fill a container.',
      icon: <WaterIcon sx={{ fontSize: 40 }} />,
      path: '/garden-hose-flow-rate-time',
      color: '#388e3c',
      iconBg: '#e8f5e9'
    }
  ];

  // Section D - Information & Conversion Tools
  const sectionD = [
    {
      title: 'Irrigation Units Description',
      description: 'Learn about different irrigation units and their definitions.',
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      path: '/irrigation-units-description',
      color: '#5c6bc0',
      iconBg: '#e8eaf6'
    },
    {
      title: 'Irrigation Unit Conversions',
      description: 'Convert between different irrigation units and measurement systems.',
      icon: <SwapHorizIcon sx={{ fontSize: 40 }} />,
      path: '/irrigation-unit-conversions',
      color: '#7e57c2',
      iconBg: '#ede7f6'
    }
  ];

  const renderSection = (section, title, description) => (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8cb43a', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
          {description}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {section.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.title} sx={{ display: 'flex' }}>
            <Box sx={{ position: 'relative', overflow: 'visible', width: '100%', display: 'flex' }}>
              <Card
                sx={{
                  height: '100%',
                  minHeight: 200,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  overflow: 'visible',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  border: tool.startHere ? '2px solid #ff9800' : '2px solid transparent',
                  background: tool.startHere 
                    ? 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)' 
                    : 'white',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: tool.startHere ? '#ff9800' : '#8bb439'
                  },
                  '&::before': tool.startHere ? {
                    content: '"⭐ START HERE"',
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: '#ff9800',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  } : {}
                }}
              >
              <CardActionArea
                component={Link}
                to={tool.path}
                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      backgroundColor: tool.iconBg,
                      color: tool.color
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
                    {tool.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                    {tool.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
          Irrigation Calculators
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 0 }}>
          Select an irrigation calculator to get started. Click any tool below to open the calculator.
        </Typography>
      </Paper>

      {/* About Banner */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mb: 3,
          backgroundColor: '#e8f5e9',
          borderLeft: '4px solid #8bb439',
          borderRadius: '0.5rem',
          color: '#333',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#d4edda'
          },
          '& .MuiAlert-icon': {
            color: '#8bb439'
          }
        }}
        onClick={() => setAboutOpen(!aboutOpen)}
        action={
          <IconButton
            aria-label="expand"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAboutOpen(!aboutOpen);
            }}
          >
            {aboutOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: 600 }}>About This Irrigation Tool</AlertTitle>
        <Collapse in={aboutOpen}>
          <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            This tool provides comprehensive irrigation calculators organized into four main sections:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 1.5, mt: 0 }}>
            <Typography component="li" variant="body1" sx={{ mb: 0.5, lineHeight: 1.6 }}>
              <strong>Section A - Irrigation Planning (Crop Demand Tools):</strong> Help answer the 3 core scheduling questions: How much? → How fast? → How long? → How often?
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0.5, lineHeight: 1.6 }}>
              <strong>Section B - System Capacity & Pumping Tools:</strong> Help understand if your pump and water supply can handle the demand.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 0.5, lineHeight: 1.6 }}>
              <strong>Section C - Hydraulic/Engineering Tools:</strong> Detailed hydraulic calculations for pipes, emitters, sprinklers, and flow behavior. Used by agronomists, designers, and advanced farmers.
            </Typography>
            <Typography component="li" variant="body1" sx={{ mb: 1.5, lineHeight: 1.6 }}>
              <strong>Section D - Information & Conversion Tools:</strong> Reference materials and unit conversion tools for irrigation measurements.
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            Start with <strong>Water Depth (Required Water)</strong> to establish your baseline irrigation requirements.
          </Typography>
        </Collapse>
      </Alert>

      {/* Section A - Irrigation Planning */}
      {renderSection(
        sectionA,
        '🔵 SECTION A — Irrigation Planning (Crop Demand Tools)',
        'Help the farmer answer the 3 core scheduling questions: How much? → How fast? → How long? → How often?'
      )}

      {/* Section B - System Capacity & Pumping */}
      {renderSection(
        sectionB,
        '🔵 SECTION B — System Capacity & Pumping Tools',
        'Help the farmer understand if their pump and water supply can handle the demand.'
      )}

      {/* Section C - Hydraulic / Engineering */}
      {renderSection(
        sectionC,
        '🔵 SECTION C — Hydraulic / Engineering Tools',
        'Detailed hydraulic calculations for pipes, emitters, sprinklers, and flow behavior. Used by agronomists, designers, and advanced farmers.'
      )}

      {/* Section D - Information & Conversion Tools */}
      {renderSection(
        sectionD,
        '🔵 SECTION D — Information & Conversion Tools',
        'Reference materials and unit conversion tools for irrigation measurements.'
      )}
    </Box>
  );
};

export default MainCalculatorsPage; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Box, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton, Fab } from '@mui/material';
import { styled } from '@mui/material/styles';
import MainCalculatorsPage from './MainCalculatorsPage.jsx';
import WaterApplicationRateCalculator from './WaterApplicationRateCalculator.jsx';
import IrrigationFrequencyCalculator from './IrrigationFrequencyCalculator.jsx';
import WaterDepthCalculator from './WaterDepthCalculator.jsx';
import IrrigationRunTimeCalculator from './IrrigationRunTimeCalculator.jsx';
import IrrigatableAreaCalculator from './IrrigatableAreaCalculator.jsx';
import RequiredWaterPumpHorsepowerCalculator from './RequiredWaterPumpHorsepowerCalculator.jsx';
import IrrigationTimesCalculator from './IrrigationTimesCalculator.jsx';
import IrrigationUnitConversions from './IrrigationUnitConversions.jsx';
import IrrigationUnitsDescription from './IrrigationUnitsDescription.jsx';
import SystemPumpingRequirementsCalculator from './SystemPumpingRequirementsCalculator.jsx';
import PipeFrictionLossCalculator from './PipeFrictionLossCalculator.jsx';
import PipeWaterVelocityCalculator from './PipeWaterVelocityCalculator.jsx';
import MinimumRequiredPipeSizeCalculator from './MinimumRequiredPipeSizeCalculator.jsx';
import DripLineApplicationRateCalculator from './DripLineApplicationRateCalculator.jsx';
import NozzleApplicationRateCalculator from './NozzleApplicationRateCalculator.jsx';
import NozzleFlowRateDiameterCalculator from './NozzleFlowRateDiameterCalculator.jsx';
import GardenHoseFlowRateTimeCalculator from './GardenHoseFlowRateTimeCalculator.jsx';
import WaterIcon from '@mui/icons-material/Water';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    color: '#222',
  },
  '&:hover .MuiListItemText-primary': {
    color: '#8cb43a',
  },
  '&:hover': {
    backgroundColor: 'rgba(140, 180, 58, 0.1)',
  },
}));

const SectionHeader = styled(ListItem)({
  backgroundColor: '#f5f5f5',
  '& .MuiListItemText-primary': {
    color: '#8cb43a',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
});

const CategoryHeader = styled(ListItem)({
  backgroundColor: '#e0e0e0',
  '& .MuiListItemText-primary': {
    color: '#333',
    fontWeight: 600,
    fontSize: '1rem',
  },
});

const irrigationPages = [
  { path: '/irrigation', name: 'Irrigation Calculators', component: MainCalculatorsPage },
  { path: '/water-application-rate', name: 'Water Application Rate', component: WaterApplicationRateCalculator },
  { path: '/irrigation-frequency', name: 'Irrigation Frequency', component: IrrigationFrequencyCalculator },
  { path: '/water-depth', name: 'Water Depth', component: WaterDepthCalculator },
  { path: '/irrigation-run-time', name: 'Irrigation Run Time', component: IrrigationRunTimeCalculator },
  { path: '/irrigatable-area', name: 'Irrigatable Area', component: IrrigatableAreaCalculator },
  { path: '/required-water-pump-horsepower', name: 'Required Water Pump Horsepower', component: RequiredWaterPumpHorsepowerCalculator },
  { path: '/irrigation-times', name: 'Set Irrigation Times', component: IrrigationTimesCalculator },
  { path: '/system-pumping-requirements', name: 'System Pumping Requirements', component: SystemPumpingRequirementsCalculator },
  { path: '/pipe-friction-loss', name: 'Pipe Friction Loss', component: PipeFrictionLossCalculator },
  { path: '/pipe-water-velocity', name: 'Pipe Water Velocity', component: PipeWaterVelocityCalculator },
  { path: '/minimum-required-pipe-size', name: 'Minimum Required Pipe Size', component: MinimumRequiredPipeSizeCalculator },
  { path: '/drip-line-application-rate', name: 'Drip Line Application Rate', component: DripLineApplicationRateCalculator },
  { path: '/nozzle-application-rate', name: 'Nozzle Application Rate', component: NozzleApplicationRateCalculator },
  { path: '/nozzle-flow-rate-diameter', name: 'Nozzle Flow Rate / Diameter', component: NozzleFlowRateDiameterCalculator },
  { path: '/garden-hose-flow-rate-time', name: 'Garden Hose Flow Rate & Time', component: GardenHoseFlowRateTimeCalculator },
  { path: '/irrigation-unit-conversions', name: 'Irrigation Unit Conversions', component: IrrigationUnitConversions },
  { path: '/irrigation-units-description', name: 'Irrigation Units Description', component: IrrigationUnitsDescription },
];

const irrigationCategories = {
  'Main': ['Irrigation Calculators'],
  'SECTION A — Irrigation Planning (Crop Demand Tools)': [
    'Water Depth',
    'Water Application Rate',
    'Irrigation Run Time',
    'Irrigation Frequency',
  ],
  'SECTION B — System Capacity & Pumping Tools': [
    'Irrigatable Area',
    'System Pumping Requirements',
    'Required Water Pump Horsepower',
  ],
  'SECTION C — Hydraulic / Engineering Tools': [
    'Set Irrigation Times',
    'Pipe Water Velocity',
    'Pipe Friction Loss',
    'Minimum Required Pipe Size',
    'Drip Line Application Rate',
    'Nozzle Application Rate',
    'Nozzle Flow Rate / Diameter',
    'Garden Hose Flow Rate & Time',
  ],
  'SECTION D — Information & Conversion Tools': [
    'Irrigation Units Description',
    'Irrigation Unit Conversions',
  ],
};

const App = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7f7f9' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </DrawerHeader>
        <List>
          {/* Irrigation Section */}
          <SectionHeader>
            <ListItemIcon>
              <WaterIcon sx={{ color: '#8cb43a' }} />
            </ListItemIcon>
            <ListItemText primary="Irrigation" />
          </SectionHeader>
          {Object.entries(irrigationCategories).map(([category, pages]) => (
            <React.Fragment key={category}>
              <CategoryHeader>
                <ListItemText primary={category} />
              </CategoryHeader>
              {pages.map((pageName) => {
                const page = irrigationPages.find((p) => p.name === pageName);
                const isActive = drawerOpen && page && location.pathname === page.path;
                return page ? (
                  <StyledListItem
                    component={Link}
                    to={page.path}
                    key={page.path}
                    sx={{
                      pl: 4,
                      ...(isActive && {
                        backgroundColor: '#8cb43a',
                        '& .MuiListItemText-primary': { color: '#fff', fontWeight: 700 },
                        '&:hover .MuiListItemText-primary': { color: '#fff' },
                        '&:hover': { backgroundColor: '#7aa32f' },
                      }),
                    }}
                  >
                    <ListItemText primary={page.name} />
                  </StyledListItem>
                ) : (
                  <StyledListItem
                    key={pageName}
                    sx={{ pl: 4 }}
                    disabled
                  >
                    <ListItemText primary={pageName} />
                  </StyledListItem>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Main open={drawerOpen} sx={{ backgroundColor: '#f7f7f9' }}>
        <DrawerHeader />
        <Container maxWidth="lg">
          <Routes>
            {irrigationPages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={<page.component />}
              />
            ))}
            <Route path="/" element={<MainCalculatorsPage />} />
            <Route path="/water-application-rate" element={<WaterApplicationRateCalculator />} />
            <Route path="/irrigation-frequency" element={<IrrigationFrequencyCalculator />} />
            <Route path="/water-depth" element={<WaterDepthCalculator />} />
            <Route path="/irrigation-run-time" element={<IrrigationRunTimeCalculator />} />
            <Route path="/irrigatable-area" element={<IrrigatableAreaCalculator />} />
            <Route path="/required-water-pump-horsepower" element={<RequiredWaterPumpHorsepowerCalculator />} />
            <Route path="/irrigation-times" element={<IrrigationTimesCalculator />} />
            <Route path="/system-pumping-requirements" element={<SystemPumpingRequirementsCalculator />} />
            <Route path="/pipe-friction-loss" element={<PipeFrictionLossCalculator />} />
            <Route path="/pipe-water-velocity" element={<PipeWaterVelocityCalculator />} />
            <Route path="/minimum-required-pipe-size" element={<MinimumRequiredPipeSizeCalculator />} />
            <Route path="/drip-line-application-rate" element={<DripLineApplicationRateCalculator />} />
            <Route path="/nozzle-application-rate" element={<NozzleApplicationRateCalculator />} />
            <Route path="/nozzle-flow-rate-diameter" element={<NozzleFlowRateDiameterCalculator />} />
            <Route path="/garden-hose-flow-rate-time" element={<GardenHoseFlowRateTimeCalculator />} />
            <Route path="/irrigation-unit-conversions" element={<IrrigationUnitConversions />} />
            <Route path="/irrigation-units-description" element={<IrrigationUnitsDescription />} />
          </Routes>
        </Container>
      </Main>
      {!drawerOpen && (
        <Fab
          color="primary"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{ position: 'fixed', top: 16, left: 16 }}
        >
          <MenuIcon />
        </Fab>
      )}
    </Box>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper; 
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Card,
  CardContent,
  Alert,
  Collapse,
  IconButton,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const areaUnits = [
  { label: 'acre', value: 'acre' },
  { label: 'hectare', value: 'hectare' },
  { label: 'sq. in.', value: 'sqin' },
  { label: 'sq. ft.', value: 'sqft' },
  { label: 'sq. cm.', value: 'sqcm' },
  { label: 'sq. meter', value: 'sqm' },
  { label: 'sq. yd.', value: 'sqyd' },
  { label: 'sq. km', value: 'sqkm' },
  { label: 'sq. mile', value: 'sqmile' },
];

const flowRateUnits = [
  { label: 'lps', value: 'lps' },
  { label: 'lph', value: 'lph' },
  { label: 'lpd', value: 'lpd' },
  { label: 'gpm', value: 'gpm' },
  { label: 'gph', value: 'gph' },
  { label: 'gpd', value: 'gpd' },
  { label: 'cfs', value: 'cfs' },
  { label: 'acre-in/day', value: 'acreinday' },
  { label: 'acre-in/hour', value: 'acreinhr' },
  { label: 'acre-ft/day', value: 'acrefday' },
  { label: 'cms', value: 'cms' },
  { label: 'cu. m/hr', value: 'cumhr' },
];

const appRateUnits = [
  { label: 'mm/hr', value: 'mmhr' },
  { label: 'mm/day', value: 'mmday' },
  { label: 'cm/hr', value: 'cmhr' },
  { label: 'cm/day', value: 'cmday' },
  { label: 'in/hr', value: 'inhr' },
  { label: 'in/day', value: 'inday' },
];

function convertAreaToAcres(value, unit) {
  switch (unit) {
    case 'acre': return value;
    case 'hectare': return value * 2.47105;
    case 'sqin': return value / 6272640;
    case 'sqft': return value / 43560;
    case 'sqcm': return value / 40468564.224;
    case 'sqm': return value / 4046.86;
    case 'sqyd': return value / 4840;
    case 'sqkm': return value * 247.105;
    case 'sqmile': return value * 640;
    default: return value;
  }
}

function convertFlowRateToGpm(value, unit) {
  switch (unit) {
    case 'gpm': return value;
    case 'lps': return value * 15.8503;
    case 'lph': return value * 0.00440287;
    case 'lpd': return value * 0.000183453;
    case 'gph': return value / 60;
    case 'gpd': return value / 1440;
    case 'cfs': return value * 448.831;
    case 'acreinday': return value * 27154;
    case 'acreinhr': return value * 651696;
    case 'acrefday': return value * 271540;
    case 'cms': return value * 15850.3;
    case 'cumhr': return value * 4.40287;
    default: return value;
  }
}

function convertInHrToOutputUnit(value, unit) {
  switch (unit) {
    case 'mmhr': return value * 25.4;
    case 'mmday': return value * 25.4 * 24;
    case 'cmhr': return value * 2.54;
    case 'cmday': return value * 2.54 * 24;
    case 'inhr': return value;
    case 'inday': return value * 24;
    default: return value;
  }
}

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 20, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };
const fontVar = { fontWeight: 700, color: '#8cb43a' };

// System type benchmarks
const systemTypes = {
  drip: {
    label: 'Drip irrigation',
    appRateRange: { min: 1, max: 4, unit: 'mm/hr' }, // 0.04-0.16 in/hr
    flowPerAcre: { min: 6, max: 15, unit: 'gpm' }
  },
  micro: {
    label: 'Micro-sprinklers / micro-jets',
    appRateRange: { min: 3, max: 10, unit: 'mm/hr' }, // 0.12-0.4 in/hr
    flowPerAcre: { min: 20, max: 60, unit: 'gpm' }
  },
  sprinkler: {
    label: 'Solid-set / hand-move / big guns / pivots',
    appRateRange: { min: 5, max: 15, unit: 'mm/hr' }, // 0.2-0.6 in/hr
    flowPerAcre: { min: 40, max: 200, unit: 'gpm' }
  },
  pivot: {
    label: 'Center pivot (whole machine)',
    appRateRange: { min: 5, max: 15, unit: 'mm/hr' },
    flowPerAcre: { min: 600, max: 1000, unit: 'gpm total' }
  }
};

const WaterApplicationRateCalculator = () => {
  const [inputs, setInputs] = useState({
    area: 0,
    areaUnit: 'acre',
    flowRate: 0,
    flowRateUnit: 'gpm',
    appRateUnit: 'mmhr',
  });
  const [result, setResult] = useState(null);
  const [flowRateHelperOpen, setFlowRateHelperOpen] = useState(false);
  const [selectedSystemType, setSelectedSystemType] = useState('drip');
  const [emitterFlow, setEmitterFlow] = useState('');
  const [emitterFlowUnit, setEmitterFlowUnit] = useState('gph');
  const [numEmitters, setNumEmitters] = useState('');

  const handleInputChange = (field) => (
    event
  ) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: field.includes('Unit') ? value : Number(value),
    }));
  };

  // Dedicated handler for number/text fields
  const handleNumberInputChange = (field) => (
    event
  ) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  useEffect(() => {
    calculateAppRate();
    // eslint-disable-next-line
  }, [inputs]);

  const calculateAppRate = () => {
    const areaAcres = convertAreaToAcres(inputs.area, inputs.areaUnit);
    const flowGpm = convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit);
    if (areaAcres <= 0 || flowGpm <= 0) {
      setResult(null);
      return;
    }
    // AR (in/hr) = q / (A * 452.57)
    const appRateInHr = flowGpm / (areaAcres * 452.57);
    const finalRate = convertInHrToOutputUnit(appRateInHr, inputs.appRateUnit);
    setResult(finalRate);
  };

  // Calculate total flow rate from emitters
  const calculateTotalFlow = () => {
    const flowPerEmitter = parseFloat(emitterFlow) || 0;
    const count = parseFloat(numEmitters) || 0;
    
    if (flowPerEmitter > 0 && count > 0) {
      let totalFlow = flowPerEmitter * count;
      
      // Convert to GPM if needed
      if (emitterFlowUnit === 'gph') {
        totalFlow = totalFlow / 60;
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'gph' };
      } else if (emitterFlowUnit === 'gpm') {
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: totalFlow.toFixed(2), originalUnit: 'gpm' };
      } else if (emitterFlowUnit === 'lph') {
        totalFlow = (totalFlow * 0.00440287) / 60; // Convert LPH to GPM
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'lph' };
      } else if (emitterFlowUnit === 'lpm') {
        totalFlow = totalFlow * 0.264172; // Convert LPM to GPM
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'lpm' };
      }
    }
    return null;
  };

  const totalFlowResult = calculateTotalFlow();

  // Apply calculated total flow to the main form
  const applyTotalFlow = () => {
    if (totalFlowResult) {
      setInputs((prev) => ({ ...prev, flowRate: totalFlowResult.value }));
      setInputs((prev) => ({ ...prev, flowRateUnit: 'gpm' }));
    }
  };

  // Get flow per acre for sanity check
  const getFlowPerAcre = () => {
    const areaAcres = convertAreaToAcres(inputs.area, inputs.areaUnit);
    const flowGpm = convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit);
    if (areaAcres > 0 && flowGpm > 0) {
      return flowGpm / areaAcres;
    }
    return null;
  };

  // Get result in mm/hr for comparison
  const getResultInMmHr = () => {
    if (result === null) return null;
    if (inputs.appRateUnit === 'mmhr') return result;
    if (inputs.appRateUnit === 'inhr') return result * 25.4;
    if (inputs.appRateUnit === 'cmhr') return result * 10;
    if (inputs.appRateUnit === 'mmday') return result / 24;
    if (inputs.appRateUnit === 'inday') return (result / 24) * 25.4;
    if (inputs.appRateUnit === 'cmday') return (result / 24) * 10;
    return null;
  };

  // Check if result is within typical range
  const checkResultRange = () => {
    const resultMmHr = getResultInMmHr();
    if (resultMmHr === null) return null;
    const system = systemTypes[selectedSystemType];
    const range = system.appRateRange;
    
    if (resultMmHr < range.min) {
      return { status: 'low', message: `Very low – system may be under-designed or area is too large for this flow.` };
    } else if (resultMmHr > range.max) {
      if (resultMmHr > 20 && selectedSystemType !== 'pivot') {
        return { status: 'high', message: `Unusually high – above 20-25 mm/hr on fine soils you may see runoff risk. Check your inputs.` };
      }
      return { status: 'high', message: `Unusually high for ${system.label.toLowerCase()}. Check your inputs.` };
    }
    return { status: 'normal', message: `Within typical range for ${system.label.toLowerCase()}.` };
  };

  const rangeCheck = checkResultRange();
  const flowPerAcre = getFlowPerAcre();

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Water Application Rate
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Use this form to calculate the water application rate using the flow rate on an area. This calculator assumes perfect irrigation efficiency and uniformity.
      </Typography>
      <Box sx={{ mb: 4 }} />

      {/* Flow Rate Helper */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              💡 Flow Rate (Total System Flow)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setFlowRateHelperOpen(!flowRateHelperOpen)}
            >
              {flowRateHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Enter the <strong>total flow rate</strong> of the system for this area. If you know flow per dripper/nozzle, calculate: <strong>Total flow = flow per emitter × number of emitters/nozzles</strong>.
          </Typography>
          <Collapse in={flowRateHelperOpen}>
            <Box sx={{ mt: 2 }}>
              {/* Inline Flow Rate Calculator */}
              <Card sx={{ backgroundColor: '#f5f5f5', mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Calculate Total Flow
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Flow per Emitter"
                        type="number"
                        value={emitterFlow}
                        onChange={(e) => setEmitterFlow(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={emitterFlowUnit}
                          label="Unit"
                          onChange={(e) => setEmitterFlowUnit(e.target.value)}
                        >
                          <MenuItem value="gph">GPH</MenuItem>
                          <MenuItem value="gpm">GPM</MenuItem>
                          <MenuItem value="lph">LPH</MenuItem>
                          <MenuItem value="lpm">LPM</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography sx={{ textAlign: 'center', pt: 1.5, fontWeight: 600 }}>×</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Number of Emitters"
                        type="number"
                        value={numEmitters}
                        onChange={(e) => setNumEmitters(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  {totalFlowResult && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Flow: {totalFlowResult.original} {totalFlowResult.originalUnit} = {totalFlowResult.value} {totalFlowResult.unit}
                        </Typography>
                      </Alert>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={applyTotalFlow}
                        sx={{ backgroundColor: '#8cb43a', '&:hover': { backgroundColor: '#7ba32a' } }}
                      >
                        Use This Value
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* System Type Selector */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small">
            <InputLabel>System Type (for typical range reference)</InputLabel>
            <Select
              value={selectedSystemType}
              label="System Type (for typical range reference)"
              onChange={(e) => setSelectedSystemType(e.target.value)}
            >
              <MenuItem value="drip">{systemTypes.drip.label}</MenuItem>
              <MenuItem value="micro">{systemTypes.micro.label}</MenuItem>
              <MenuItem value="sprinkler">{systemTypes.sprinkler.label}</MenuItem>
              <MenuItem value="pivot">{systemTypes.pivot.label}</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block' }}>
            Typical application rate: {systemTypes[selectedSystemType].appRateRange.min}–{systemTypes[selectedSystemType].appRateRange.max} {systemTypes[selectedSystemType].appRateRange.unit}
          </Typography>
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Area"
              type="number"
              value={inputs.area}
              onChange={handleNumberInputChange('area')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Area Unit</InputLabel>
            <Select
              value={inputs.areaUnit}
              label="Area Unit"
              onChange={handleInputChange('areaUnit')}
            >
              {areaUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate"
              type="number"
              value={inputs.flowRate}
              onChange={handleNumberInputChange('flowRate')}
              helperText="Enter the total flow rate for the whole system, not a single emitter."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Flow Rate Unit</InputLabel>
            <Select
              value={inputs.flowRateUnit}
              label="Flow Rate Unit"
              onChange={handleInputChange('flowRateUnit')}
            >
              {flowRateUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Input Sanity Check */}
        {flowPerAcre !== null && inputs.area > 0 && inputs.flowRate > 0 && selectedSystemType !== 'pivot' && (
          <Grid item xs={12}>
            <Alert 
              severity={flowPerAcre < systemTypes[selectedSystemType].flowPerAcre.min ? 'warning' : 'info'}
              sx={{ backgroundColor: flowPerAcre < systemTypes[selectedSystemType].flowPerAcre.min ? '#fff3cd' : '#e3f2fd' }}
            >
              <Typography variant="body2">
                Flow per acre: <strong>{flowPerAcre.toFixed(2)} gpm/acre</strong>
                {flowPerAcre < systemTypes[selectedSystemType].flowPerAcre.min && (
                  <> — This is very low. Typical {systemTypes[selectedSystemType].label.toLowerCase()} uses {systemTypes[selectedSystemType].flowPerAcre.min}–{systemTypes[selectedSystemType].flowPerAcre.max} {systemTypes[selectedSystemType].flowPerAcre.unit}/acre. Please check your flow or area.</>
                )}
              </Typography>
            </Alert>
          </Grid>
        )}
        {selectedSystemType === 'pivot' && inputs.flowRate > 0 && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ backgroundColor: '#e3f2fd' }}>
              <Typography variant="body2">
                Total system flow: <strong>{convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit).toFixed(0)} gpm</strong>
                {convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit) < systemTypes.pivot.flowPerAcre.min && (
                  <> — Typical center pivots use {systemTypes.pivot.flowPerAcre.min}–{systemTypes.pivot.flowPerAcre.max} gpm total. Please check your flow.</>
                )}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Result and output unit dropdown side by side, below input fields */}
      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Result:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {result.toFixed(4)}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.appRateUnit}
                onChange={handleInputChange('appRateUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {appRateUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Interpretation Banner */}
          <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
            <Alert 
              severity={rangeCheck?.status === 'normal' ? 'success' : rangeCheck?.status === 'low' ? 'warning' : 'error'}
              sx={{ 
                backgroundColor: rangeCheck?.status === 'normal' ? '#e8f5e9' : rangeCheck?.status === 'low' ? '#fff3cd' : '#ffebee',
                borderLeft: `4px solid ${rangeCheck?.status === 'normal' ? '#4caf50' : rangeCheck?.status === 'low' ? '#ff9800' : '#f44336'}`
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Interpretation
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Application rate: <strong>{getResultInMmHr()?.toFixed(2)} mm/hr</strong> (≈ {(getResultInMmHr() ? getResultInMmHr() * 0.0393701 : 0).toFixed(3)} in/hr)
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • Typical range for <strong>{systemTypes[selectedSystemType].label.toLowerCase()}</strong>: {systemTypes[selectedSystemType].appRateRange.min}–{systemTypes[selectedSystemType].appRateRange.max} mm/hr
              </Typography>
              {rangeCheck && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                  {rangeCheck.message}
                </Typography>
              )}
            </Alert>
          </Box>
        </Box>
      )}

      {/* Formula centered, below result */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 1 }} align="center">
          Formula:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ ...fontFormula, fontSize: 24 }}>
            AR = q / (A × 452.57)
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>AR</b> = Application Rate (in/hr)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>q</b> = Flow Rate (gpm)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>A</b> = Area (acres)
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default WaterApplicationRateCalculator; 
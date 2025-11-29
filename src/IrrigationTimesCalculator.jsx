import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
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

const netWaterUnits = [
  { label: 'mm', value: 'mm' },
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' },
];

const areaUnits = [
  { label: 'acres', value: 'acres' },
  { label: 'sq. in.', value: 'sqin' },
  { label: 'sq. ft.', value: 'sqft' },
  { label: 'hectares', value: 'hectares' },
  { label: 'sq. cm.', value: 'sqcm' },
  { label: 'sq. meters', value: 'sqm' },
  { label: 'sq. mile', value: 'sqmile' },
];

const flowRateUnits = [
  { label: 'lps', value: 'lps' },
  { label: 'lpm', value: 'lpm' },
  { label: 'lph', value: 'lph' },
  { label: 'gpm', value: 'gpm' },
  { label: 'gph', value: 'gph' },
  { label: 'gpd', value: 'gpd' },
  { label: 'cfs', value: 'cfs' },
  { label: 'cfm', value: 'cfm' },
  { label: 'cu. m/hr', value: 'cumhr' },
  { label: 'cu. yd/min', value: 'cuym' },
  { label: 'mgd', value: 'mgd' },
  { label: 'acre-in/day', value: 'acreinday' },
  { label: 'acre-in/hr', value: 'acreinhr' },
  { label: 'acre-ft/day', value: 'acrefday' },
  { label: 'cms', value: 'cms' },
];

const setTimeUnits = [
  { label: 'hr', value: 'hr' },
  { label: 'min', value: 'min' },
];

function convertNetWaterToInches(value, unit) {
  switch (unit) {
    case 'mm': return value * 0.0393701;
    case 'cm': return value * 0.393701;
    case 'in': return value;
    default: return value;
  }
}

function convertAreaToAcres(value, unit) {
  switch (unit) {
    case 'acres': return value;
    case 'sqin': return value / 6272640;
    case 'sqft': return value / 43560;
    case 'hectares': return value * 2.47105;
    case 'sqcm': return value / 40468564.224;
    case 'sqm': return value / 4046.86;
    case 'sqmile': return value * 640;
    default: return value;
  }
}

function convertFlowRateToGpm(value, unit) {
  switch (unit) {
    case 'gpm': return value;
    case 'lps': return value * 15.8503;
    case 'lpm': return value * 0.264172;
    case 'lph': return value * 0.00440287;
    case 'gph': return value / 60;
    case 'gpd': return value / 1440;
    case 'cfs': return value * 448.831;
    case 'cfm': return value * 7.48052;
    case 'cumhr': return value * 4.40287;
    case 'cuym': return value * 201.974;
    case 'mgd': return value * 694.444;
    case 'acreinday': return value * 27154;
    case 'acreinhr': return value * 651696;
    case 'acrefday': return value * 271540;
    case 'cms': return value * 15850.3;
    default: return value;
  }
}

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 20, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Baseline settings data
const cropGroups = {
  shallow: { 
    label: 'Shallow-rooted crops (leafy greens, onions, strawberries)', 
    netWaterMm: 12, // mm (midpoint of 8-15)
    netWaterIn: 0.47 // inches (midpoint of 0.3-0.6)
  },
  medium: { 
    label: 'Medium-rooted crops (vegetables, maize, soybeans)', 
    netWaterMm: 20, // mm (midpoint of 15-25)
    netWaterIn: 0.79 // inches (midpoint of 0.6-1.0)
  },
  deep: { 
    label: 'Deep-rooted / tree crops', 
    netWaterMm: 32, // mm (midpoint of 25-40)
    netWaterIn: 1.26 // inches (midpoint of 1.0-1.6)
  }
};

const systemTypes = {
  drip: { label: 'Drip irrigation', efficiency: 90, flowRange: '1–30 gpm', areaRange: '0.2–2 acres' },
  micro: { label: 'Micro-sprinklers', efficiency: 80, flowRange: '10–80 gpm', areaRange: '0.5–5 acres' },
  sprinkler: { label: 'Sprinklers (hand move / solid set)', efficiency: 70, flowRange: '50–200 gpm', areaRange: '1–10 acres' },
  pivot: { label: 'Center pivots', efficiency: 75, flowRange: '200–600 gpm', areaRange: '100–130 acres per sector' },
  biggun: { label: 'Traveling guns / big gun', efficiency: 60, flowRange: '200–600 gpm', areaRange: '10–50 acres' }
};

const IrrigationTimesCalculator = () => {
  const [inputs, setInputs] = useState({
    netWater: '',
    netWaterUnit: netWaterUnits[0].value,
    systemEfficiency: 80,
    irrigatedArea: '',
    areaUnit: areaUnits[0].value,
    flowRate: '',
    flowRateUnit: flowRateUnits[0].value,
    setTimeUnit: setTimeUnits[0].value
  });

  const [result, setResult] = useState(null);
  const [baselineOpen, setBaselineOpen] = useState(true);
  const [selectedCropGroup, setSelectedCropGroup] = useState('medium');
  const [selectedSystemType, setSelectedSystemType] = useState('sprinkler');
  const [flowRateHelperOpen, setFlowRateHelperOpen] = useState(false);
  const [emitterFlow, setEmitterFlow] = useState('');
  const [emitterFlowUnit, setEmitterFlowUnit] = useState('gph');
  const [numEmitters, setNumEmitters] = useState('');

  const handleNumberInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleInputChange = (field) => (event) => {
    setInputs(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Auto-apply when baseline settings change
  useEffect(() => {
    const crop = cropGroups[selectedCropGroup];
    const system = systemTypes[selectedSystemType];
    
    // Set net water based on current unit
    let netWaterValue;
    if (inputs.netWaterUnit === 'mm') {
      netWaterValue = crop.netWaterMm;
    } else if (inputs.netWaterUnit === 'cm') {
      netWaterValue = crop.netWaterMm / 10;
    } else {
      netWaterValue = crop.netWaterIn;
    }
    
    setInputs((prev) => ({
      ...prev,
      netWater: parseFloat(netWaterValue.toFixed(2)).toString(),
      systemEfficiency: system.efficiency,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCropGroup, selectedSystemType]);

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

  // Convert result to hours and minutes
  const getTimeBreakdown = () => {
    if (result === null) return null;
    const hours = inputs.setTimeUnit === 'hr' ? result : result / 60;
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return { hours: wholeHours, minutes: minutes };
  };

  const timeBreakdown = getTimeBreakdown();

  useEffect(() => {
    calculateSetTime();
  }, [inputs]);

  const calculateSetTime = () => {
    const netWaterInches = convertNetWaterToInches(inputs.netWater, inputs.netWaterUnit);
    const areaAcres = convertAreaToAcres(inputs.irrigatedArea, inputs.areaUnit);
    const flowGpm = convertFlowRateToGpm(inputs.flowRate, inputs.flowRateUnit);
    const efficiency = inputs.systemEfficiency / 100;
    
    if (netWaterInches <= 0 || areaAcres <= 0 || flowGpm <= 0 || efficiency <= 0) {
      setResult(null);
      return;
    }
    
    let setTimeHr = (netWaterInches * areaAcres * 43560) / (96.3 * flowGpm * efficiency);
    let finalTime = setTimeHr;
    if (inputs.setTimeUnit === 'min') {
      finalTime = setTimeHr * 60;
    }
    setResult(finalTime);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Set Irrigation Times
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Use this form to determine the set time required to fulfill a given water application, irrigation area, and flow rate.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "How long should I run my system to apply X mm/in of water over Y area, given my flow rate and system efficiency?"
      </Typography>

      {/* Baseline Settings Panel */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              🔹 Model-Assisted Setup (Optional)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setBaselineOpen(!baselineOpen)}
            >
              {baselineOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Select crop type and system type to get suggested values, which you can edit.
          </Typography>
          <Collapse in={baselineOpen}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Crop Type</InputLabel>
                  <Select
                    value={selectedCropGroup}
                    label="Crop Type"
                    onChange={(e) => setSelectedCropGroup(e.target.value)}
                  >
                    <MenuItem value="shallow">{cropGroups.shallow.label}</MenuItem>
                    <MenuItem value="medium">{cropGroups.medium.label}</MenuItem>
                    <MenuItem value="deep">{cropGroups.deep.label}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>System Type</InputLabel>
                  <Select
                    value={selectedSystemType}
                    label="System Type"
                    onChange={(e) => setSelectedSystemType(e.target.value)}
                  >
                    <MenuItem value="drip">{systemTypes.drip.label}</MenuItem>
                    <MenuItem value="micro">{systemTypes.micro.label}</MenuItem>
                    <MenuItem value="sprinkler">{systemTypes.sprinkler.label}</MenuItem>
                    <MenuItem value="pivot">{systemTypes.pivot.label}</MenuItem>
                    <MenuItem value="biggun">{systemTypes.biggun.label}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    💡 This has set:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                    <Typography component="li" variant="body2">
                      Net Water Application: <strong>{inputs.netWater || '0'} {inputs.netWaterUnit}</strong> (typical for {cropGroups[selectedCropGroup].label.toLowerCase()})
                    </Typography>
                    <Typography component="li" variant="body2">
                      System Efficiency: <strong>{inputs.systemEfficiency}%</strong> (typical for {systemTypes[selectedSystemType].label.toLowerCase()})
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Net Water Application"
              type="number"
              value={inputs.netWater}
              onChange={handleNumberInputChange('netWater')}
              helperText="Depth of water required per irrigation. Typical values: 8–15 mm (shallow crops), 15–25 mm (medium crops), 25–40 mm (tree crops)."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={inputs.netWaterUnit}
              label="Unit"
              onChange={handleInputChange('netWaterUnit')}
            >
              {netWaterUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="System Efficiency (%)"
              type="number"
              value={inputs.systemEfficiency}
              onChange={handleNumberInputChange('systemEfficiency')}
              helperText="Water-use efficiency of your system. Typical: 90% (drip), 80% (micro-sprinkler), 75% (pivot), 65% (sprinkler), 55% (big gun)."
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Irrigated Area"
              type="number"
              value={inputs.irrigatedArea}
              onChange={handleNumberInputChange('irrigatedArea')}
              helperText="Area irrigated in one set/zone, not the whole farm. Drip: 0.2–2 acres, vegetables: 1–10 acres, orchards: 0.5–5 acres, pivot spans: 100–130 acres per sector."
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
              helperText="Total flow delivered to this block. Multiply emitters × emitter flow if needed. Typical ranges: 10–200 gpm (most systems), 200–600 gpm (pivots/big guns)."
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
      </Grid>

      {/* Flow Rate Helper */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 3, mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              💡 Calculate Total Flow from Emitters
            </Typography>
            <IconButton
              size="small"
              onClick={() => setFlowRateHelperOpen(!flowRateHelperOpen)}
            >
              {flowRateHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            If you know flow per emitter, calculate total flow: <strong>Total flow = flow per emitter × number of emitters</strong>
          </Typography>
          <Collapse in={flowRateHelperOpen}>
            <Box sx={{ mt: 2 }}>
              <Card sx={{ backgroundColor: '#f5f5f5', mb: 2 }}>
                <CardContent>
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

      {/* Result and output unit dropdown side by side, below input fields */}
      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Result:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {result.toFixed(2)}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.setTimeUnit}
                onChange={handleInputChange('setTimeUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 80 }}
              >
                {setTimeUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Time Breakdown */}
          {timeBreakdown && inputs.setTimeUnit === 'hr' && timeBreakdown.hours > 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              Equivalent: <strong>{timeBreakdown.hours} {timeBreakdown.hours === 1 ? 'hr' : 'hrs'}</strong>
              {timeBreakdown.minutes > 0 && <><strong> {timeBreakdown.minutes} min</strong></>}
            </Typography>
          )}

          {/* Result Interpretation */}
          <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
            <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Interpretation
              </Typography>
              <Typography variant="body2">
                This is the number of {inputs.setTimeUnit === 'hr' ? 'hours' : 'minutes'} the system must run to apply <strong>{inputs.netWater} {inputs.netWaterUnit}</strong> of water over <strong>{inputs.irrigatedArea} {inputs.areaUnit}</strong>, considering losses from <strong>{inputs.systemEfficiency}% efficiency</strong>.
              </Typography>
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
            T = (D × A × 43560) / (96.3 × Q × E)
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 16 }}><b>T</b> = Set Time (hr)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>D</b> = Net water application (in)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>A</b> = Irrigated area (acres)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q</b> = Flow Rate (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>E</b> = System efficiency (as a decimal)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default IrrigationTimesCalculator; 
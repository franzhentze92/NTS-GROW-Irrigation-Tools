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
  Alert,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

// All units from the original calculator
const flowRateUnits = [
  { label: 'gpm', value: 'gpm' },
  { label: 'gph', value: 'gph' },
  { label: 'mgd', value: 'mgd' },
  { label: 'cfs', value: 'cfs' },
  { label: 'acre-in/day', value: 'acre-in/day' },
  { label: 'acre-in/hour', value: 'acre-in/hour' },
  { label: 'acre-ft/day', value: 'acre-ft/day' },
  { label: 'lps', value: 'lps' },
  { label: 'lpm', value: 'lpm' },
  { label: 'cms', value: 'cms' },
  { label: 'cu. m/hr', value: 'cu. m/hr' },
];

const areaUnits = [
  { label: 'acres', value: 'acres' },
  { label: 'sq. ft', value: 'sq. ft' },
  { label: 'hectares', value: 'hectares' },
  { label: 'sq. m', value: 'sq. m' },
  { label: 'sq. miles', value: 'sq. miles' },
];

const timeUnits = [
  { label: 'hr', value: 'hr' },
  { label: 'min', value: 'min' },
  { label: 'sec', value: 'sec' },
  { label: 'days', value: 'days' },
  { label: 'weeks', value: 'weeks' },
  { label: 'months', value: 'months' },
  { label: 'yrs', value: 'yrs' },
];

const depthUnits = [
  { label: 'in', value: 'in' },
  { label: 'ft', value: 'ft' },
  { label: 'mm', value: 'mm' },
  { label: 'cm', value: 'cm' },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };
const fontVar = { fontWeight: 700, color: '#8cb43a' };

const flowRateToGpm = {
  'gpm': 1,
  'gph': 1/60,
  'mgd': 694.444,
  'cfs': 448.831,
  'acre-in/day': 27.154,
  'acre-in/hour': 651.7,
  'acre-ft/day': 27154,
  'lps': 15.8503,
  'lpm': 0.264172,
  'cms': 15850.3,
  'cu. m/hr': 4.40287,
};
const areaToAcres = {
  'acres': 1,
  'sq. ft': 1/43560,
  'hectares': 2.47105,
  'sq. m': 0.000247105,
  'sq. miles': 640,
};
const timeToHr = {
  'sec': 1/3600,
  'min': 1/60,
  'hr': 1,
  'days': 24,
  'weeks': 168,
  'months': 730,
  'yrs': 8760,
};
const depthToIn = {
  'in': 1,
  'ft': 12,
  'mm': 0.0393701,
  'cm': 0.393701,
};
const inToDepth = {
  'in': 1,
  'ft': 1/12,
  'mm': 25.4,
  'cm': 2.54,
};

// Benchmark data for target depth per irrigation
// User-friendly crop categories mapped to internal root depth classes
const cropGroups = {
  leafy: { 
    label: 'Leafy & Shallow-Rooted Vegetables', 
    examples: 'Lettuce, spinach, leafy greens, herbs, onions, strawberries',
    rootDepth: 'shallow' // Internal mapping
  },
  fruiting: { 
    label: 'Fruiting & Tuber Vegetables', 
    examples: 'Tomato, pepper, cucumber, zucchini, potatoes, sweet potatoes',
    rootDepth: 'medium'
  },
  cereals: { 
    label: 'Cereals & Row Crops', 
    examples: 'Maize, wheat, sorghum, beans, soybeans, cotton, peanuts',
    rootDepth: 'medium'
  },
  vine: { 
    label: 'Vine Crops & Ground Crops', 
    examples: 'Pumpkin, watermelon, melon, squash',
    rootDepth: 'medium'
  },
  orchards: { 
    label: 'Orchards & Tree Crops', 
    examples: 'Avocado, citrus, mango, coffee, nuts, bananas',
    rootDepth: 'deep'
  },
  vineyards: { 
    label: 'Vineyards & Perennial Shrubs', 
    examples: 'Grapes, berries, olives',
    rootDepth: 'deep'
  }
};

const soilTypes = {
  light: { label: 'Light / Sandy' },
  medium: { label: 'Medium / Loam' },
  heavy: { label: 'Heavy / Clay loam' }
};

// Depth benchmarks in mm (medium soil baseline) - using internal root depth classes
const depthBenchmarks = {
  shallow: { medium: { min: 10, max: 20 }, light: { min: 8, max: 15 }, heavy: { min: 12, max: 25 } },
  medium: { medium: { min: 20, max: 35 }, light: { min: 16, max: 28 }, heavy: { min: 24, max: 42 } },
  deep: { medium: { min: 30, max: 50 }, light: { min: 24, max: 40 }, heavy: { min: 36, max: 60 } }
};

// Irrigation efficiency benchmarks
const efficiencyBenchmarks = {
  drip: { value: 90, range: '85-95%', label: 'Drip irrigation' },
  sprinkler: { value: 80, range: '70-85%', label: 'Well-designed sprinkler' },
  surface: { value: 60, range: '50-70%', label: 'Surface / furrow / flood' }
};

const WaterDepthCalculator = () => {
  const [inputs, setInputs] = useState({
    flowRate: '',
    flowRateUnit: 'gpm',
    area: '',
    areaUnit: 'acres',
    time: '',
    timeUnit: 'hr',
    depth: '',
    depthUnit: 'mm',
    efficiency: '90', // Default to drip irrigation efficiency
  });
  const [result, setResult] = useState(null);
  const [benchmarkDepthOpen, setBenchmarkDepthOpen] = useState(false);
  const [benchmarkEfficiencyOpen, setBenchmarkEfficiencyOpen] = useState(false);
  const [flowRateHelperOpen, setFlowRateHelperOpen] = useState(false);
  const [selectedCropGroup, setSelectedCropGroup] = useState('fruiting'); // Default to fruiting vegetables
  const [selectedSoilType, setSelectedSoilType] = useState('medium');
  const [selectedSystemType, setSelectedSystemType] = useState('drip');
  const [emitterFlow, setEmitterFlow] = useState('');
  const [emitterFlowUnit, setEmitterFlowUnit] = useState('gph');
  const [numEmitters, setNumEmitters] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Get recommended depth range based on crop and soil
  // Maps user-friendly crop category to internal root depth class
  const getRecommendedDepth = () => {
    const rootDepthClass = cropGroups[selectedCropGroup].rootDepth;
    const range = depthBenchmarks[rootDepthClass][selectedSoilType];
    const minMm = range.min;
    const maxMm = range.max;
    const minIn = (minMm * 0.0393701).toFixed(2);
    const maxIn = (maxMm * 0.0393701).toFixed(2);
    return { minMm, maxMm, minIn, maxIn };
  };

  // Calculate total flow rate from emitters
  const calculateTotalFlow = () => {
    const flowPerEmitter = parseFloat(emitterFlow) || 0;
    const count = parseFloat(numEmitters) || 0;
    
    if (flowPerEmitter > 0 && count > 0) {
      let totalFlow = flowPerEmitter * count;
      
      // Convert to GPM if needed (common unit)
      if (emitterFlowUnit === 'gph') {
        totalFlow = totalFlow / 60; // Convert GPH to GPM
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'gph' };
      } else if (emitterFlowUnit === 'gpm') {
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: totalFlow.toFixed(2), originalUnit: 'gpm' };
      } else if (emitterFlowUnit === 'lph') {
        totalFlow = totalFlow / 60; // Convert LPH to LPM
        return { value: totalFlow.toFixed(2), unit: 'lpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'lph' };
      } else if (emitterFlowUnit === 'lpm') {
        return { value: totalFlow.toFixed(2), unit: 'lpm', original: totalFlow.toFixed(2), originalUnit: 'lpm' };
      }
    }
    return null;
  };

  const totalFlowResult = calculateTotalFlow();

  // Apply calculated total flow to the main form
  const applyTotalFlow = () => {
    if (totalFlowResult) {
      setInputs((prev) => ({ ...prev, flowRate: totalFlowResult.value }));
      if (totalFlowResult.unit === 'gpm') {
        setInputs((prev) => ({ ...prev, flowRateUnit: 'gpm' }));
      } else if (totalFlowResult.unit === 'lpm') {
        setInputs((prev) => ({ ...prev, flowRateUnit: 'lpm' }));
      }
    }
  };


  useEffect(() => {
    const Q_val = parseFloat(inputs.flowRate) || 0;
    const T_val = parseFloat(inputs.time) || 0;
    const A_val = parseFloat(inputs.area) || 0;
    const E_val = parseFloat(inputs.efficiency) || 100;

    if (Q_val > 0 && T_val > 0 && A_val > 0) {
      const Q_gpm = Q_val * flowRateToGpm[inputs.flowRateUnit];
      const T_hr = T_val * timeToHr[inputs.timeUnit];
      const A_acres = A_val * areaToAcres[inputs.areaUnit];
      const E_decimal = E_val / 100;

      const K = 453;
      const d_in = (Q_gpm * T_hr) / (K * A_acres);
      const d_effective_in = d_in * E_decimal;

      const result_final = d_effective_in * inToDepth[inputs.depthUnit];
      setResult(result_final);
    } else {
      setResult(null);
    }
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Water Depth Calculator
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the depth of water applied to a specified area over a specified time span based on the given flow rate.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mt: 1 }} align="center">
        This tool answers: "If I run this system with this flow over this area for X hours, how many mm/in of water am I applying?"
      </Typography>
      <Box sx={{ mb: 4 }} />

      {/* Benchmark Helpers */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Target Depth Benchmark */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
                  Baseline Target Depth (per irrigation)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setBenchmarkDepthOpen(!benchmarkDepthOpen)}
                >
                  {benchmarkDepthOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Select crop type & soil to see a suggested range
              </Typography>
              <Collapse in={benchmarkDepthOpen}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Crop Group</InputLabel>
                      <Select
                        value={selectedCropGroup}
                        label="Crop Group"
                        onChange={(e) => setSelectedCropGroup(e.target.value)}
                      >
                        <MenuItem value="leafy">{cropGroups.leafy.label}</MenuItem>
                        <MenuItem value="fruiting">{cropGroups.fruiting.label}</MenuItem>
                        <MenuItem value="cereals">{cropGroups.cereals.label}</MenuItem>
                        <MenuItem value="vine">{cropGroups.vine.label}</MenuItem>
                        <MenuItem value="orchards">{cropGroups.orchards.label}</MenuItem>
                        <MenuItem value="vineyards">{cropGroups.vineyards.label}</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block' }}>
                      {cropGroups[selectedCropGroup].examples}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Soil Type</InputLabel>
                      <Select
                        value={selectedSoilType}
                        label="Soil Type"
                        onChange={(e) => setSelectedSoilType(e.target.value)}
                      >
                        <MenuItem value="light">{soilTypes.light.label}</MenuItem>
                        <MenuItem value="medium">{soilTypes.medium.label}</MenuItem>
                        <MenuItem value="heavy">{soilTypes.heavy.label}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Recommended depth: {getRecommendedDepth().minMm}–{getRecommendedDepth().maxMm} mm
                        {' '}(≈ {getRecommendedDepth().minIn}–{getRecommendedDepth().maxIn} in)
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        Adjust the <strong>Time</strong> field below to match this recommended depth for your crop type.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Irrigation Efficiency Benchmark */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
                  Irrigation Efficiency (%)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setBenchmarkEfficiencyOpen(!benchmarkEfficiencyOpen)}
                >
                  {benchmarkEfficiencyOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Select system type for suggested efficiency
              </Typography>
              <Collapse in={benchmarkEfficiencyOpen}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>System Type</InputLabel>
                      <Select
                        value={selectedSystemType}
                        label="System Type"
                        onChange={(e) => {
                          setSelectedSystemType(e.target.value);
                          const benchmark = efficiencyBenchmarks[e.target.value];
                          setInputs((prev) => ({ ...prev, efficiency: benchmark.value.toString() }));
                        }}
                      >
                        <MenuItem value="drip">{efficiencyBenchmarks.drip.label}</MenuItem>
                        <MenuItem value="sprinkler">{efficiencyBenchmarks.sprinkler.label}</MenuItem>
                        <MenuItem value="surface">{efficiencyBenchmarks.surface.label}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Suggested efficiency: {efficiencyBenchmarks[selectedSystemType].value}%
                        {' '}(Range: {efficiencyBenchmarks[selectedSystemType].range})
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        This value has been auto-filled. You can override it in the form below.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Flow Rate Helper */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              💡 Flow Rate — What You Really Need to Enter
            </Typography>
            <IconButton
              size="small"
              onClick={() => setFlowRateHelperOpen(!flowRateHelperOpen)}
            >
              {flowRateHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            <strong>Enter the total system flow rate for the entire irrigated area</strong> — not the flow of a single dripper, nozzle, or sprinkler.
          </Typography>
          <Collapse in={flowRateHelperOpen}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                How to calculate your total system flow rate:
              </Typography>
              <Box component="ol" sx={{ pl: 2, mb: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Identify the flow rate of ONE emitter:</strong> Dripper (1 GPH), Micro-sprinkler (8 GPH), Sprinkler nozzle (3-6 GPM)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  <strong>Count how many emitters/nozzles/sprinklers are running in that block</strong>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 2 }}>
                  <strong>Multiply:</strong> Total Flow = Flow per Emitter × Number of Emitters
                </Typography>
              </Box>

              {/* Inline Flow Rate Calculator */}
              <Card sx={{ backgroundColor: '#f5f5f5', mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Flow Rate Calculator
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={applyTotalFlow}
                          sx={{ backgroundColor: '#8cb43a', '&:hover': { backgroundColor: '#7ba32a' } }}
                        >
                          Use This Value
                        </Button>
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#fff3cd', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#856404' }}>
                      <strong>Examples:</strong> 600 drippers × 1 GPH = 600 GPH (10 GPM) | 48 sprinklers × 3 GPM = 144 GPM
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Alert severity="warning" sx={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ff9800' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Why this matters:
                </Typography>
                <Typography variant="body2">
                  If you enter only the flow of one dripper (e.g., 0.5–2 GPH), the calculator will think your entire field is being irrigated by just one emitter — which produces unrealistic results (like needing 100+ hours).
                </Typography>
              </Alert>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate"
              type="number"
              value={inputs.flowRate}
              onChange={handleInputChange('flowRate')}
              helperText="Enter the total flow rate for the whole block. Multiply: flow per emitter × number of emitters."
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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Area"
              type="number"
              value={inputs.area}
              onChange={handleInputChange('area')}
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
              label="Time"
              type="number"
              value={inputs.time}
              onChange={handleInputChange('time')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Time Unit</InputLabel>
            <Select
              value={inputs.timeUnit}
              label="Time Unit"
              onChange={handleInputChange('timeUnit')}
            >
              {timeUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Irrigation Efficiency (%)"
              type="number"
              value={inputs.efficiency}
              onChange={handleInputChange('efficiency')}
              placeholder="e.g., 85"
            />
          </FormControl>
        </Grid>
      </Grid>
      {/* Result and output unit dropdown side by side, below input fields */}
      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Result:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.depthUnit}
                onChange={handleInputChange('depthUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {depthUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
            Q &times; T = K &times; A &times; d
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>d</b> = Depth of water application over A (in)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Q</b> = Flow rate of water onto the field (cfs or gpm depending on K)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>T</b> = Time water is flowing (hrs)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>A</b> = Area (acres)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>K</b> = Constant (1.01 for Q in cfs, 453 for Q in gpm)
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

export default WaterDepthCalculator;
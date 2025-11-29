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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const intervalUnits = [
  { label: 'days', value: 1 },
  { label: 'hr', value: 1 / 24 },
];

const cropWaterUseUnits = [
  { label: 'in/day', value: 1 },
  { label: 'mm/day', value: 1 / 25.4 },
  { label: 'cm/day', value: 1 / 2.54 },
  { label: 'in/month', value: 1 / 30 },
  { label: 'mm/month', value: 1 / (25.4 * 30) },
  { label: 'cm/month', value: 1 / (2.54 * 30) },
];

const appRateUnits = [
  { label: 'in/hr', value: 1 },
  { label: 'in/day', value: 1 / 24 },
  { label: 'mm/hr', value: 1 / 25.4 },
  { label: 'mm/day', value: 1 / (25.4 * 24) },
  { label: 'cm/hr', value: 1 / 2.54 },
  { label: 'cm/day', value: 1 / (2.54 * 24) },
];

const efficiencyUnits = [
  { label: '%', value: 0.01 },
  { label: 'decimal', value: 1 },
];

const outputUnits = [
  { label: 'min', value: 1 },
  { label: 'hr', value: 1 / 60 },
  { label: 'days', value: 1 / (60 * 24) },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Baseline settings data
const cropGroups = {
  leafy: { 
    label: 'Leafy & Shallow-Rooted Vegetables', 
    examples: 'Lettuce, spinach, leafy greens, herbs, onions, strawberries',
    interval: 2.5, // days (midpoint of 2-3)
    etcModerate: 0.16 // in/day (≈ 4.0 mm/day)
  },
  fruiting: { 
    label: 'Fruiting & Tuber Vegetables', 
    examples: 'Tomato, pepper, cucumber, zucchini, potatoes, sweet potatoes',
    interval: 3.5, // days (midpoint of 3-4)
    etcModerate: 0.20 // in/day (≈ 5.0 mm/day)
  },
  cereals: { 
    label: 'Cereals & Row Crops', 
    examples: 'Maize, wheat, sorghum, beans, soybeans, cotton, peanuts',
    interval: 5.5, // days (midpoint of 4-7)
    etcModerate: 0.18 // in/day (≈ 4.5 mm/day)
  },
  vine: { 
    label: 'Vine Crops & Ground Crops', 
    examples: 'Pumpkin, watermelon, melon, squash',
    interval: 5.5, // days (midpoint of 4-7, similar to cereals)
    etcModerate: 0.24 // in/day (≈ 6.0 mm/day)
  },
  orchards: { 
    label: 'Orchards & Tree Crops', 
    examples: 'Avocado, citrus, mango, coffee, nuts, bananas',
    interval: 7.5, // days (midpoint of 5-10)
    etcModerate: 0.28 // in/day (≈ 7.0 mm/day)
  },
  vineyards: { 
    label: 'Vineyards & Perennial Shrubs', 
    examples: 'Grapes, berries, olives',
    interval: 7.5, // days (midpoint of 5-10)
    etcModerate: 0.24 // in/day (≈ 6.0 mm/day)
  }
};

const climateTypes = {
  cool: { label: 'Cool / Mild', multiplier: 0.8 },
  moderate: { label: 'Moderate', multiplier: 1.0 },
  hot: { label: 'Hot / Arid', multiplier: 1.2 }
};

const systemTypes = {
  drip: { 
    label: 'Drip irrigation', 
    appRate: 0.10, // in/hr (midpoint of 0.05-0.20)
    efficiency: 90 
  },
  sprinkler: { 
    label: 'Well-designed sprinkler', 
    appRate: 0.25, // in/hr (midpoint of 0.15-0.50)
    efficiency: 80 
  },
  pivot: { 
    label: 'Pivot / Gun sprinkler', 
    appRate: 0.25, // in/hr (similar to sprinkler)
    efficiency: 80 
  },
  surface: { 
    label: 'Surface / furrow / flood', 
    appRate: 0.20, // in/hr (midpoint of 0.10-0.30)
    efficiency: 60 
  }
};

const IrrigationRunTimeCalculator = () => {
  const [inputs, setInputs] = useState({
    interval: '3.5',
    intervalUnit: intervalUnits[0].value,
    waterUse: '0.20',
    waterUseUnit: cropWaterUseUnits[0].value,
    appRate: '0.25',
    appRateUnit: appRateUnits[0].value,
    efficiency: '80',
    efficiencyUnit: efficiencyUnits[0].value,
    outputUnit: outputUnits[0].value
  });
  const [baselineOpen, setBaselineOpen] = useState(true);
  const [selectedCropGroup, setSelectedCropGroup] = useState('fruiting');
  const [selectedClimate, setSelectedClimate] = useState('moderate');
  const [selectedSystemType, setSelectedSystemType] = useState('sprinkler');

  const handleNumberInputChange = (field) => (event) => {
    setInputs(prev => ({
      ...prev,
      [field]: event.target.value
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
    const climate = climateTypes[selectedClimate];
    const system = systemTypes[selectedSystemType];
    
    // Calculate crop water use with climate adjustment
    const waterUseValue = crop.etcModerate * climate.multiplier;
    
    setInputs((prev) => ({
      ...prev,
      interval: crop.interval.toString(),
      waterUse: parseFloat(waterUseValue.toFixed(3)).toString(),
      appRate: system.appRate.toString(),
      efficiency: system.efficiency.toString(),
    }));
  }, [selectedCropGroup, selectedClimate, selectedSystemType]);

  // Calculate run time
  let result = null;
  const valid = inputs.interval && inputs.waterUse && inputs.appRate && inputs.efficiency && Number(inputs.efficiency) !== 0;
  if (valid) {
    // Convert all to base units: days, in/day, in/hr, decimal
    const I = parseFloat(inputs.interval) * inputs.intervalUnit;
    const W = parseFloat(inputs.waterUse) * inputs.waterUseUnit;
    const AR = parseFloat(inputs.appRate) * inputs.appRateUnit;
    const E = parseFloat(inputs.efficiency) * inputs.efficiencyUnit;
    if (AR > 0 && E > 0) {
      const T_min = (60 * I * W) / (AR * E);
      const outFactor = inputs.outputUnit;
      const T_out = T_min * outFactor;
      result = T_out;
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Irrigation Run Time Calculator
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Use this calculator to determine the length of time that an irrigation system must run to apply enough water to replace the water lost to evapotranspiration.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "If my crop uses X inches per day, and I irrigate every W days, how long do I have to run my system (with this application rate and efficiency) to replace that water?"
      </Typography>

      {/* Baseline Settings Panel */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              🔹 Model-Assisted Setup
            </Typography>
            <IconButton
              size="small"
              onClick={() => setBaselineOpen(!baselineOpen)}
            >
              {baselineOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            We've pre-filled the fields below using your crop type, climate, and system type. Adjust any value if you know your exact conditions.
          </Typography>
          <Collapse in={baselineOpen}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Crop Type</InputLabel>
                  <Select
                    value={selectedCropGroup}
                    label="Crop Type"
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
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Climate</InputLabel>
                  <Select
                    value={selectedClimate}
                    label="Climate"
                    onChange={(e) => setSelectedClimate(e.target.value)}
                  >
                    <MenuItem value="cool">{climateTypes.cool.label}</MenuItem>
                    <MenuItem value="moderate">{climateTypes.moderate.label}</MenuItem>
                    <MenuItem value="hot">{climateTypes.hot.label}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>System Type</InputLabel>
                  <Select
                    value={selectedSystemType}
                    label="System Type"
                    onChange={(e) => setSelectedSystemType(e.target.value)}
                  >
                    <MenuItem value="drip">{systemTypes.drip.label}</MenuItem>
                    <MenuItem value="sprinkler">{systemTypes.sprinkler.label}</MenuItem>
                    <MenuItem value="pivot">{systemTypes.pivot.label}</MenuItem>
                    <MenuItem value="surface">{systemTypes.surface.label}</MenuItem>
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
                      Watering interval: <strong>{cropGroups[selectedCropGroup].interval} days</strong> (typical for this crop type)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Crop water use: <strong>{(cropGroups[selectedCropGroup].etcModerate * climateTypes[selectedClimate].multiplier).toFixed(3)} in/day</strong> (≈ {((cropGroups[selectedCropGroup].etcModerate * climateTypes[selectedClimate].multiplier) * 25.4).toFixed(1)} mm/day)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Application rate: <strong>{systemTypes[selectedSystemType].appRate} in/hr</strong> (≈ {(systemTypes[selectedSystemType].appRate * 25.4).toFixed(1)} mm/hr) - typical for {systemTypes[selectedSystemType].label.toLowerCase()}
                    </Typography>
                    <Typography component="li" variant="body2">
                      Efficiency: <strong>{systemTypes[selectedSystemType].efficiency}%</strong> (typical for {systemTypes[selectedSystemType].label.toLowerCase()})
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Watering Interval"
              type="number"
              value={inputs.interval}
              onChange={handleNumberInputChange('interval')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Interval Unit</InputLabel>
            <Select
              value={inputs.intervalUnit}
              label="Interval Unit"
              onChange={handleInputChange('intervalUnit')}
            >
              {intervalUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Crop Water Use"
              type="number"
              value={inputs.waterUse}
              onChange={handleNumberInputChange('waterUse')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Water Use Unit</InputLabel>
            <Select
              value={inputs.waterUseUnit}
              label="Water Use Unit"
              onChange={handleInputChange('waterUseUnit')}
            >
              {cropWaterUseUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Application Rate"
              type="number"
              value={inputs.appRate}
              onChange={handleNumberInputChange('appRate')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Application Rate Unit</InputLabel>
            <Select
              value={inputs.appRateUnit}
              label="Application Rate Unit"
              onChange={handleInputChange('appRateUnit')}
            >
              {appRateUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Irrigation Efficiency"
              type="number"
              value={inputs.efficiency}
              onChange={handleNumberInputChange('efficiency')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Efficiency Unit</InputLabel>
            <Select
              value={inputs.efficiencyUnit}
              label="Efficiency Unit"
              onChange={handleInputChange('efficiencyUnit')}
            >
              {efficiencyUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Output Unit</InputLabel>
            <Select
              value={inputs.outputUnit}
              label="Output Unit"
              onChange={handleInputChange('outputUnit')}
            >
              {outputUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
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
            <Typography sx={{ fontWeight: 700, color: '#8cb43a', fontSize: 24 }}>
              {outputUnits.find(u => u.value === inputs.outputUnit)?.label || inputs.outputUnit}
            </Typography>
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
            T = (60 × I × W) / (AR × E)
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>T</b> = The time the irrigation system needs to run (hrs)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>I</b> = The watering interval of the system (day)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>W</b> = Crop Water Use (in/day)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>AR</b> = Application Rate of the system (in/hr)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>E</b> = The efficiency of the irrigation system (as a decimal)
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

export default IrrigationRunTimeCalculator; 
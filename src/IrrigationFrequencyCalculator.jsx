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
  InputAdornment,
  Card,
  CardContent,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const awcUnits = [
  { label: 'in/ft', value: 'inft' },
  { label: 'mm/m', value: 'mmm' },
];

const rzUnits = [
  { label: 'ft', value: 'ft' },
  { label: 'm', value: 'm' },
  { label: 'cm', value: 'cm' },
  { label: 'mm', value: 'mm' },
  { label: 'in', value: 'in' },
];

const madUnits = [
  { label: 'decimal', value: 'decimal' },
  { label: '%', value: 'percent' },
];

const etcUnits = [
  { label: 'in/day', value: 'inday' },
  { label: 'mm/day', value: 'mmday' },
  { label: 'cm/day', value: 'cmday' },
  { label: 'in/month', value: 'inmonth' },
  { label: 'mm/month', value: 'mmmonth' },
  { label: 'cm/month', value: 'cmmonth' },
];

const freqUnits = [
  { label: 'day', value: 'day' },
  { label: 'hr', value: 'hr' },
];

function convertAwcToInFt(value, unit) {
  switch (unit) {
    case 'inft': return value;
    case 'mmm': return value * 0.012;
    default: return value;
  }
}

function convertRzToFt(value, unit) {
  switch (unit) {
    case 'ft': return value;
    case 'm': return value * 3.28084;
    case 'cm': return value * 0.0328084;
    case 'mm': return value * 0.00328084;
    case 'in': return value / 12;
    default: return value;
  }
}

function convertMadToDecimal(value, unit) {
  switch (unit) {
    case 'decimal': return value;
    case 'percent': return value / 100;
    default: return value;
  }
}

function convertEtcToInDay(value, unit) {
  switch (unit) {
    case 'inday': return value;
    case 'mmday': return value * 0.0393701;
    case 'cmday': return value * 0.393701;
    case 'inmonth': return value / 30;
    case 'mmmonth': return (value * 0.0393701) / 30;
    case 'cmmonth': return (value * 0.393701) / 30;
    default: return value;
  }
}

function convertDayToOutputUnit(value, unit) {
  switch (unit) {
    case 'day': return value;
    case 'hr': return value * 24;
    default: return value;
  }
}

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Baseline settings data
const cropGroups = {
  leafy: { 
    label: 'Leafy & Shallow-Rooted Vegetables', 
    examples: 'Lettuce, spinach, leafy greens, herbs, onions, strawberries',
    rootDepth: 1.0, // ft
    mad: 0.30,
    etcModerate: 0.16 // in/day (≈ 4.0 mm/day)
  },
  fruiting: { 
    label: 'Fruiting & Tuber Vegetables', 
    examples: 'Tomato, pepper, cucumber, zucchini, potatoes, sweet potatoes',
    rootDepth: 1.5,
    mad: 0.40,
    etcModerate: 0.20 // in/day (≈ 5.0 mm/day)
  },
  cereals: { 
    label: 'Cereals & Row Crops', 
    examples: 'Maize, wheat, sorghum, beans, soybeans, cotton, peanuts',
    rootDepth: 2.5,
    mad: 0.50,
    etcModerate: 0.18 // in/day (≈ 4.5 mm/day)
  },
  vine: { 
    label: 'Vine Crops & Ground Crops', 
    examples: 'Pumpkin, watermelon, melon, squash',
    rootDepth: 2.0,
    mad: 0.50,
    etcModerate: 0.24 // in/day (≈ 6.0 mm/day)
  },
  orchards: { 
    label: 'Orchards & Tree Crops', 
    examples: 'Avocado, citrus, mango, coffee, nuts, bananas',
    rootDepth: 3.5,
    mad: 0.55,
    etcModerate: 0.28 // in/day (≈ 7.0 mm/day)
  },
  vineyards: { 
    label: 'Vineyards & Perennial Shrubs', 
    examples: 'Grapes, berries, olives',
    rootDepth: 3.0,
    mad: 0.50,
    etcModerate: 0.24 // in/day (≈ 6.0 mm/day)
  }
};

const soilTypes = {
  light: { label: 'Light / Sandy', awc: 1.0 }, // in/ft
  medium: { label: 'Medium / Loam', awc: 1.5 },
  heavy: { label: 'Heavy / Clay loam', awc: 2.0 }
};

const climateTypes = {
  cool: { label: 'Cool / Mild', multiplier: 0.8 },
  moderate: { label: 'Moderate', multiplier: 1.0 },
  hot: { label: 'Hot / Arid', multiplier: 1.2 }
};

const IrrigationFrequencyCalculator = () => {
  const [inputs, setInputs] = useState({
    awc: 1.5,
    awcUnit: 'inft',
    rz: 1.5,
    rzUnit: 'ft',
    mad: 0.40,
    madUnit: 'decimal',
    etc: 0.20,
    etcUnit: 'inday',
    freqUnit: 'day',
  });
  const [result, setResult] = useState(null);
  const [baselineOpen, setBaselineOpen] = useState(true);
  const [selectedSoilType, setSelectedSoilType] = useState('medium');
  const [selectedCropGroup, setSelectedCropGroup] = useState('fruiting');
  const [selectedClimate, setSelectedClimate] = useState('moderate');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: field.includes('Unit') ? value : Number(value),
    }));
  };

  const handleNumberInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  // Auto-apply when baseline settings change
  useEffect(() => {
    const soil = soilTypes[selectedSoilType];
    const crop = cropGroups[selectedCropGroup];
    const climate = climateTypes[selectedClimate];
    
    // Calculate ETc with climate adjustment
    const etcValue = crop.etcModerate * climate.multiplier;
    
    setInputs((prev) => ({
      ...prev,
      awc: soil.awc,
      rz: crop.rootDepth,
      mad: crop.mad,
      etc: parseFloat(etcValue.toFixed(3)),
    }));
  }, [selectedSoilType, selectedCropGroup, selectedClimate]);

  useEffect(() => {
    const awcInFt = convertAwcToInFt(inputs.awc, inputs.awcUnit);
    const rzFt = convertRzToFt(inputs.rz, inputs.rzUnit);
    const madDecimal = convertMadToDecimal(inputs.mad, inputs.madUnit);
    const etcInDay = convertEtcToInDay(inputs.etc, inputs.etcUnit);
    if (awcInFt <= 0 || rzFt <= 0 || madDecimal <= 0 || etcInDay <= 0) {
      setResult(null);
      return;
    }
    const freqDay = (awcInFt * rzFt * madDecimal) / etcInDay;
    const finalFreq = convertDayToOutputUnit(freqDay, inputs.freqUnit);
    setResult(finalFreq);
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Irrigation Frequency
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, mb: 2 }} align="center">
        Calculate the maximum interval allowed between irrigations based on soil type, root zone depth, and crop water use rate.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "With this soil and this crop, how many days can I wait between irrigations before the profile dries too much?"
      </Typography>

      {/* Baseline Settings Panel */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              🔹 Baseline Settings (Quick Setup)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setBaselineOpen(!baselineOpen)}
            >
              {baselineOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Select soil & crop type to auto-fill the fields below.
          </Typography>
          <Collapse in={baselineOpen}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12}>
                <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    💡 This has set:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                    <Typography component="li" variant="body2">
                      AWC = <strong>{soilTypes[selectedSoilType].awc} in/ft</strong>
                    </Typography>
                    <Typography component="li" variant="body2">
                      Root depth = <strong>{cropGroups[selectedCropGroup].rootDepth} ft</strong>
                    </Typography>
                    <Typography component="li" variant="body2">
                      MAD = <strong>{cropGroups[selectedCropGroup].mad}</strong>
                    </Typography>
                    <Typography component="li" variant="body2">
                      Crop water use = <strong>{(cropGroups[selectedCropGroup].etcModerate * climateTypes[selectedClimate].multiplier).toFixed(3)} in/day</strong> (≈ {(cropGroups[selectedCropGroup].etcModerate * climateTypes[selectedClimate].multiplier * 25.4).toFixed(1)} mm/day)
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
              label="Soil's Available Water Holding Capacity"
              type="number"
              value={inputs.awc}
              onChange={handleNumberInputChange('awc')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Available Water Unit</InputLabel>
            <Select
              value={inputs.awcUnit}
              label="Available Water Unit"
              onChange={handleInputChange('awcUnit')}
            >
              {awcUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Root Zone Depth"
              type="number"
              value={inputs.rz}
              onChange={handleNumberInputChange('rz')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Root Zone Depth Unit</InputLabel>
            <Select
              value={inputs.rzUnit}
              label="Root Zone Depth Unit"
              onChange={handleInputChange('rzUnit')}
            >
              {rzUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Management Allowable Depletion"
              type="number"
              value={inputs.mad}
              onChange={handleNumberInputChange('mad')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Management Allowable Depletion Unit</InputLabel>
            <Select
              value={inputs.madUnit}
              label="Management Allowable Depletion Unit"
              onChange={handleInputChange('madUnit')}
            >
              {madUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Crop Water Use Rate"
              type="number"
              value={inputs.etc}
              onChange={handleNumberInputChange('etc')}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Crop Water Use Unit</InputLabel>
            <Select
              value={inputs.etcUnit}
              label="Crop Water Use Unit"
              onChange={handleInputChange('etcUnit')}
            >
              {etcUnits.map((u) => (
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
              {result.toFixed(2)}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.freqUnit}
                onChange={handleInputChange('freqUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {freqUnits.map((u) => (
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
          <Box sx={{ ...fontFormula, fontSize: 24, whiteSpace: 'nowrap' }}>
            F = (AWC &times; Rz &times; MAD) / ETc
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>F</b> = Suggested irrigation frequency (day)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>AWC</b> = Soil's available water holding capacity (in/ft)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Rz</b> = Root Zone Depth (ft)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>MAD</b> = Management Allowable Depletion
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>ETc</b> = Crop water use rate (in/day)
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

export default IrrigationFrequencyCalculator; 
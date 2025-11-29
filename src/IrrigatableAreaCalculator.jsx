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

const capacityUnits = [
  { label: 'GPM', value: 'gpm' },
  { label: 'LPS', value: 'lps' },
];

const waterNeedsUnits = [
  { label: 'in/day', value: 'in/day' },
  { label: 'mm/day', value: 'mm/day' },
];

const timeUnits = [
  { label: 'Hours', value: 'hr' },
  { label: 'Minutes', value: 'min' },
  { label: 'Seconds', value: 'sec' },
];

const areaUnits = [
  { label: 'Square Feet', value: 'sq. ft' },
  { label: 'Acres', value: 'acres' },
  { label: 'Hectares', value: 'hectares' },
  { label: 'Square Meters', value: 'sq. meters' },
  { label: 'Square Yards', value: 'sq. yd' },
  { label: 'Square Kilometers', value: 'sq. km' },
  { label: 'Square Miles', value: 'sq. mile' },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 20, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Baseline settings data
const cropGroups = {
  vegetables: { label: 'Vegetables', waterNeedHot: 0.28, waterNeedModerate: 0.20, waterNeedCool: 0.15 },
  cereals: { label: 'Cereals & Row Crops', waterNeedHot: 0.30, waterNeedModerate: 0.22, waterNeedCool: 0.15 },
  fruit: { label: 'Fruit Trees / Orchards', waterNeedHot: 0.35, waterNeedModerate: 0.25, waterNeedCool: 0.18 },
  pasture: { label: 'Pasture / Forage', waterNeedHot: 0.30, waterNeedModerate: 0.20, waterNeedCool: 0.12 }
};

const climateTypes = {
  cool: { label: 'Cool / Humid', multiplier: 1.0 },
  moderate: { label: 'Temperate / Moderate', multiplier: 1.0 },
  hot: { label: 'Hot / Arid', multiplier: 1.0 }
};

const systemTypes = {
  drip: { label: 'Drip / Subsurface drip', efficiency: 90, hours: 16, hoursRange: '12-20' },
  micro: { label: 'Micro-sprinklers', efficiency: 85, hours: 16, hoursRange: '12-20' },
  sprinkler: { label: 'Sprinklers / Center pivots', efficiency: 80, hours: 20, hoursRange: '18-24' },
  solid: { label: 'Solid-set sprinklers (rotated)', efficiency: 80, hours: 12, hoursRange: '8-16' },
  surface: { label: 'Furrow / Flood', efficiency: 60, hours: 12, hoursRange: '8-16' }
};

const IrrigatableAreaCalculator = () => {
  const [inputs, setInputs] = useState({
    systemCapacity: '',
    waterNeeds: '',
    operationHours: '16',
    systemEfficiency: 80,
    capacityUnit: capacityUnits[0].value,
    waterNeedsUnit: waterNeedsUnits[0].value,
    operationHoursUnit: timeUnits[0].value,
    areaUnit: areaUnits[1].value // Default to acres
  });

  const [result, setResult] = useState(null);
  const [baselineOpen, setBaselineOpen] = useState(true);
  const [selectedCropGroup, setSelectedCropGroup] = useState('cereals');
  const [selectedClimate, setSelectedClimate] = useState('moderate');
  const [selectedSystemType, setSelectedSystemType] = useState('sprinkler');

  const handleNumberInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs(prev => ({
      ...prev,
      [field]: field === 'systemEfficiency' ? Number(value) : Number(value)
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
    
    // Calculate water need based on crop and climate
    let waterNeed;
    if (climate.label.includes('Cool') || climate.label.includes('Humid')) {
      waterNeed = crop.waterNeedCool;
    } else if (climate.label.includes('Hot') || climate.label.includes('Arid')) {
      waterNeed = crop.waterNeedHot;
    } else {
      waterNeed = crop.waterNeedModerate;
    }
    
    setInputs((prev) => ({
      ...prev,
      waterNeeds: parseFloat(waterNeed.toFixed(3)).toString(),
      systemEfficiency: system.efficiency,
      operationHours: system.hours.toString(),
    }));
  }, [selectedCropGroup, selectedClimate, selectedSystemType]);

  // Get system capacity in GPM for sanity check
  const getCapacityInGpm = () => {
    if (!inputs.systemCapacity) return null;
    let capacityInGpm = parseFloat(inputs.systemCapacity);
    if (inputs.capacityUnit === 'lps') {
      capacityInGpm = capacityInGpm * 15.85;
    }
    return capacityInGpm;
  };

  const capacityGpm = getCapacityInGpm();

  // Get result in acres for interpretation
  const getResultInAcres = () => {
    if (result === null) return null;
    if (inputs.areaUnit === 'acres') return result;
    if (inputs.areaUnit === 'hectares') return result * 2.47105;
    if (inputs.areaUnit === 'sq. ft') return result / 43560;
    if (inputs.areaUnit === 'sq. meters') return (result / 4046.86);
    if (inputs.areaUnit === 'sq. yd') return result / 4840;
    if (inputs.areaUnit === 'sq. km') return result * 247.105;
    if (inputs.areaUnit === 'sq. mile') return result * 640;
    return result;
  };

  const resultAcres = getResultInAcres();

  useEffect(() => {
    calculateArea();
  }, [inputs]);

  const calculateArea = () => {
    const { systemCapacity, waterNeeds, operationHours, systemEfficiency } = inputs;
    
    if (!systemCapacity || !waterNeeds || !operationHours || systemEfficiency <= 0) {
      setResult(null);
      return;
    }

    // Convert all units to consistent base units
    let capacityInGpm = systemCapacity;
    if (inputs.capacityUnit === 'lps') {
      capacityInGpm = systemCapacity * 15.85; // Convert L/s to GPM
    }

    let waterNeedsInInches = waterNeeds;
    if (inputs.waterNeedsUnit === 'mm/day') {
      waterNeedsInInches = waterNeeds * 0.0393701; // Convert mm to inches
    }

    let hours = operationHours;
    if (inputs.operationHoursUnit === 'min') {
      hours = operationHours / 60;
    } else if (inputs.operationHoursUnit === 'sec') {
      hours = operationHours / 3600;
    }

    const efficiencyDecimal = systemEfficiency / 100;

    // Formula: Area (sq ft) = (96.25 * S * hrs * E) / Wn
    const area = (96.25 * capacityInGpm * hours * efficiencyDecimal) / waterNeedsInInches;

    // Convert to selected area unit
    let finalArea = area;
    switch (inputs.areaUnit) {
      case 'acres':
        finalArea = area / 43560; // 1 acre = 43,560 sq ft
        break;
      case 'hectares':
        finalArea = area / 107639; // 1 hectare = 107,639 sq ft
        break;
      case 'sq. meters':
        finalArea = area * 0.092903; // 1 sq ft = 0.092903 sq meters
        break;
      case 'sq. yd':
        finalArea = area / 9; // 1 sq yd = 9 sq ft
        break;
      case 'sq. km':
        finalArea = area * 0.000000092903; // 1 sq ft = 0.000000092903 sq km
        break;
      case 'sq. mile':
        finalArea = area * 0.0000000358701; // 1 sq ft = 0.0000000358701 sq miles
        break;
      default:
        finalArea = area; // sq. ft
    }

    setResult(finalArea);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Irrigatable Area
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, mb: 2 }} align="center">
        Calculate the land area that can be irrigated with a given flow of water. The minimum system capacity is the available water from the supply, and water needs is the peak crop water requirement during a specific time period.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "With this pump/system and this crop water need, how much land can I realistically irrigate?"
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
            Select crop group and climate to get suggested Water Need (Wn) for peak season, which you can edit.
          </Typography>
          <Collapse in={baselineOpen}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Crop Group</InputLabel>
                  <Select
                    value={selectedCropGroup}
                    label="Crop Group"
                    onChange={(e) => setSelectedCropGroup(e.target.value)}
                  >
                    <MenuItem value="vegetables">{cropGroups.vegetables.label}</MenuItem>
                    <MenuItem value="cereals">{cropGroups.cereals.label}</MenuItem>
                    <MenuItem value="fruit">{cropGroups.fruit.label}</MenuItem>
                    <MenuItem value="pasture">{cropGroups.pasture.label}</MenuItem>
                  </Select>
                </FormControl>
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
                    <MenuItem value="micro">{systemTypes.micro.label}</MenuItem>
                    <MenuItem value="sprinkler">{systemTypes.sprinkler.label}</MenuItem>
                    <MenuItem value="solid">{systemTypes.solid.label}</MenuItem>
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
                      Water Need (Wn): <strong>{inputs.waterNeeds || '0.20'} in/day</strong> (≈ {((parseFloat(inputs.waterNeeds) || 0.20) * 25.4).toFixed(1)} mm/day) - peak crop water use
                    </Typography>
                    <Typography component="li" variant="body2">
                      System Efficiency: <strong>{inputs.systemEfficiency}%</strong> (typical for {systemTypes[selectedSystemType].label.toLowerCase()})
                    </Typography>
                    <Typography component="li" variant="body2">
                      Operation Hours: <strong>{inputs.operationHours} hrs/day</strong> (typical range: {systemTypes[selectedSystemType].hoursRange} hrs/day)
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
              label="System Capacity (Supply)"
              type="number"
              value={inputs.systemCapacity}
              onChange={handleNumberInputChange('systemCapacity')}
              helperText="Enter the average flow that actually reaches the field (not pump nameplate). If you have multiple blocks, use the flow available for this block when it's irrigating."
            />
          </FormControl>
          {capacityGpm !== null && (
            <Alert 
              severity={capacityGpm < 5 ? 'warning' : capacityGpm > 800 ? 'warning' : 'info'}
              sx={{ mt: 1, backgroundColor: capacityGpm < 5 || capacityGpm > 800 ? '#fff3cd' : '#e3f2fd' }}
            >
              <Typography variant="body2">
                {capacityGpm < 5 && <>Very low flow – only suitable for small areas or a few beds.</>}
                {capacityGpm > 800 && <>Very high flow – check units and decimal point.</>}
                {capacityGpm >= 5 && capacityGpm <= 800 && (
                  <>Tip: Small systems: 10–40 gpm. Medium farms: 40–150 gpm. Large pivots: 150–800+ gpm.</>
                )}
              </Typography>
            </Alert>
          )}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Capacity Unit</InputLabel>
            <Select
              value={inputs.capacityUnit}
              label="Capacity Unit"
              onChange={handleInputChange('capacityUnit')}
            >
              {capacityUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Water Needs"
              type="number"
              value={inputs.waterNeeds}
              onChange={handleNumberInputChange('waterNeeds')}
              helperText="Peak crop water use per day (ETc). Typical range is 0.15–0.30 in/day (≈ 4–8 mm/day). Choose crop & climate above to get a suggested value."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Water Needs Unit</InputLabel>
            <Select
              value={inputs.waterNeedsUnit}
              label="Water Needs Unit"
              onChange={handleInputChange('waterNeedsUnit')}
            >
              {waterNeedsUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Operation Hours Per Day"
              type="number"
              value={inputs.operationHours}
              onChange={handleNumberInputChange('operationHours')}
              helperText="How many hours per day can you realistically run this system during peak season? Most systems operate between 12 and 20 hours/day in peak conditions."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Time Unit</InputLabel>
            <Select
              value={inputs.operationHoursUnit}
              label="Time Unit"
              onChange={handleInputChange('operationHoursUnit')}
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
              label="System Efficiency (%)"
              type="number"
              value={inputs.systemEfficiency}
              onChange={handleNumberInputChange('systemEfficiency')}
              helperText="Use 90% for drip, 80–85% for sprinklers, 60% for surface irrigation if unsure."
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
              {result.toFixed(2)}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.areaUnit}
                onChange={handleInputChange('areaUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 120 }}
              >
                {areaUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Result Interpretation */}
          {resultAcres !== null && (
            <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
              <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Interpretation
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  This is the maximum area you can irrigate at <strong>Wn = {inputs.waterNeeds} in/day</strong> with <strong>S = {inputs.systemCapacity} {inputs.capacityUnit}</strong>, <strong>{inputs.operationHours} hrs/day</strong>, and <strong>{inputs.systemEfficiency}% efficiency</strong>.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  If your actual farm area is larger than this, you will need:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                  <Typography component="li" variant="body2">More flow, or</Typography>
                  <Typography component="li" variant="body2">More hours per day, or</Typography>
                  <Typography component="li" variant="body2">Lower water use (e.g., deficit irrigation or lower ET period).</Typography>
                </Box>
              </Alert>
            </Box>
          )}
        </Box>
      )}

      {/* Formula centered, below result */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 1 }} align="center">
          Formula:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ ...fontFormula, fontSize: 24, whiteSpace: 'nowrap' }}>
            A = (96.25 &times; S &times; hrs &times; E) / Wn
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>A</b> = Irrigatable Area (sq. ft)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>S</b> = Minimum system capacity, or supply (gpm)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Wn</b> = Water needs (in/day)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>hrs</b> = Operation hours per day (hrs)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>E</b> = System Efficiency (as a decimal)
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

export default IrrigatableAreaCalculator; 
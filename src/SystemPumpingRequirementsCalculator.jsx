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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const netAppUnits = [
  { label: 'in', value: 'in', toIn: 1 },
  { label: 'ft', value: 'ft', toIn: 12 },
  { label: 'mm', value: 'mm', toIn: 0.0393701 },
  { label: 'cm', value: 'cm', toIn: 0.393701 },
  { label: 'm', value: 'm', toIn: 39.3701 },
];
const areaUnits = [
  { label: 'acres', value: 'acres', toAcres: 1 },
  { label: 'hectares', value: 'hectares', toAcres: 2.47105 },
  { label: 'sq. ft', value: 'sqft', toAcres: 1 / 43560 },
  { label: 'sq. m', value: 'sqm', toAcres: 0.000247105 },
  { label: 'sq. miles', value: 'sqmiles', toAcres: 640 },
];
const hrsUnits = [
  { label: 'hours', value: 'hours' },
];
const daysUnits = [
  { label: 'days', value: 'days' },
];
const effUnits = [
  { label: '%', value: 'percent' },
  { label: 'decimal', value: 'decimal' },
];
const outputUnits = [
  { label: 'gpm', value: 'gpm', fromGpm: 1 },
  { label: 'lpm', value: 'lpm', fromGpm: 3.78541 },
  { label: 'lps', value: 'lps', fromGpm: 0.0630902 },
  { label: 'cms', value: 'cms', fromGpm: 0.0000630902 },
  { label: 'cfs', value: 'cfs', fromGpm: 1 / 448.831 },
  { label: 'acre-in/day', value: 'acreinday', fromGpm: 1 / 18.857 },
  { label: 'acre-in/hour', value: 'acreinhour', fromGpm: 1 / 452.57 },
  { label: 'acre-ft/day', value: 'acreftday', fromGpm: 1 / 226.6 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };
const fontVar = { fontWeight: 700, color: '#8cb43a' };

// Baseline settings data
const cropGroups = {
  vegetables: { label: 'Vegetables', netAppHot: 2.0, netAppModerate: 1.5, netAppCool: 1.0 },
  cereals: { label: 'Cereals & Row Crops', netAppHot: 2.0, netAppModerate: 1.2, netAppCool: 0.9 },
  fruit: { label: 'Fruit Trees / Orchards', netAppHot: 1.8, netAppModerate: 1.3, netAppCool: 1.0 },
  pasture: { label: 'Pasture / Forage', netAppHot: 1.8, netAppModerate: 1.2, netAppCool: 0.75 }
};

const climateTypes = {
  cool: { label: 'Cool / Humid', range: '0.75–1.25 in/week (≈ 20–30 mm/week)' },
  moderate: { label: 'Temperate / Moderate', range: '1.0–1.75 in/week (≈ 25–45 mm/week)' },
  hot: { label: 'Hot / Arid', range: '1.5–2.5 in/week (≈ 40–65 mm/week)' }
};

const systemTypes = {
  drip: { label: 'Drip / Subsurface drip', efficiency: 90, hours: 16, hoursRange: '12–20' },
  micro: { label: 'Micro-sprinklers', efficiency: 85, hours: 16, hoursRange: '12–20' },
  sprinkler: { label: 'Pivots / Sprinklers', efficiency: 80, hours: 20, hoursRange: '18–24' },
  solid: { label: 'Rotational sprinklers / Limited power', efficiency: 80, hours: 12, hoursRange: '8–16' },
  surface: { label: 'Furrow / Flood', efficiency: 60, hours: 12, hoursRange: '8–16' }
};

function calculateQ({ netApp, netAppUnit, area, areaUnit, hrs, days, eff, effUnit }) {
  if (!netApp || !area || !hrs || !days || !eff) return null;
  
  const netAppConvFactor = netAppUnits.find(u => u.value === netAppUnit).toIn;
  const areaConvFactor = areaUnits.find(u => u.value === areaUnit).toAcres;
  const effValue = effUnit === 'percent' ? eff / 100 : eff;

  const netAppIn = netApp * netAppConvFactor;
  const areaAcres = area * areaConvFactor;

  if (hrs <= 0 || days <= 0 || effValue <= 0) return null;

  const Q = (27154 * netAppIn * areaAcres) / (60 * hrs * days * effValue);
  return Q;
}

function convertGpmToOutputUnit(value, unit) {
  const outputConvFactor = outputUnits.find(u => u.value === unit).fromGpm;
  return value * outputConvFactor;
}

const SystemPumpingRequirementsCalculator = () => {
  const [inputs, setInputs] = useState({
    netApp: '1.5',
    netAppUnit: 'in',
    area: '',
    areaUnit: 'acres',
    hrs: '16',
    hrsUnit: 'hours',
    days: '7',
    daysUnit: 'days',
    eff: '80',
    effUnit: 'percent',
    outputUnit: 'gpm',
  });
  const [result, setResult] = useState(null);
  const [baselineOpen, setBaselineOpen] = useState(true);
  const [selectedCropGroup, setSelectedCropGroup] = useState('cereals');
  const [selectedClimate, setSelectedClimate] = useState('moderate');
  const [selectedSystemType, setSelectedSystemType] = useState('sprinkler');

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-apply when baseline settings change
  useEffect(() => {
    const crop = cropGroups[selectedCropGroup];
    const system = systemTypes[selectedSystemType];
    
    // Calculate net application based on crop and climate
    let netApp;
    if (selectedClimate === 'cool') {
      netApp = crop.netAppCool;
    } else if (selectedClimate === 'hot') {
      netApp = crop.netAppHot;
    } else {
      netApp = crop.netAppModerate;
    }
    
    setInputs((prev) => ({
      ...prev,
      netApp: parseFloat(netApp.toFixed(2)).toString(),
      eff: system.efficiency.toString(),
      hrs: system.hours.toString(),
      days: '7', // Default to 7 days for peak design
    }));
  }, [selectedCropGroup, selectedClimate, selectedSystemType]);

  useEffect(() => {
    const q = calculateQ({
      netApp: parseFloat(inputs.netApp),
      netAppUnit: inputs.netAppUnit,
      area: parseFloat(inputs.area),
      areaUnit: inputs.areaUnit,
      hrs: parseFloat(inputs.hrs),
      days: parseFloat(inputs.days),
      eff: parseFloat(inputs.eff),
      effUnit: inputs.effUnit,
    });
    if (q === null || isNaN(q)) {
      setResult(null);
      return;
    }
    const val = convertGpmToOutputUnit(q, inputs.outputUnit);
    setResult(val);
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        System Pumping Requirements
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the total flow rate required to operate your irrigation system.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "What total flow (gpm) does my pump/system need to irrigate this whole area in time?"
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
            Select crop group, climate, and system type to get suggested values for peak season, which you can edit.
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
                <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block' }}>
                  Typical range: {climateTypes[selectedClimate].range}
                </Typography>
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
                      Net application: <strong>{inputs.netApp} in/week</strong> (≈ {(parseFloat(inputs.netApp) * 25.4).toFixed(1)} mm/week) - peak weekly crop water requirement
                    </Typography>
                    <Typography component="li" variant="body2">
                      System Efficiency: <strong>{inputs.eff}%</strong> (typical for {systemTypes[selectedSystemType].label.toLowerCase()})
                    </Typography>
                    <Typography component="li" variant="body2">
                      Hours per day: <strong>{inputs.hrs} hrs/day</strong> (typical range: {systemTypes[selectedSystemType].hoursRange} hrs/day)
                    </Typography>
                    <Typography component="li" variant="body2">
                      Days per week: <strong>{inputs.days} days/week</strong> (use 7 for peak design, or fewer if limited by power/water restrictions)
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
              label="Net application required per week"
              type="number"
              value={inputs.netApp}
              onChange={handleInputChange('netApp')}
              helperText="Peak weekly crop water requirement. Typical range is 1.0–2.0 in/week (≈ 25–50 mm/week) depending on crop and climate. If unsure, start with 1.5 in/week."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Net Application Unit</InputLabel>
            <Select
              value={inputs.netAppUnit}
              label="Net Application Unit"
              onChange={handleInputChange('netAppUnit')}
            >
              {netAppUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Total area to be irrigated"
              type="number"
              value={inputs.area}
              onChange={handleInputChange('area')}
              helperText="Enter the total area served by this pumping system or block. If you irrigate in blocks, use the largest block area that may run at once. (1 ha ≈ 2.47 acres)"
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
              label="Total Hours Available to Operate per Day"
              type="number"
              value={inputs.hrs}
              onChange={handleInputChange('hrs')}
              helperText="How many hours per day will this system realistically run in peak season? Most systems operate 12–20 h/day in peak season. If unsure, use 16 h/day as a realistic starting point."
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Total Days Available to Operate per Week"
              type="number"
              value={inputs.days}
              onChange={handleInputChange('days')}
              helperText="On how many days per week can this system run during peak demand? Use 7 days/week for design, or fewer if you are limited by power or water restrictions."
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Irrigation Efficiency"
              type="number"
              value={inputs.eff}
              onChange={handleInputChange('eff')}
              helperText="Use 90% for drip, 80–85% for sprinklers/pivots, 60% for surface irrigation if unsure. You can refine later when you know your system losses better."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Efficiency Unit</InputLabel>
            <Select
              value={inputs.effUnit}
              label="Efficiency Unit"
              onChange={handleInputChange('effUnit')}
            >
              {effUnits.map((u) => (
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
              {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.outputUnit}
                onChange={handleInputChange('outputUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 120 }}
              >
                {outputUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Result Interpretation */}
          <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
            <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Interpretation
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                This is the total average flow needed to apply <strong>{inputs.netApp} in/week</strong> over <strong>{inputs.area || 'X'} {inputs.areaUnit}</strong> in <strong>{inputs.hrs} h/day</strong>, <strong>{inputs.days} days/week</strong>, at <strong>{inputs.eff}% efficiency</strong>.
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                If your existing pump delivers less than this, you will need:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                <Typography component="li" variant="body2">More hours per day, or</Typography>
                <Typography component="li" variant="body2">Reduce irrigated area, or</Typography>
                <Typography component="li" variant="body2">Reduce net application depth (deficit irrigation).</Typography>
              </Box>
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
          <Box sx={{ ...fontFormula, fontSize: 24, whiteSpace: 'nowrap', overflowX: 'auto', p: 1 }}>
            Q = (27154 &times; Net_app &times; A) / (60 &times; Hrs &times; Days &times; E)
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>Q</b> = Total flow rate required (gpm)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Net_app</b> = Net application per week (in)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>A</b> = Total area to be irrigated (acres)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Hrs</b> = Hours available per day (hrs)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Days</b> = Days available per week (days)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>E</b> = Irrigation system efficiency (decimal)
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

export default SystemPumpingRequirementsCalculator; 
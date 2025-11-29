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

const pressureUnits = [
  { label: 'psi', toPsi: 1, toMeter: 0.70307 },
  { label: 'kPa', toPsi: 0.145038, toMeter: 0.10197 },
  { label: 'feet of water', toPsi: 0.433527, toMeter: 0.3048 },
  { label: 'm of water', toPsi: 1.42233, toMeter: 1 },
  { label: 'bar', toPsi: 14.5038, toMeter: 10 },
];

const flowUnits = [
  { label: 'gpm', toGpm: 1, toLps: 0.06309 },
  { label: 'cfs', toGpm: 448.831, toLps: 28.3168 },
  { label: 'acre-in/day', toGpm: 18.857, toLps: 1.191 },
  { label: 'acre-in/hour', toGpm: 452.57, toLps: 28.57 },
  { label: 'acre-ft/day', toGpm: 226.6, toLps: 14.32 },
  { label: 'lps', toGpm: 15.8503, toLps: 1 },
  { label: 'lpm', toGpm: 0.264172, toLps: 0.01667 },
  { label: 'cms', toGpm: 15850.3, toLps: 1000 },
  { label: 'cu. m/hr', toGpm: 4.40287, toLps: 0.27778 },
];

const efficiencyUnits = [
  { label: '%', toDecimal: 0.01 },
  { label: 'decimal', toDecimal: 1 },
];

const powerUnits = [
  { label: 'HP', factor: 1 },
  { label: 'kW', factor: 0.7457 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 20, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// System type benchmarks for pressure
const systemTypes = {
  drip: { label: 'Drip / SDI', pressure: 20, pressureRange: '15–25 psi', flowRange: '20–100 gpm' },
  micro: { label: 'Micro-sprinklers', pressure: 30, pressureRange: '25–40 psi', flowRange: '20–100 gpm' },
  sprinkler: { label: 'Solid-set / Hand-move sprinklers', pressure: 45, pressureRange: '30–60 psi', flowRange: '100–600 gpm' },
  pivot: { label: 'Center pivots', pressure: 50, pressureRange: '40–60 psi', flowRange: '100–600 gpm' },
  biggun: { label: 'Big gun / Traveling gun', pressure: 100, pressureRange: '80–120 psi', flowRange: '100–600 gpm' }
};

const RequiredWaterPumpHorsepowerCalculator = () => {
  const [inputs, setInputs] = useState({
    pressure: '45',
    pressureUnit: pressureUnits[0].label,
    flow: '',
    flowUnit: flowUnits[0].label,
    pumpEff: '70',
    pumpEffUnit: efficiencyUnits[0].label,
    motorEff: '90',
    motorEffUnit: efficiencyUnits[0].label,
    outputUnit: powerUnits[0].label
  });
  const [systemTypeHelperOpen, setSystemTypeHelperOpen] = useState(false);
  const [selectedSystemType, setSelectedSystemType] = useState('sprinkler');

  const [results, setResults] = useState({
    bhp: null,
    totalPower: null,
    bhpKW: null,
    totalPowerKW: null
  });

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

  // Apply system type pressure suggestion
  const applySystemTypePressure = () => {
    const system = systemTypes[selectedSystemType];
    setInputs((prev) => ({
      ...prev,
      pressure: system.pressure.toString(),
    }));
  };

  // Auto-apply when system type changes
  useEffect(() => {
    if (selectedSystemType) {
      applySystemTypePressure();
    }
  }, [selectedSystemType]);

  // Calculate water horsepower for result interpretation
  const calculateWaterHorsepower = () => {
    if (!inputs.pressure || !inputs.flow) return null;
    
    const pU = pressureUnits.find(u => u.label === inputs.pressureUnit);
    const fU = flowUnits.find(u => u.label === inputs.flowUnit);
    
    const flowGPM = parseFloat(inputs.flow) * fU.toGpm;
    const totalHeadFt = (parseFloat(inputs.pressure) * pU.toPsi) * 2.31;
    
    return (flowGPM * totalHeadFt) / 3960;
  };

  const whp = calculateWaterHorsepower();

  // Get recommended motor size (next standard size up)
  const getRecommendedMotorSize = (totalPower) => {
    if (!totalPower || totalPower === null) return null;
    const standardSizes = [1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500];
    const totalHP = totalPower;
    const recommended = standardSizes.find(size => size >= totalHP * 1.1); // 10% safety margin
    return recommended || Math.ceil(totalHP * 1.1 / 5) * 5; // Round up to nearest 5 HP if beyond standard sizes
  };

  useEffect(() => {
    calculatePower();
  }, [inputs]);

  const calculatePower = () => {
    const { pressure, flow, pumpEff, motorEff } = inputs;

    if (!pressure || !flow || !pumpEff || !motorEff || Number(pumpEff) <= 0 || Number(motorEff) <= 0) {
      setResults({ bhp: null, totalPower: null });
      return;
    }

    const pU = pressureUnits.find(u => u.label === inputs.pressureUnit);
    const fU = flowUnits.find(u => u.label === inputs.flowUnit);
    const pumpE = parseFloat(pumpEff) / 100;
    const motorE = parseFloat(motorEff) / 100;

    const flowGPM = parseFloat(flow) * fU.toGpm;
    const totalHeadFt = (parseFloat(pressure) * pU.toPsi) * 2.31; // 1 psi = 2.31 ft of head

    const waterHorsepower = (flowGPM * totalHeadFt) / 3960;
    const brakeHorsepower = waterHorsepower / pumpE;
    const totalPower = brakeHorsepower / motorE;

    setResults({
      bhp: brakeHorsepower,
      totalPower: totalPower,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Required Water Pump Horsepower
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Estimate the brake horsepower and total power requirements of the electric motor used to power an irrigation water pump.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This tool answers: "Given this flow and pressure, what pump horsepower do I really need?"
      </Typography>

      {/* System Type Helper */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              💡 System Type Helper (Optional)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setSystemTypeHelperOpen(!systemTypeHelperOpen)}
            >
              {systemTypeHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Select your system type to get suggested pressure values.
          </Typography>
          <Collapse in={systemTypeHelperOpen}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                <Typography variant="caption" sx={{ color: '#888', mt: 0.5, display: 'block' }}>
                  Typical pressure: {systemTypes[selectedSystemType].pressureRange}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                  <Typography variant="body2">
                    This has set pressure to <strong>{systemTypes[selectedSystemType].pressure} psi</strong> (typical for {systemTypes[selectedSystemType].label.toLowerCase()}). You can adjust this value in the form below.
                  </Typography>
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
              label="Pressure"
              type="number"
              value={inputs.pressure}
              onChange={handleNumberInputChange('pressure')}
              helperText="Total discharge pressure required at the pump (operating pressure + elevation + friction). Typical ranges: 15–25 psi (drip), 25–40 psi (micro/sprinklers), 40–60 psi (pivots), 80–120 psi (big guns). If you only know operating pressure at the field, add 5–15 psi for losses."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Pressure Unit</InputLabel>
            <Select
              value={inputs.pressureUnit}
              label="Pressure Unit"
              onChange={handleInputChange('pressureUnit')}
            >
              {pressureUnits.map((u) => (
                <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate"
              type="number"
              value={inputs.flow}
              onChange={handleNumberInputChange('flow')}
              helperText="Required system flow in gpm. Use the value from 'System Pumping Requirements' if available. Typical: Small systems 20–100 gpm, Medium farms 100–600 gpm, Large schemes 600+ gpm."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Flow Rate Unit</InputLabel>
            <Select
              value={inputs.flowUnit}
              label="Flow Rate Unit"
              onChange={handleInputChange('flowUnit')}
            >
              {flowUnits.map((u) => (
                <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Pump Efficiency"
              type="number"
              value={inputs.pumpEff}
              onChange={handleNumberInputChange('pumpEff')}
              helperText="Hydraulic efficiency of the pump. Typical range 65–80%. If unsure, use 70% (conservative) or 80% for a good modern pump."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Pump Efficiency Unit</InputLabel>
            <Select
              value={inputs.pumpEffUnit}
              label="Pump Efficiency Unit"
              onChange={handleInputChange('pumpEffUnit')}
            >
              {efficiencyUnits.map((u) => (
                <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Drive Motor Efficiency"
              type="number"
              value={inputs.motorEff}
              onChange={handleNumberInputChange('motorEff')}
              helperText="Efficiency of the electric motor or engine driving the pump. Most modern electric motors are 88–94% efficient. If unsure, use 90–92%."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Motor Efficiency Unit</InputLabel>
            <Select
              value={inputs.motorEffUnit}
              label="Motor Efficiency Unit"
              onChange={handleInputChange('motorEffUnit')}
            >
              {efficiencyUnits.map((u) => (
                <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results below input fields */}
      {results.bhp !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {/* Brake Horsepower Result */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ ...fontSection, mb: 1 }} align="center">
              Brake Horsepower:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
              <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
                {inputs.outputUnit === 'HP' ? results.bhp.toFixed(2) : (results.bhp * 0.7457).toFixed(2)}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#8cb43a', fontSize: 24 }}>
                {inputs.outputUnit}
              </Typography>
            </Box>
          </Box>
          
          {/* Total Power Requirement Result */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ ...fontSection, mb: 1 }} align="center">
              Total Power Requirements:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
              <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
                {inputs.outputUnit === 'HP' ? results.totalPower.toFixed(2) : (results.totalPower * 0.7457).toFixed(2)}
              </Typography>
              <Typography sx={{ fontWeight: 700, color: '#8cb43a', fontSize: 24 }}>
                {inputs.outputUnit}
              </Typography>
            </Box>
          </Box>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Output Unit</InputLabel>
            <Select
              value={inputs.outputUnit}
              label="Output Unit"
              onChange={handleInputChange('outputUnit')}
            >
              {powerUnits.map((u) => (
                <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Result Interpretation */}
          <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
            <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Interpretation
              </Typography>
              {whp !== null && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Water horsepower (WHP): <strong>{whp.toFixed(2)} HP</strong>
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Brake horsepower (BHP): <strong>{inputs.outputUnit === 'HP' ? results.bhp.toFixed(2) : (results.bhp * 0.7457).toFixed(2)} {inputs.outputUnit}</strong>
              </Typography>
              {getRecommendedMotorSize(results.totalPower) && (
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  • <strong>Recommended motor size: {getRecommendedMotorSize(results.totalPower)} HP</strong>
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 0.5, mt: 1 }}>
                This pump needs to deliver <strong>{inputs.flow} {inputs.flowUnit}</strong> at <strong>{inputs.pressure} {inputs.pressureUnit}</strong>, with <strong>{inputs.pumpEff}% pump efficiency</strong> and <strong>{inputs.motorEff}% motor efficiency</strong>.
              </Typography>
              {getRecommendedMotorSize(results.totalPower) && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                  Choose the next larger standard motor size (e.g. {getRecommendedMotorSize(results.totalPower)} HP) to avoid overloading.
                </Typography>
              )}
            </Alert>
          </Box>
        </Box>
      )}

      {/* Formula centered, below result */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 1 }} align="center">
          Formulas:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Box sx={{ ...fontFormula, fontSize: '20px', whiteSpace: 'nowrap' }}>
            WHP = (Q &times; H) / 3960
          </Box>
          <Box sx={{ ...fontFormula, fontSize: '20px', whiteSpace: 'nowrap' }}>
            BHP = WHP / Pump Efficiency
          </Box>
          <Box sx={{ ...fontFormula, fontSize: '20px', whiteSpace: 'nowrap' }}>
            Motor HP = BHP / Motor Efficiency
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}>
              <b>WHP</b> = Water Horsepower
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>BHP</b> = Brake Horsepower
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Motor HP</b> = Total Power Requirement
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>Q</b> = Flow Rate (gpm)
            </Typography>
            <Typography sx={{ fontSize: 16 }}>
              <b>H</b> = Total Head (ft)
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

export default RequiredWaterPumpHorsepowerCalculator; 
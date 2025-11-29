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
} from '@mui/material';
import BackButton from './BackButton';

const appRateUnits = [
  { label: 'in/hr', value: 'inhr', toInHr: v => v },
  { label: 'mm/hr', value: 'mmhr', toInHr: v => v / 25.4 },
  { label: 'in/day', value: 'inday', toInHr: v => v / 24 },
  { label: 'mm/day', value: 'mmday', toInHr: v => v / (25.4 * 24) },
  { label: 'cm/hr', value: 'cmhr', toInHr: v => v / 2.54 },
  { label: 'cm/day', value: 'cmday', toInHr: v => v / (2.54 * 24) },
];
const pressureUnits = [
  { label: 'psi', value: 'psi', toPsi: v => v },
  { label: 'bar', value: 'bar', toPsi: v => v * 14.5038 },
  { label: 'kPa', value: 'kpa', toPsi: v => v * 0.145038 },
  { label: 'feet of water', value: 'fth2o', toPsi: v => v * 0.4335 },
  { label: 'm of water', value: 'mh2o', toPsi: v => v * 1.42233 },
];
const distanceUnits = [
  { label: 'ft', value: 'ft', toFt: v => v },
  { label: 'in', value: 'in', toFt: v => v / 12 },
  { label: 'm', value: 'm', toFt: v => v * 3.28084 },
  { label: 'cm', value: 'cm', toFt: v => v * 0.0328084 },
];
const flowUnits = [
  { label: 'gpm', value: 'gpm', fromGpm: v => v },
  { label: 'lps', value: 'lps', fromGpm: v => v / 15.8503 },
  { label: 'lpm', value: 'lpm', fromGpm: v => v * 3.78541 },
  { label: 'lph', value: 'lph', fromGpm: v => v * 227.125 },
  { label: 'gph', value: 'gph', fromGpm: v => v * 60 },
  { label: 'cfs', value: 'cfs', fromGpm: v => v / 448.831 },
  { label: 'acre-in/day', value: 'acre-in/day', fromGpm: v => v / 18.7 },
  { label: 'acre-in/hour', value: 'acre-in/hour', fromGpm: v => v / 452.7 },
  { label: 'acre-ft/day', value: 'acre-ft/day', fromGpm: v => v / 225.8 },
];
const diameterUnits = [
  { label: 'in', value: 'in', fromIn: v => v },
  { label: '1/8 in', value: '8ths', fromIn: v => v * 8 },
  { label: '1/16 in', value: '16ths', fromIn: v => v * 16 },
  { label: '1/32 in', value: '32nds', fromIn: v => v * 32 },
  { label: '1/64 in', value: '64ths', fromIn: v => v * 64 },
  { label: '1/128 in', value: '128ths', fromIn: v => v * 128 },
  { label: 'ft', value: 'ft', fromIn: v => v * 12 },
  { label: 'cm', value: 'cm', fromIn: v => v / 0.393701 },
  { label: 'mm', value: 'mm', fromIn: v => v / 0.0393701 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

function calculateResults({ appRate, appRateUnit, pressure, pressureUnit, eff, x, xUnit, y, yUnit, flowRateUnit, diameterUnit }) {
  if (!appRate || !pressure || !eff || !x || !y) return { flow: null, diameter: null };

  const PR = appRateUnits.find(u => u.value === appRateUnit).toInHr(Number(appRate));
  const P = pressureUnits.find(u => u.value === pressureUnit).toPsi(Number(pressure));
  const Eff = Number(eff) / 100; // Efficiency from % to decimal
  const X = distanceUnits.find(u => u.value === xUnit).toFt(Number(x));
  const Y = distanceUnits.find(u => u.value === yUnit).toFt(Number(y));
  
  if (PR <= 0 || P <= 0 || Eff <= 0 || X <= 0 || Y <= 0) return { flow: null, diameter: null };

  // Calculate Flow Rate
  const Qn_gpm = (PR * X * Y) / (96.25 * Eff);
  const flowConv = flowUnits.find(u => u.value === flowRateUnit).fromGpm;
  const flowResult = flowConv(Qn_gpm);
  
  // Calculate Nozzle Diameter
  const C = 0.97; // Nozzle coefficient, typical for water
  const D_in = Math.sqrt(Qn_gpm / (29.84 * C * Math.sqrt(P)));
  const diameterConv = diameterUnits.find(u => u.value === diameterUnit).fromIn;
  const diameterResult = diameterConv(D_in);
  
  return { flow: flowResult, diameter: diameterResult };
}

const NozzleFlowRateDiameterCalculator = () => {
  const [inputs, setInputs] = useState({
    appRate: '',
    appRateUnit: 'inhr',
    pressure: '',
    pressureUnit: 'psi',
    eff: '80', // Default efficiency %
    x: '',
    xUnit: 'ft',
    y: '',
    yUnit: 'ft',
    flowRateUnit: 'gpm',
    diameterUnit: 'in',
  });
  const [results, setResults] = useState({ flow: null, diameter: null });

  const handleInputChange = (field) => (event) => {
    setInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    const res = calculateResults(inputs);
    setResults(res);
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Nozzle Flow Rate and Required Nozzle Diameter
      </Typography>
      <Typography gutterBottom align="center" sx={{ mb: 4, ...fontText }}>
        This form selects the nozzle diameter and flow rate based on a given application rate.
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Target Application Rate"
              type="number"
              value={inputs.appRate}
              onChange={handleInputChange('appRate')}
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.appRateUnit}
                    onChange={handleInputChange('appRateUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 120 }}
                  >
                    {appRateUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Pressure"
              type="number"
              value={inputs.pressure}
              onChange={handleInputChange('pressure')}
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.pressureUnit}
                    onChange={handleInputChange('pressureUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 140 }}
                  >
                    {pressureUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Sprinkler Head Spacing"
              type="number"
              value={inputs.x}
              onChange={handleInputChange('x')}
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.xUnit}
                    onChange={handleInputChange('xUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 100 }}
                  >
                    {distanceUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Line Spacing"
              type="number"
              value={inputs.y}
              onChange={handleInputChange('y')}
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.yUnit}
                    onChange={handleInputChange('yUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 100 }}
                  >
                    {distanceUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Sprinkler Efficiency"
              type="number"
              value={inputs.eff}
              onChange={handleInputChange('eff')}
              InputProps={{ endAdornment: <Typography sx={{ pr: 2 }}>%</Typography> }}
            />
          </FormControl>
        </Grid>
      </Grid>
      
      {results.flow !== null && results.diameter !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {/* Flow Rate Result */}
          <Box>
            <Typography sx={{ ...fontSection, mb: 1 }} align="center">
              Nozzle Flow Rate:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 300, justifyContent: 'center' }}>
              <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
                {results.flow.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </Typography>
              <FormControl size="small">
                <Select
                  value={inputs.flowRateUnit}
                  onChange={handleInputChange('flowRateUnit')}
                  sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 120 }}
                >
                  {flowUnits.map((u) => (
                    <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Diameter Result */}
          <Box>
            <Typography sx={{ ...fontSection, mb: 1 }} align="center">
              Required Nozzle Diameter:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 300, justifyContent: 'center' }}>
              <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
                {results.diameter.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </Typography>
              <FormControl size="small">
                <Select
                  value={inputs.diameterUnit}
                  onChange={handleInputChange('diameterUnit')}
                  sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 120 }}
                >
                  {diameterUnits.map((u) => (
                    <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 2 }} align="center">
          The Equation
        </Typography>
        <Typography sx={{ ...fontText, mb: 2, textAlign: 'center' }}>
          This Calculator uses these equations to determine the flow rate, nozzle diameter and effective application rate.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>
            Q<sub>n</sub> = 28.9 × D² × √P
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            where:
          </Typography>
          <Box sx={{ display: 'inline-block', textAlign: 'left', mb: 2 }}>
            <Typography sx={{ fontSize: 16 }}><b>Q<sub>n</sub></b> = Flow rate of water from nozzle (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>D</b> = nozzle diameter (in)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>P</b> = Pressure at nozzle (psi)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default NozzleFlowRateDiameterCalculator; 
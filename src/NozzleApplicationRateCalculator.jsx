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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const diameterUnits = [
  { label: 'in', value: 'in', toIn: v => v },
  { label: '1/8 in', value: '8ths', toIn: v => v / 8 },
  { label: '1/16 in', value: '16ths', toIn: v => v / 16 },
  { label: '1/32 in', value: '32nds', toIn: v => v / 32 },
  { label: '1/64 in', value: '64ths', toIn: v => v / 64 },
  { label: '1/128 in', value: '128ths', toIn: v => v / 128 },
  { label: 'ft', value: 'ft', toIn: v => v * 12 },
  { label: 'cm', value: 'cm', toIn: v => v * 0.393701 },
  { label: 'mm', value: 'mm', toIn: v => v * 0.0393701 },
];
const pressureUnits = [
  { label: 'psi', value: 'psi', toPsi: v => v },
  { label: 'bar', value: 'bar', toPsi: v => v * 14.5038 },
  { label: 'kPa', value: 'kpa', toPsi: v => v * 0.145038 },
  { label: 'feet of water', value: 'fth2o', toPsi: v => v * 0.4335 },
  { label: 'm of water', value: 'mh2o', toPsi: v => v * 1.42233 },
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
const distanceUnits = [
  { label: 'ft', value: 'ft', toFt: v => v },
  { label: 'in', value: 'in', toFt: v => v / 12 },
  { label: 'm', value: 'm', toFt: v => v * 3.28084 },
  { label: 'cm', value: 'cm', toFt: v => v * 0.0328084 },
];
const appRateUnits = [
  { label: 'in/hr', value: 'inhr', fromInHr: v => v, toInHr: v => v },
  { label: 'mm/hr', value: 'mmhr', fromInHr: v => v * 25.4, toInHr: v => v / 25.4 },
  { label: 'in/day', value: 'inday', fromInHr: v => v * 24, toInHr: v => v / 24 },
  { label: 'mm/day', value: 'mmday', fromInHr: v => v * 25.4 * 24, toInHr: v => v / (25.4 * 24) },
  { label: 'cm/hr', value: 'cmhr', fromInHr: v => v * 2.54, toInHr: v => v / 2.54 },
  { label: 'cm/day', value: 'cmday', fromInHr: v => v * 2.54 * 24, toInHr: v => v / (2.54 * 24) },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

function calculateResults({ diameter, diameterUnit, pressure, pressureUnit, eff, x, xUnit, y, yUnit, flowRateUnit, appRateUnit }) {
  if (!diameter || !pressure || !eff || !x || !y) return { flow: null, appRate: null };

  const d = diameterUnits.find(u => u.value === diameterUnit).toIn(Number(diameter));
  const P = pressureUnits.find(u => u.value === pressureUnit).toPsi(Number(pressure));
  const Eff = Number(eff) / 100; // Efficiency from % to decimal
  const X = distanceUnits.find(u => u.value === xUnit).toFt(Number(x));
  const Y = distanceUnits.find(u => u.value === yUnit).toFt(Number(y));
  
  if (d <= 0 || P <= 0 || Eff <= 0 || X <= 0 || Y <= 0) return { flow: null, appRate: null };

  // Calculate Flow Rate
  const C = 0.97; // Nozzle coefficient, typical for water
  const Qn_gpm = 29.84 * C * Math.pow(d, 2) * Math.sqrt(P);
  const flowConv = flowUnits.find(u => u.value === flowRateUnit).fromGpm;
  const flowResult = flowConv(Qn_gpm);
  
  // Calculate Application Rate
  const PR_inhr = 96.25 * Qn_gpm * Eff / (X * Y);
  const appRateConv = appRateUnits.find(u => u.value === appRateUnit).fromInHr;
  const appRateResult = appRateConv(PR_inhr);
  
  return { flow: flowResult, appRate: appRateResult };
}

const NozzleApplicationRateCalculator = () => {
  const [inputs, setInputs] = useState({
    diameter: '',
    diameterUnit: 'in',
    pressure: '',
    pressureUnit: 'psi',
    eff: '80', // Default efficiency %
    x: '',
    xUnit: 'ft',
    y: '',
    yUnit: 'ft',
    flowRateUnit: 'gpm',
    appRateUnit: 'inhr',
  });
  const [results, setResults] = useState({ flow: null, appRate: null });
  const [nozzleDiameterHelperOpen, setNozzleDiameterHelperOpen] = useState(false);
  const [pressureHelperOpen, setPressureHelperOpen] = useState(false);
  const [sprinklerSpacingHelperOpen, setSprinklerSpacingHelperOpen] = useState(false);
  const [lineSpacingHelperOpen, setLineSpacingHelperOpen] = useState(false);
  const [efficiencyHelperOpen, setEfficiencyHelperOpen] = useState(false);
  const [defaultsHelperOpen, setDefaultsHelperOpen] = useState(false);

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
        Nozzle Flow Rate and Effective Application Rate
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, mb: 2, textAlign: 'center' }}>
        This calculator determines the flow rate and effective application rate of sprinklers.
      </Typography>

      {/* What this tool is really doing */}
      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          What this tool is really doing
        </Typography>
        <Typography variant="body2">
          This tool calculates: <strong>"How fast does my sprinkler system apply water (in/hr or mm/hr)?"</strong>
          <br />
          Based on nozzle size, pressure, and spacing, this tells you both the flow rate from each nozzle and the effective application rate across the field — essential for determining how long to run your system.
        </Typography>
      </Alert>

      {/* Recommended Defaults */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Recommended Defaults (Quick Setup)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDefaultsHelperOpen(!defaultsHelperOpen)}
            >
              {defaultsHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={defaultsHelperOpen}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Most common vegetable or field crop overhead irrigation design:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2">
                  • Nozzle diameter: <strong>0.125 in (⅛")</strong>
                </Typography>
                <Typography variant="body2">
                  • Pressure: <strong>40 psi</strong>
                </Typography>
                <Typography variant="body2">
                  • Sprinkler spacing: <strong>40 ft</strong>
                </Typography>
                <Typography variant="body2">
                  • Line spacing: <strong>40 ft</strong>
                </Typography>
                <Typography variant="body2">
                  • Efficiency: <strong>80%</strong>
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setInputs(prev => ({
                    ...prev,
                    diameter: '0.125',
                    pressure: '40',
                    x: '40',
                    y: '40',
                    eff: '80',
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Apply These Defaults
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Nozzle Diameter"
              type="number"
              value={inputs.diameter}
              onChange={handleInputChange('diameter')}
              helperText='Diameter of the sprinkler nozzle opening. Typical: 0.04–0.125 in. If unsure, use 0.125 in (⅛") — most common agricultural sprinkler nozzle.'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.diameterUnit}
                    onChange={handleInputChange('diameterUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 120 }}
                  >
                    {diameterUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                ),
              }}
            />
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Typical Nozzle Diameters
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setNozzleDiameterHelperOpen(!nozzleDiameterHelperOpen)}
                >
                  {nozzleDiameterHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={nozzleDiameterHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Nozzle Type</strong></TableCell>
                          <TableCell><strong>Diameter (inches)</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Micro-sprinkler / mini-sprinkler</strong></TableCell>
                          <TableCell>0.04 – 0.08 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Impact sprinkler (3/32")</strong></TableCell>
                          <TableCell>0.093 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Impact sprinkler (1/8")</strong></TableCell>
                          <TableCell>0.125 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Big gun small</strong></TableCell>
                          <TableCell>0.20 – 0.25 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Big gun medium</strong></TableCell>
                          <TableCell>0.28 – 0.35 in</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If unsure:</strong> Use <strong>0.125 in (⅛")</strong> — the most common agricultural sprinkler nozzle.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Pressure"
              type="number"
              value={inputs.pressure}
              onChange={handleInputChange('pressure')}
              helperText='Operating pressure at the nozzle. Pressure affects both flow rate and uniformity. Typical: 30–50 psi for field sprinklers. If unsure, use 40 psi.'
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
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recommended Operating Pressures
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPressureHelperOpen(!pressureHelperOpen)}
                >
                  {pressureHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={pressureHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>System Type</strong></TableCell>
                          <TableCell><strong>Typical Pressure</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Micro-sprinklers</strong></TableCell>
                          <TableCell>15–30 psi</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Impact sprinklers (standard)</strong></TableCell>
                          <TableCell>30–50 psi</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Big-gun sprayers</strong></TableCell>
                          <TableCell>70–120 psi</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If unsure:</strong> Use <strong>40 psi</strong> — standard for field sprinklers.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Sprinkler Head Spacing"
              type="number"
              value={inputs.x}
              onChange={handleInputChange('x')}
              helperText='Distance between sprinklers along the lateral pipe. Typical: 30–40 ft for vegetables, 40–60 ft for field crops. If unsure, use 40 ft.'
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
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Typical Sprinkler Head Spacings
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setSprinklerSpacingHelperOpen(!sprinklerSpacingHelperOpen)}
                >
                  {sprinklerSpacingHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={sprinklerSpacingHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>System</strong></TableCell>
                          <TableCell><strong>Spacing</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Vegetables (solid-set)</strong></TableCell>
                          <TableCell>30–40 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Pasture / field crops</strong></TableCell>
                          <TableCell>40–60 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Orchards (under-tree)</strong></TableCell>
                          <TableCell>20–30 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Big gun / traveler</strong></TableCell>
                          <TableCell>80–120 ft</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If unsure:</strong> Use <strong>40 ft</strong>
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Line Spacing"
              type="number"
              value={inputs.y}
              onChange={handleInputChange('y')}
              helperText='Distance between sprinkler laterals (rows). Typical: 30–40 ft for vegetables, 40–60 ft for orchards. If unsure, use 40 ft.'
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
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Typical Line Spacing Benchmarks
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setLineSpacingHelperOpen(!lineSpacingHelperOpen)}
                >
                  {lineSpacingHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={lineSpacingHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Crop</strong></TableCell>
                          <TableCell><strong>Line Spacing</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Vegetables</strong></TableCell>
                          <TableCell>30–40 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Pasture</strong></TableCell>
                          <TableCell>40–60 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Orchard solid set</strong></TableCell>
                          <TableCell>40–60 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Overhead greenhouses</strong></TableCell>
                          <TableCell>12–20 ft</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If unsure:</strong> Use <strong>40 ft</strong>
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Sprinkler Efficiency"
              type="number"
              value={inputs.eff}
              onChange={handleInputChange('eff')}
              helperText='Accounts for wind drift, evaporation, and overlap issues. Typical: 70–85% for solid-set sprinklers, 85–90% for center pivots. Recommended default: 80%.'
              InputProps={{ endAdornment: <Typography sx={{ pr: 2 }}>%</Typography> }}
            />
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Standard Efficiency Values
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEfficiencyHelperOpen(!efficiencyHelperOpen)}
                >
                  {efficiencyHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={efficiencyHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>System</strong></TableCell>
                          <TableCell><strong>Efficiency</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Solid-set sprinklers</strong></TableCell>
                          <TableCell>70–85%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Center pivot</strong></TableCell>
                          <TableCell>85–90%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Big-gun sprayers</strong></TableCell>
                          <TableCell>60–75%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Micro-sprinklers</strong></TableCell>
                          <TableCell>80–90%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Recommended default:</strong> <strong>80%</strong> (already set as default)
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {results.flow !== null && results.appRate !== null && (
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
          
          {/* Application Rate Result */}
          <Box>
            <Typography sx={{ ...fontSection, mb: 1 }} align="center">
              Effective Application Rate:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 300, justifyContent: 'center' }}>
              <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
                {results.appRate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </Typography>
              <FormControl size="small">
                <Select
                  value={inputs.appRateUnit}
                  onChange={handleInputChange('appRateUnit')}
                  sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 120 }}
                >
                  {appRateUnits.map((u) => (
                    <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Result Interpretation */}
          <Alert 
            severity={(() => {
              const resultInInHr = appRateUnits.find(u => u.value === inputs.appRateUnit)?.toInHr(results.appRate) || results.appRate;
              if (resultInInHr > 1) return 'warning';
              if (resultInInHr < 0.1) return 'info';
              return 'success';
            })()}
            sx={{ mt: 3, maxWidth: 800 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Application Rate Interpretation
            </Typography>
            {(() => {
              const resultInInHr = appRateUnits.find(u => u.value === inputs.appRateUnit)?.toInHr(results.appRate) || results.appRate;
              if (resultInInHr > 1) {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is too high (&gt;1 in/hr)</strong>
                    <br />
                    This rate is too fast and will cause runoff, especially on heavy soils. Consider:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Reducing nozzle size</li>
                      <li>Increasing sprinkler spacing</li>
                      <li>Reducing pressure</li>
                    </ul>
                  </Typography>
                );
              } else if (resultInInHr < 0.1) {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is very low (&lt;0.1 in/hr)</strong>
                    <br />
                    This rate is very slow and will require long irrigation times. Consider:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Increasing nozzle size</li>
                      <li>Decreasing spacing</li>
                      <li>Increasing pressure</li>
                    </ul>
                  </Typography>
                );
              } else {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is ideal (0.1–1.0 in/hr)</strong>
                    <br />
                    This range is suitable for most soils:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li><strong>Sand:</strong> 0.5–1.0 in/hr is safe</li>
                      <li><strong>Loam:</strong> 0.3–0.5 in/hr is ideal</li>
                      <li><strong>Clay:</strong> 0.1–0.3 in/hr is safe</li>
                    </ul>
                    Use this application rate with the "Irrigation Run Time" tool to determine how long to run your system.
                  </Typography>
                );
              }
            })()}
          </Alert>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 2 }} align="center">
          The Equation
        </Typography>
        <Typography sx={{ ...fontText, mb: 2, textAlign: 'center' }}>
          This Calculator uses these equations to determine the flow rate, nozzle diameter and effective application rate.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, alignItems: 'center', p: 2, background: '#f5f5f5', borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24, mr: 1 }}>PR = 96.25</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>Q<sub>n</sub> × Eff</Typography>
            <Box sx={{ borderTop: '2px solid #222', width: '100%' }} />
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>X × Y</Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            where:
          </Typography>
          <Box sx={{ display: 'inline-block', textAlign: 'left', mb: 2 }}>
            <Typography sx={{ fontSize: 16 }}><b>PR</b> = Precipitation rate (in/hr)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q<sub>n</sub></b> = Flow rate of water from nozzle (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Eff</b> = Irrigation efficiency (decimal) (use 0.7 for set-move)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>X</b> = Distance between nozzles on line (ft)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Y</b> = Distance between sets (ft)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default NozzleApplicationRateCalculator; 
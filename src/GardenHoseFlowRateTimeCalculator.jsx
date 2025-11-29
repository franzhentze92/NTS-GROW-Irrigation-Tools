import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Box, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Collapse, IconButton, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

// Data tables from reference
const lTable = {
  25: 4, 50: 2, 75: 1.5, 100: 1, 125: 0.87, 150: 0.75, 175: 0.62, 200: 0.5,
};
const spTable = {
  '1/2': { 40: 6, 45: 6.5, 50: 7, 60: 7.5 },
  '5/8': { 40: 11, 45: 12, 50: 12.5, 60: 14 },
  '3/4': { 40: 18, 45: 19, 50: 20, 60: 22 },
};

const hoseSizes = Object.keys(spTable);
const pressures = Object.keys(spTable['1/2']);
const lengths = Object.keys(lTable);

const flowUnits = [
  { label: 'gpm', value: 'gpm', fromGpm: v => v },
  { label: 'lps', value: 'lps', fromGpm: v => v * 0.06309 },
  { label: 'lpm', value: 'lpm', fromGpm: v => v * 3.78541 },
  { label: 'cfs', value: 'cfs', fromGpm: v => v * 0.002228 },
  { label: 'cfm', value: 'cfm', fromGpm: v => v * 0.133681 },
];
const volumeUnits = [
  { label: 'gal', value: 'gal', toGal: v => v },
  { label: 'pints', value: 'pints', toGal: v => v * 0.125 },
  { label: 'quarts', value: 'quarts', toGal: v => v * 0.25 },
  { label: 'ml', value: 'ml', toGal: v => v * 0.000264172 },
  { label: 'l', value: 'l', toGal: v => v * 0.264172 },
  { label: 'ft³', value: 'ft3', toGal: v => v * 7.48052 },
];
const timeUnits = [
  { label: 'min', value: 'min', fromMin: v => v },
  { label: 'hr', value: 'hr', fromMin: v => v / 60 },
  { label: 'days', value: 'days', fromMin: v => v / 1440 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

const GardenHoseFlowRateTimeCalculator = () => {
  // State for Flow Rate Calculator
  const [flowInputs, setFlowInputs] = useState({
    size: '5/8',
    pressure: '50',
    length: '50',
  });
  const [flowResultGpm, setFlowResultGpm] = useState(null);
  const [flowOutputUnit, setFlowOutputUnit] = useState('gpm');

  // State for Fill Time Calculator
  const [timeInputs, setTimeInputs] = useState({ volume: '' });
  const [timeResultMin, setTimeResultMin] = useState(null);
  const [volumeUnit, setVolumeUnit] = useState('gal');
  const [timeOutputUnit, setTimeOutputUnit] = useState('min');
  const [hoseSizeHelperOpen, setHoseSizeHelperOpen] = useState(false);
  const [pressureHelperOpen, setPressureHelperOpen] = useState(false);
  const [lengthHelperOpen, setLengthHelperOpen] = useState(false);
  const [flowRateBenchmarksOpen, setFlowRateBenchmarksOpen] = useState(false);
  const [flowTimeBenchmarksOpen, setFlowTimeBenchmarksOpen] = useState(false);
  const [defaultsHelperOpen, setDefaultsHelperOpen] = useState(false);

  // Flow Rate Calculation
  useEffect(() => {
    const { size, pressure, length } = flowInputs;
    if (size && pressure && length) {
      const SP = spTable[size]?.[pressure];
      const L = lTable[length];
      if (SP && L) {
        setFlowResultGpm(SP * L);
      } else {
        setFlowResultGpm(null);
      }
    }
  }, [flowInputs]);

  // Fill Time Calculation
  useEffect(() => {
    if (flowResultGpm > 0 && timeInputs.volume) {
      const volGal = volumeUnits.find(u => u.value === volumeUnit).toGal(Number(timeInputs.volume));
      setTimeResultMin(volGal / flowResultGpm);
    } else {
      setTimeResultMin(null);
    }
  }, [flowResultGpm, timeInputs, volumeUnit]);

  const handleFlowInputChange = (field) => (event) => {
    setFlowInputs(prev => ({ ...prev, [field]: event.target.value }));
  };
  
  const handleTimeInputChange = (field) => (event) => {
    setTimeInputs(prev => ({ ...prev, [field]: event.target.value }));
  };
  
  const convertedFlowResult = flowResultGpm !== null ? flowUnits.find(u => u.value === flowOutputUnit).fromGpm(flowResultGpm) : null;
  const convertedTimeResult = timeResultMin !== null ? timeUnits.find(u => u.value === timeOutputUnit).fromMin(timeResultMin) : null;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">Garden Hose Flow Rate and Time</Typography>
      <Typography gutterBottom align="center" sx={{ mb: 2, ...fontText }}>
        The amount of water flow from a garden hose and minutes to supply that amount of water are determined below, based on the hose size and its supply pressure.
      </Typography>

      {/* What this tool is really doing */}
      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          What this tool is really doing
        </Typography>
        <Typography variant="body2">
          This tool answers two questions:
          <br />
          <strong>1. How much water flows through a garden hose (gpm)?</strong>
          <br />
          <strong>2. How long does it take to deliver a specific amount of water?</strong>
          <br />
          Especially useful for small farmers, nurseries, gardens, and orchards doing manual irrigation.
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
                <strong>Most common farm/garden hose setup:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2">
                  • Hose size: <strong>5/8 in</strong> (most common worldwide)
                </Typography>
                <Typography variant="body2">
                  • Pressure: <strong>50 psi</strong> (standard)
                </Typography>
                <Typography variant="body2">
                  • Length: <strong>50 ft</strong> (typical)
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setFlowInputs({
                    size: '5/8',
                    pressure: '50',
                    length: '50',
                  });
                }}
                sx={{ mt: 1 }}
              >
                Apply These Defaults
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Grid container spacing={4} justifyContent="center">
        {/* Flow Rate Calculator Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ ...fontSection, mb: 2 }}>Garden Hose Flow Rate Calculator</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Hose Size</InputLabel><Select value={flowInputs.size} label="Hose Size" onChange={handleFlowInputChange('size')}>{hoseSizes.map(s => <MenuItem key={s} value={s}>{s} in</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Hose Supply Pressure</InputLabel><Select value={flowInputs.pressure} label="Hose Supply Pressure" onChange={handleFlowInputChange('pressure')}>{pressures.map(p => <MenuItem key={p} value={p}>{p} psi</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Hose Length</InputLabel><Select value={flowInputs.length} label="Hose Length" onChange={handleFlowInputChange('length')}>{lengths.map(l => <MenuItem key={l} value={l}>{l} feet</MenuItem>)}</Select></FormControl></Grid>
              </Grid>
              {convertedFlowResult !== null && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography sx={{...fontSection, mb: 1}}>Water Flow Rate:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography sx={{ ...fontFormula, fontSize: 28, m: 0 }}>{convertedFlowResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
                    <FormControl size="small"><Select value={flowOutputUnit} onChange={e => setFlowOutputUnit(e.target.value)} sx={{ fontWeight: 600, color: '#8cb43a' }}>{flowUnits.map(u => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}</Select></FormControl>
                  </Box>
                </Box>
              )}

              {/* Hose Size Helper */}
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Standard Hose Sizes (Benchmarks)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setHoseSizeHelperOpen(!hoseSizeHelperOpen)}
                    >
                      {hoseSizeHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={hoseSizeHelperOpen}>
                    <Box sx={{ mt: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Hose Size</strong></TableCell>
                              <TableCell><strong>Common Use</strong></TableCell>
                              <TableCell><strong>Typical Flow (50 psi)</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>1/2 in</strong></TableCell>
                              <TableCell>Small hose, home use</TableCell>
                              <TableCell>~10 gpm</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>5/8 in</strong></TableCell>
                              <TableCell>Most common agricultural</TableCell>
                              <TableCell>~15–25 gpm</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>3/4 in</strong></TableCell>
                              <TableCell>Heavy duty farm hose</TableCell>
                              <TableCell>~20–35 gpm</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        <strong>If unsure:</strong> Use <strong>5/8 in</strong> — the most common farm/garden hose worldwide.
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>

              {/* Pressure Helper */}
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Hose Supply Pressure Benchmarks
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
                              <TableCell><strong>Water Source</strong></TableCell>
                              <TableCell><strong>Typical Pressure (psi)</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>Household tap</strong></TableCell>
                              <TableCell>40–60 psi</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Farm pump</strong></TableCell>
                              <TableCell>50–80 psi</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Gravity tank (elevated)</strong></TableCell>
                              <TableCell>5–20 psi</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>Municipal water</strong></TableCell>
                              <TableCell>50–80 psi</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        <strong>Recommended default:</strong> <strong>50 psi</strong> (already selected — perfect)
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>

              {/* Length Helper */}
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Hose Length Effects (Friction Loss)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setLengthHelperOpen(!lengthHelperOpen)}
                    >
                      {lengthHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={lengthHelperOpen}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Long hoses lose pressure and reduce flow:
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Hose Length</strong></TableCell>
                              <TableCell><strong>Flow Reduction</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>25 ft</TableCell>
                              <TableCell>Very little loss</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>50 ft</TableCell>
                              <TableCell>Small reduction</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>100 ft</TableCell>
                              <TableCell>Moderate reduction</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>100–200 ft</TableCell>
                              <TableCell>Significant drop</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        <strong>If unsure:</strong> Use <strong>50 ft</strong>
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>

              {/* Flow Rate Benchmarks */}
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Typical Flow Rates by Hose Size at 50 psi
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setFlowRateBenchmarksOpen(!flowRateBenchmarksOpen)}
                    >
                      {flowRateBenchmarksOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={flowRateBenchmarksOpen}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Use this table to validate the tool's results:
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Hose Size</strong></TableCell>
                              <TableCell><strong>25 ft</strong></TableCell>
                              <TableCell><strong>50 ft</strong></TableCell>
                              <TableCell><strong>100 ft</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>1/2 in</strong></TableCell>
                              <TableCell>11 gpm</TableCell>
                              <TableCell>10 gpm</TableCell>
                              <TableCell>8–9 gpm</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>5/8 in</strong></TableCell>
                              <TableCell>25–28 gpm</TableCell>
                              <TableCell>22–25 gpm</TableCell>
                              <TableCell>18–20 gpm</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>3/4 in</strong></TableCell>
                              <TableCell>32–35 gpm</TableCell>
                              <TableCell>28–32 gpm</TableCell>
                              <TableCell>25–28 gpm</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Grid>

        {/* Fill Time Calculator Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ ...fontSection, mb: 2 }}>Water Flow Time Calculator</Typography>
              <FormControl fullWidth>
                <TextField 
                  label="Volume" 
                  type="number" 
                  value={timeInputs.volume} 
                  onChange={handleTimeInputChange('volume')}
                  helperText='Enter the volume of water you need to deliver. Common examples: 5 gal (bucket), 50 gal (drum), 250 gal (tank), 1,000 gal (large tank).'
                  InputProps={{
                    endAdornment: <Select value={volumeUnit} onChange={e => setVolumeUnit(e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}>{volumeUnits.map(u => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}</Select>
                  }}
                />
              </FormControl>
              {convertedTimeResult !== null && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography sx={{ ...fontSection, mb: 1 }}>Time:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography sx={{ ...fontFormula, fontSize: 28, m: 0 }}>{convertedTimeResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Typography>
                    <FormControl size="small"><Select value={timeOutputUnit} onChange={e => setTimeOutputUnit(e.target.value)} sx={{ fontWeight: 600, color: '#8cb43a' }}>{timeUnits.map(u => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}</Select></FormControl>
                  </Box>
                </Box>
              )}

              {/* Flow Time Benchmarks */}
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Water Flow Time Benchmarks
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setFlowTimeBenchmarksOpen(!flowTimeBenchmarksOpen)}
                    >
                      {flowTimeBenchmarksOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={flowTimeBenchmarksOpen}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Quick reference for common container sizes:
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Volume</strong></TableCell>
                              <TableCell><strong>Time at 10 gpm</strong></TableCell>
                              <TableCell><strong>Time at 20 gpm</strong></TableCell>
                              <TableCell><strong>Time at 30 gpm</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell><strong>5 gal (bucket)</strong></TableCell>
                              <TableCell>0.5 min</TableCell>
                              <TableCell>0.25 min</TableCell>
                              <TableCell>0.17 min</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>50 gal drum</strong></TableCell>
                              <TableCell>5 min</TableCell>
                              <TableCell>2.5 min</TableCell>
                              <TableCell>1.7 min</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>250 gal tank</strong></TableCell>
                              <TableCell>25 min</TableCell>
                              <TableCell>12.5 min</TableCell>
                              <TableCell>8.3 min</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell><strong>1,000 gal tank</strong></TableCell>
                              <TableCell>100 min</TableCell>
                              <TableCell>50 min</TableCell>
                              <TableCell>33 min</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        This helps you understand how long it takes to fill common containers.
                      </Typography>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Equations Section */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 2 }}>The Equations</Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" align="center">Water Flow Rate</Typography>
            <Box sx={{ ...fontFormula, width: '100%', textAlign: 'center', mb: 1 }}>Q = SP ⋅ L</Box>
            <Typography sx={{ ...fontText, ml: 2 }}><b>Q</b> = Water flow rate from the end of the hose (gpm)</Typography>
            <Typography sx={{ ...fontText, ml: 2 }}><b>SP</b> = An arbitrary number from hose size and supply pressure</Typography>
            <Typography sx={{ ...fontText, ml: 2 }}><b>L</b> = An arbitrary number to account for hose size</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" align="center">Water Flow Time</Typography>
            <Box sx={{ ...fontFormula, width: '100%', textAlign: 'center', mb: 1 }}>Time = Vol / Q</Box>
            <Typography sx={{ ...fontText, ml: 2 }}><b>Time</b> = Time to fill the specified volume (min)</Typography>
            <Typography sx={{ ...fontText, ml: 2 }}><b>Vol</b> = Volume needed (gal)</Typography>
            <Typography sx={{ ...fontText, ml: 2 }}><b>Q</b> = Flow rate from the garden hose (gpm)</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4} sx={{ mt: 2 }} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Typography align="center">To determine the value for <b>L</b>, use this table.</Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table size="small"><TableHead><TableRow><TableCell>Length (ft)</TableCell><TableCell>Value</TableCell></TableRow></TableHead>
                <TableBody>{Object.entries(lTable).map(([key, val]) => <TableRow key={key}><TableCell>{key}</TableCell><TableCell>{val}</TableCell></TableRow>)}</TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography align="center">To determine the value for <b>SP</b>, use this table.</Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table size="small"><TableHead><TableRow><TableCell>Size (in)</TableCell>{pressures.map(p => <TableCell key={p}>{p} (psi)</TableCell>)}</TableRow></TableHead>
                <TableBody>{hoseSizes.map(size => <TableRow key={size}><TableCell>{size}</TableCell>{pressures.map(p => <TableCell key={p}>{spTable[size][p]}</TableCell>)}</TableRow>)}</TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default GardenHoseFlowRateTimeCalculator; 
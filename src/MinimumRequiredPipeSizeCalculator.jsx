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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const flowUnits = [
  { label: 'gpm', value: 'gpm', toGpm: v => v },
  { label: 'lps', value: 'lps', toGpm: v => v * 15.8503 },
  { label: 'cfs', value: 'cfs', toGpm: v => v * 448.831 },
  { label: 'acre-in/day', value: 'acre-in/day', toGpm: v => v * 18.7 },
  { label: 'acre-in/hour', value: 'acre-in/hour', toGpm: v => v * 452.7 },
  { label: 'acre-ft/day', value: 'acre-ft/day', toGpm: v => v * 225.8 },
  { label: 'cms', value: 'cms', toGpm: v => v * 15850.3 },
];
const lengthUnits = [
  { label: 'ft', value: 'ft', toFt: v => v },
  { label: 'm', value: 'm', toFt: v => v * 3.28084 },
  { label: 'cm', value: 'cm', toFt: v => v * 0.0328084 },
  { label: 'mm', value: 'mm', toFt: v => v * 0.00328084 },
  { label: 'in', value: 'in', toFt: v => v / 12 },
];
const pressureUnits = [
  { label: 'psi', value: 'psi', toPsi: v => v },
  { label: 'kPa', value: 'kpa', toPsi: v => v * 0.145038 },
  { label: 'bar', value: 'bar', toPsi: v => v * 14.5038 },
  { label: 'm of water', value: 'mh2o', toPsi: v => v * 1.42233 },
  { label: 'feet of water', value: 'fth2o', toPsi: v => v * 0.4335 },
];
const diameterUnits = [
  { label: 'in', value: 'in', fromIn: v => v, toIn: v => v },
  { label: 'mm', value: 'mm', fromIn: v => v * 25.4, toIn: v => v / 25.4 },
  { label: 'cm', value: 'cm', fromIn: v => v * 2.54, toIn: v => v / 2.54 },
  { label: 'm', value: 'm', fromIn: v => v * 0.0254, toIn: v => v / 0.0254 },
  { label: 'ft', value: 'ft', fromIn: v => v / 12, toIn: v => v * 12 },
];

const pipeMaterials = [
  { label: 'PVC / Plastic', value: 150 },
  { label: 'HDPE', value: 140 },
  { label: 'Steel', value: 120 },
  { label: 'Cast Iron', value: 100 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

function calculateMinPipeDiameter({ flow, flowUnit, length, lengthUnit, c, maxLoss, maxLossUnit, diameterUnit }) {
  if (!flow || !length || !c || !maxLoss) return null;
  const Q = flowUnits.find(u => u.value === flowUnit).toGpm(Number(flow));
  const L = lengthUnits.find(u => u.value === lengthUnit).toFt(Number(length));
  const C = Number(c);
  const Ploss = pressureUnits.find(u => u.value === maxLossUnit).toPsi(Number(maxLoss));
  if (Q <= 0 || L <= 0 || C <= 0 || Ploss <= 0) return null;
  // D = [4.53 * L * (Q/C)^1.852 / Ploss]^(1/4.857)
  const numerator = 4.53 * L * Math.pow(Q / C, 1.852);
  const D_in = Math.pow(numerator / Ploss, 1 / 4.857);
  const outConv = diameterUnits.find(u => u.value === diameterUnit).fromIn;
  return outConv(D_in);
}

const MinimumRequiredPipeSizeCalculator = () => {
  const [inputs, setInputs] = useState({
    flow: '',
    flowUnit: 'gpm',
    length: '',
    lengthUnit: 'ft',
    c: 150,
    maxLoss: '',
    maxLossUnit: 'psi',
    diameterUnit: 'in',
  });
  const [result, setResult] = useState(null);
  const [pipeMaterialHelperOpen, setPipeMaterialHelperOpen] = useState(false);
  const [fittingsHelperOpen, setFittingsHelperOpen] = useState(false);
  const [quickReferenceOpen, setQuickReferenceOpen] = useState(false);
  const [howToUseOpen, setHowToUseOpen] = useState(false);

  const handleInputChange = (field) => (event) => {
    setInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    const res = calculateMinPipeDiameter(inputs);
    setResult(res);
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Minimum Required Pipe Size
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the minimum required pipe diameter for a given flow, length, material, and allowable pressure loss.
      </Typography>
      
      {/* What this tool is really doing */}
      <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          What this tool is really doing
        </Typography>
        <Typography variant="body2">
          This tool answers: <strong>"What pipe diameter do I need to keep friction loss below my acceptable limit?"</strong>
          <br />
          Higher flow rates and longer pipes require larger diameters to avoid excessive pressure loss. The tool calculates the minimum diameter needed based on your flow, pipe length, material roughness, and maximum allowable pressure drop.
        </Typography>
      </Alert>

      {/* How to Use This Tool */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              How to Use This Tool
            </Typography>
            <IconButton
              size="small"
              onClick={() => setHowToUseOpen(!howToUseOpen)}
            >
              {howToUseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={howToUseOpen}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Step 1:</strong> Enter the <strong>flow rate</strong> moving through the pipe
                <br />
                <strong>Step 2:</strong> Enter the <strong>total pipe length</strong> (include elbows, valves, filters → add 10–20%)
                <br />
                <strong>Step 3:</strong> Select the <strong>pipe material</strong> (PVC = smoothest, lowest friction)
                <br />
                <strong>Step 4:</strong> Choose the <strong>maximum pressure loss</strong> you are willing to accept
              </Typography>
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Recommended Pressure Loss Values
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Mainlines: <strong>2–5 psi</strong></li>
                  <li>Long mainlines: <strong>5–10 psi</strong> acceptable</li>
                  <li>Laterals: <strong>Up to 15 psi</strong> acceptable</li>
                  <li>Keep friction loss <strong>below 10% of total system pressure</strong></li>
                </ul>
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Common Pipe Sizes (Quick Reference)
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 20 }}>
                  <li>30 gpm → <strong>2"</strong></li>
                  <li>60 gpm → <strong>2.5–3"</strong></li>
                  <li>100 gpm → <strong>3–4"</strong></li>
                  <li>200 gpm → <strong>4–5"</strong></li>
                  <li>350 gpm → <strong>5–6"</strong></li>
                  <li>500 gpm → <strong>6–8"</strong></li>
                </ul>
              </Typography>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }} />
      <Grid container spacing={4}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate In The Pipe"
              type="number"
              value={inputs.flow}
              onChange={handleInputChange('flow')}
              helperText='Enter the total flow moving through the pipe. Higher flow rates require exponentially larger pipe diameters. Typical ranges: Small drip systems: 5–30 gpm, Fruit block/micro-sprinklers: 30–120 gpm, Mainlines: 100–500 gpm, Large pivots: 500–1500+ gpm'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.flowUnit}
                    onChange={handleInputChange('flowUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 140 }}
                  >
                    {flowUnits.map((u) => (
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
              label="Pipe Length"
              type="number"
              value={inputs.length}
              onChange={handleInputChange('length')}
              helperText='Use total run length PLUS fittings allowance. Add 10–20% to actual pipe length to account for friction from fittings and bends.'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.lengthUnit}
                    onChange={handleInputChange('lengthUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 120 }}
                  >
                    {lengthUnits.map((u) => (
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
                  Fittings Equivalent Length Guide
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setFittingsHelperOpen(!fittingsHelperOpen)}
                >
                  {fittingsHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={fittingsHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Fittings add friction equivalent to extra pipe length:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>90° elbow</strong></TableCell>
                          <TableCell>5–10 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Gate/ball valve</strong></TableCell>
                          <TableCell>2–3 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>T-junction</strong></TableCell>
                          <TableCell>10–20 ft</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Filter assembly</strong></TableCell>
                          <TableCell>10–30 ft</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Rule of thumb:</strong> Add 10–20% to the actual pipe length to account for fittings.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Pipe Material</InputLabel>
            <Select
              value={inputs.c}
              label="Pipe Material"
              onChange={handleInputChange('c')}
            >
              {pipeMaterials.map((u) => (
                <MenuItem key={u.value + u.label} value={u.value}>{u.label} (C={u.value})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Pipe Roughness (C coefficient)
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPipeMaterialHelperOpen(!pipeMaterialHelperOpen)}
                >
                  {pipeMaterialHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={pipeMaterialHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Hazen–Williams "C" factor determines pipe smoothness. Higher C = smoother = less friction:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Material</strong></TableCell>
                          <TableCell><strong>C-value</strong></TableCell>
                          <TableCell><strong>Notes</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>PVC / Plastic</strong></TableCell>
                          <TableCell>150</TableCell>
                          <TableCell>Very smooth, lowest friction</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>HDPE</strong></TableCell>
                          <TableCell>140</TableCell>
                          <TableCell>Slightly more friction</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Steel</strong></TableCell>
                          <TableCell>120</TableCell>
                          <TableCell>Older or galvanized</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Cast Iron</strong></TableCell>
                          <TableCell>100</TableCell>
                          <TableCell>High friction, avoid for irrigation</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Recommendation:</strong> Choose PVC/Plastic unless you know exactly what your system uses.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Maximum Allowable Pressure Loss"
              type="number"
              value={inputs.maxLoss}
              onChange={handleInputChange('maxLoss')}
              helperText='This determines the pipe size. Recommended: Mainlines: 2–5 psi, Long mainlines: 5–10 psi, Laterals: up to 15 psi. Keep friction loss below 2–5 psi per 1000 ft, or below 10% of total system pressure.'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.maxLossUnit}
                    onChange={handleInputChange('maxLossUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 160 }}
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
      </Grid>

      {/* Quick Reference Chart */}
      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Quick Reference: Correct Pipe Size for Common Flows (PVC)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setQuickReferenceOpen(!quickReferenceOpen)}
            >
              {quickReferenceOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={quickReferenceOpen}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This chart shows typical minimum pipe sizes for common flow rates. Higher flows or longer pipes may require larger diameters.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Flow (gpm)</strong></TableCell>
                      <TableCell><strong>Minimum Pipe Size (PVC)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>30 gpm</TableCell>
                      <TableCell><strong>2"</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>60 gpm</TableCell>
                      <TableCell><strong>2.5–3"</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100 gpm</TableCell>
                      <TableCell><strong>3–4"</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>200 gpm</TableCell>
                      <TableCell><strong>4–5"</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>350 gpm</TableCell>
                      <TableCell><strong>5–6"</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>500 gpm</TableCell>
                      <TableCell><strong>6–8"</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: '#666' }}>
                Note: These are approximate values. Actual required size depends on pipe length, material, and allowable pressure loss.
              </Typography>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Minimum Pipe Size:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </Typography>
            <FormControl size="small">
              <Select
                value={inputs.diameterUnit}
                onChange={handleInputChange('diameterUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {diameterUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Result Interpretation */}
          <Alert severity="info" sx={{ mt: 3, maxWidth: 800 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Result Interpretation
            </Typography>
            {(() => {
              const resultInInches = diameterUnits.find(u => u.value === inputs.diameterUnit)?.toIn(result) || result;
              if (resultInInches >= 5 && resultInInches <= 12) {
                return (
                  <Typography variant="body2">
                    The required diameter is <strong>very large (5–12")</strong>. Consider:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Reduce flow by splitting into zones</li>
                      <li>Increase allowable pressure loss (if acceptable)</li>
                      <li>Shorten pipe run</li>
                      <li>Switch to HDPE (higher C-value) for slightly better performance</li>
                    </ul>
                  </Typography>
                );
              } else if (resultInInches < 2) {
                return (
                  <Typography variant="body2">
                    The required diameter is <strong>smaller than expected</strong>. This is good — your system is efficient! 
                    You may consider increasing allowable pressure loss slightly for lower pipe costs, but the current size is optimal.
                  </Typography>
                );
              } else {
                return (
                  <Typography variant="body2">
                    This pipe size should provide acceptable friction loss for your system. Round up to the next standard pipe size available.
                    If the diameter seems large, consider reducing flow (zone splitting) or increasing allowable pressure loss.
                  </Typography>
                );
              }
            })()}
          </Alert>
        </Box>
      )}
      {/* Formula centered, below result */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography sx={{ ...fontSection, mb: 1 }} align="center">
          The Equation
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, alignItems: 'center', p: 2, background: '#f5f5f5', borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24, mr: 1 }}>P<sub>loss</sub> =</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>4.53 × L × (Q/C)<sup>1.852</sup></Typography>
            <Box sx={{ borderTop: '2px solid #222', width: '100%' }} />
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>D<sup>4.857</sup></Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            where:
          </Typography>
          <Box sx={{ display: 'inline-block', textAlign: 'left', mb: 2 }}>
            <Typography sx={{ fontSize: 16 }}><b>P<sub>loss</sub></b> = Pressure loss due to friction (psi)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>L</b> = Pipe length (ft)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q</b> = Flow rate of water inside pipe (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>C</b> = Pipe coefficient</Typography>
            <Typography sx={{ fontSize: 16, mb: 1 }}><b>D</b> = Pipe inside diameter (in)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default MinimumRequiredPipeSizeCalculator; 
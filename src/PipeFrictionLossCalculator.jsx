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

const lengthUnits = [
  { label: 'ft', value: 'ft', toFt: v => v },
  { label: 'm', value: 'm', toFt: v => v * 3.28084 },
  { label: 'in', value: 'in', toFt: v => v / 12 },
];
const flowUnits = [
  { label: 'gpm', value: 'gpm', toGpm: v => v },
  { label: 'lps', value: 'lps', toGpm: v => v * 15.8503 },
  { label: 'cfs', value: 'cfs', toGpm: v => v * 448.831 },
  { label: 'acre-in/day', value: 'acre-in-day', toGpm: v => v * 18.857 },
  { label: 'acre-in/hour', value: 'acre-in-hour', toGpm: v => v * 452.57 },
  { label: 'acre-ft/day', value: 'acre-ft-day', toGpm: v => v * 226.6 },
  { label: 'cms', value: 'cms', toGpm: v => v * 15850.3 },
];
const diameterUnits = [
  { label: 'in', value: 'in', toIn: v => v },
  { label: 'mm', value: 'mm', toIn: v => v * 0.0393701 },
  { label: 'cm', value: 'cm', toIn: v => v * 0.393701 },
  { label: 'ft', value: 'ft', toIn: v => v * 12 },
];
const pipeMaterials = [
  { label: 'Plastic', value: 150 },
  { label: 'Epoxy Coated Steel', value: 140 },
  { label: 'Cement Asbestos', value: 140 },
  { label: 'Galvanized Steel', value: 120 },
  { label: 'New Steel', value: 120 },
  { label: 'Aluminum with Couplers', value: 120 },
  { label: '15-Year-Old Steel', value: 100 },
];
const outputUnits = [
  { label: 'psi', value: 'psi', fromPsi: v => v },
  { label: 'kPa', value: 'kpa', fromPsi: v => v * 6.89476 },
  { label: 'bar', value: 'bar', fromPsi: v => v * 0.0689476 },
  { label: 'feet of water', value: 'ft-h2o', fromPsi: v => v * 2.30666 },
  { label: 'm of water', value: 'm-h2o', fromPsi: v => v * 0.70307 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Pipe nominal sizes with inside diameters (PVC Schedule 40)
const pipeSizes = {
  '2"': { nominal: '2"', insideDiameter: 2.067 },
  '2.5"': { nominal: '2.5"', insideDiameter: 2.469 },
  '3"': { nominal: '3"', insideDiameter: 3.068 },
  '4"': { nominal: '4"', insideDiameter: 4.026 },
  '6"': { nominal: '6"', insideDiameter: 6.065 },
  '8"': { nominal: '8"', insideDiameter: 7.981 },
};

// Updated pipe materials with better labels
const pipeMaterialsEnhanced = [
  { label: 'PVC / Plastic', value: 150, description: 'Very smooth, lowest friction' },
  { label: 'HDPE', value: 140, description: 'Slightly more friction' },
  { label: 'Steel (New/Galvanized)', value: 120, description: 'Older or galvanized' },
  { label: 'Cast Iron', value: 100, description: 'High friction, avoid for irrigation' },
];

function calculatePressureLoss({ length, lengthUnit, flow, flowUnit, diameter, diameterUnit, c, outputUnit }) {
  if (!length || !flow || !diameter || !c) return null;
  const L = lengthUnits.find(u => u.value === lengthUnit).toFt(Number(length));
  const Q = flowUnits.find(u => u.value === flowUnit).toGpm(Number(flow));
  const D = diameterUnits.find(u => u.value === diameterUnit).toIn(Number(diameter));
  const C = Number(c);
  if (L <= 0 || Q <= 0 || D <= 0 || C <= 0) return null;
  // Hazen-Williams: P_loss = 4.53 × L × (Q/C)^1.852 / D^4.857
  const PlossPsi = 4.53 * L * Math.pow(Q / C, 1.852) / Math.pow(D, 4.857);
  const outConv = outputUnits.find(u => u.value === outputUnit).fromPsi;
  return outConv(PlossPsi);
}

const PipeFrictionLossCalculator = () => {
  const [inputs, setInputs] = useState({
    length: '',
    lengthUnit: 'ft',
    flow: '',
    flowUnit: 'gpm',
    diameter: '',
    diameterUnit: 'in',
    c: 150,
    outputUnit: 'psi',
  });
  const [result, setResult] = useState(null);
  const [pipeSizeHelperOpen, setPipeSizeHelperOpen] = useState(false);
  const [selectedPipeSize, setSelectedPipeSize] = useState('3"');
  const [lengthHelperOpen, setLengthHelperOpen] = useState(false);

  const handleInputChange = (field) => (event) => {
    setInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    const res = calculatePressureLoss(inputs);
    setResult(res);
  }, [inputs]);

  // Auto-apply when pipe size changes
  useEffect(() => {
    if (selectedPipeSize) {
      const pipe = pipeSizes[selectedPipeSize];
      if (pipe) {
        setInputs((prev) => ({
          ...prev,
          diameter: pipe.insideDiameter.toString(),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPipeSize]);

  // Calculate friction loss per 100 ft for interpretation
  const getFrictionLossPer100Ft = () => {
    if (!result || !inputs.length) return null;
    const lengthFt = lengthUnits.find(u => u.value === inputs.lengthUnit).toFt(Number(inputs.length));
    if (lengthFt <= 0) return null;
    const lossPer100Ft = (result / lengthFt) * 100;
    return lossPer100Ft;
  };

  const frictionLossPer100Ft = getFrictionLossPer100Ft();

  // Get friction loss status
  const getFrictionLossStatus = () => {
    if (!frictionLossPer100Ft) return null;
    const lossPsi = frictionLossPer100Ft;
    
    if (lossPsi < 2) {
      return { status: 'excellent', message: 'Excellent - very low friction loss' };
    } else if (lossPsi >= 2 && lossPsi <= 5) {
      return { status: 'acceptable', message: 'Acceptable - within normal range' };
    } else if (lossPsi > 5 && lossPsi <= 10) {
      return { status: 'high', message: 'High - expect uneven irrigation, consider upsizing pipe' };
    } else {
      return { status: 'very-high', message: 'Very high - upsizing pipe is strongly recommended' };
    }
  };

  const frictionStatus = getFrictionLossStatus();

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Pipe Friction Loss
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the pressure loss due to pipe friction using the Hazen-Williams equation.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        Higher flow causes much higher friction loss (nearly exponential). Use inside diameter, not nominal size.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate In The Pipe"
              type="number"
              value={inputs.flow}
              onChange={handleInputChange('flow')}
              helperText="Enter the total flow moving through this pipe section. Typical flows: Drip submains: 5–50 gpm, Sprinkler laterals: 30–150 gpm, Mainlines/pump discharge: 100–600 gpm, Large pivots: 500–1500 gpm."
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
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Pipe Inside Diameter"
              type="number"
              value={inputs.diameter}
              onChange={handleInputChange('diameter')}
              helperText='Use the inside diameter, not nominal size. Common PVC IDs: 2" = 2.067 in, 3" = 3.068 in, 4" = 4.026 in, 6" = 6.065 in, 8" = 7.981 in.'
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Diameter Unit</InputLabel>
            <Select
              value={inputs.diameterUnit}
              label="Diameter Unit"
              onChange={handleInputChange('diameterUnit')}
            >
              {diameterUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Pipe Size Helper */}
          <Card sx={{ border: '1px solid #e0e0e0', mt: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                  💡 Quick Select: PVC Schedule 40 Nominal Size
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPipeSizeHelperOpen(!pipeSizeHelperOpen)}
                >
                  {pipeSizeHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={pipeSizeHelperOpen}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Nominal Size</InputLabel>
                  <Select
                    value={selectedPipeSize}
                    label="Nominal Size"
                    onChange={(e) => setSelectedPipeSize(e.target.value)}
                  >
                    {Object.keys(pipeSizes).map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} (ID: {pipeSizes[size].insideDiameter.toFixed(3)} in)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Alert severity="info" sx={{ mt: 1, backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                  <Typography variant="caption">
                    This has set inside diameter to <strong>{pipeSizes[selectedPipeSize].insideDiameter.toFixed(3)} in</strong> for {selectedPipeSize} PVC Schedule 40.
                  </Typography>
                </Alert>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Pipe Length"
              type="number"
              value={inputs.length}
              onChange={handleInputChange('length')}
              helperText="Use the total pipe length, including an allowance for elbows, tees, valves, filters, and risers. Add 10–20% extra length to account for fittings."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Length Unit</InputLabel>
            <Select
              value={inputs.lengthUnit}
              label="Length Unit"
              onChange={handleInputChange('lengthUnit')}
            >
              {lengthUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Length Helper */}
          <Card sx={{ border: '1px solid #e0e0e0', mt: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                  💡 Fittings Equivalent Length Guide
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setLengthHelperOpen(!lengthHelperOpen)}
                >
                  {lengthHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={lengthHelperOpen}>
                <Alert severity="info" sx={{ mt: 1, backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Fittings add friction:</strong>
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                    <Typography component="li" variant="body2">90° elbow ≈ 5–10 ft of extra length</Typography>
                    <Typography component="li" variant="body2">Gate valve ≈ 2–3 ft</Typography>
                    <Typography component="li" variant="body2">Filter ≈ 10–20 ft</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    To be safe, add <strong>10–20% extra length</strong> to account for fittings.
                  </Typography>
                </Alert>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Pipe Material (C-value)</InputLabel>
            <Select
              value={inputs.c}
              label="Pipe Material (C-value)"
              onChange={handleInputChange('c')}
            >
              {pipeMaterialsEnhanced.map((u) => (
                <MenuItem key={u.value} value={u.value}>
                  {u.label} (C={u.value})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Alert severity="info" sx={{ mt: 2, backgroundColor: '#e3f2fd', color: '#1976d2' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ⭐ Pipe Roughness (C coefficient):
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>Material</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>C-value</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pipeMaterialsEnhanced.map((material) => (
                    <TableRow key={material.value}>
                      <TableCell sx={{ border: 'none', py: 0.5 }}><strong>{material.label}</strong></TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>{material.value}</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>{material.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Alert>
        </Grid>
      </Grid>
      {/* Result and output unit dropdown side by side, below input fields */}
      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Pressure Loss:
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

          {/* Friction Loss Interpretation */}
          {frictionLossPer100Ft && (
            <Box sx={{ mt: 3, maxWidth: 700, width: '100%' }}>
              <Alert 
                severity={frictionStatus?.status === 'excellent' ? 'success' : frictionStatus?.status === 'acceptable' ? 'info' : frictionStatus?.status === 'high' ? 'warning' : 'error'}
                sx={{ 
                  backgroundColor: frictionStatus?.status === 'excellent' ? '#e8f5e9' : frictionStatus?.status === 'acceptable' ? '#e3f2fd' : frictionStatus?.status === 'high' ? '#fff3cd' : '#ffebee',
                  borderLeft: `4px solid ${frictionStatus?.status === 'excellent' ? '#4caf50' : frictionStatus?.status === 'acceptable' ? '#2196f3' : frictionStatus?.status === 'high' ? '#ff9800' : '#f44336'}`
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  🔧 Friction Loss Guidelines
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Friction loss per 100 ft: <strong>{frictionLossPer100Ft.toFixed(2)} {inputs.outputUnit === 'psi' ? 'psi' : inputs.outputUnit}/100 ft</strong>
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>&lt; 2 psi/100 ft</TableCell>
                        <TableCell sx={{ border: 'none', py: 0.5 }}>Excellent</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>2–5 psi/100 ft</TableCell>
                        <TableCell sx={{ border: 'none', py: 0.5 }}>Acceptable</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>5–10 psi/100 ft</TableCell>
                        <TableCell sx={{ border: 'none', py: 0.5 }}>High — expect uneven irrigation</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>&gt; 10 psi/100 ft</TableCell>
                        <TableCell sx={{ border: 'none', py: 0.5 }}>Too high — upsizing pipe is recommended</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {frictionStatus && (
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                    {frictionStatus.message}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {/* Reference Benchmarks */}
          <Box sx={{ mt: 3, maxWidth: 700, width: '100%' }}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
                  📈 Real-World Reference Benchmarks (PVC, C=150)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Flow (gpm)</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>3" PVC</TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 0.5 }}>4" PVC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>100 gpm</TableCell>
                        <TableCell sx={{ py: 0.5 }}>2.2 psi / 100 ft</TableCell>
                        <TableCell sx={{ py: 0.5 }}>0.55 psi / 100 ft</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>200 gpm</TableCell>
                        <TableCell sx={{ py: 0.5 }}>8.5 psi / 100 ft</TableCell>
                        <TableCell sx={{ py: 0.5 }}>2.0 psi / 100 ft</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0.5 }}>350 gpm</TableCell>
                        <TableCell sx={{ py: 0.5 }}>25+ psi / 100 ft</TableCell>
                        <TableCell sx={{ py: 0.5 }}>6.2 psi / 100 ft</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: '#666' }}>
                  💡 Takeaway: Upsizing from 3" → 4" reduces friction loss by <strong>70–80%</strong>.
                </Typography>
              </CardContent>
            </Card>
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
            P_loss = 4.53 &times; L &times; (Q/C)<sup>1.852</sup> / D<sup>4.857</sup>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 16 }}><b>P_loss</b> = Pressure loss due to friction (psi)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>L</b> = Pipe length (ft)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q</b> = Flow rate of water inside pipe (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>C</b> = Pipe coefficient</Typography>
            <Box component="ul" sx={{ p: 0, pl: 2, m: 0, textAlign: 'left' }}>
              {pipeMaterialsEnhanced.map(material => (
                <li key={material.value}>
                  <Typography sx={{ fontSize: 14 }}>{material.label}: {material.value}</Typography>
                </li>
              ))}
            </Box>
            <Typography sx={{ fontSize: 16, mt: 1 }}><b>D</b> = Pipe inside diameter (in)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default PipeFrictionLossCalculator; 
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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BackButton from './BackButton';

const flowUnits = [
  { label: 'gpm', value: 'gpm', toGpm: v => v },
  { label: 'lps', value: 'lps', toGpm: v => v * 15.8503 },
  { label: 'cfs', value: 'cfs', toGpm: v => v * 448.831 },
  { label: 'acre-in/day', value: 'acre-in-day', toGpm: v => v * 18.857 },
  { label: 'acre-ft/day', value: 'acre-ft-day', toGpm: v => v * 226.6 },
  { label: 'cms', value: 'cms', toGpm: v => v * 15850.3 },
];
const diameterUnits = [
  { label: 'in', value: 'in', toIn: v => v, fromIn: v => v },
  { label: 'mm', value: 'mm', toIn: v => v * 0.0393701, fromIn: v => v / 0.0393701 },
  { label: 'cm', value: 'cm', toIn: v => v * 0.393701, fromIn: v => v / 0.393701 },
  { label: 'ft', value: 'ft', toIn: v => v * 12, fromIn: v => v / 12 },
];
const velocityUnits = [
  { label: 'fps', value: 'fps', fromFtSec: v => v },
  { label: 'mps', value: 'mps', fromFtSec: v => v * 0.3048 },
];

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontFormula = { fontFamily: 'monospace', fontWeight: 600, fontSize: 24, background: '#f5f5f5', p: 2, borderRadius: 2, display: 'inline-block' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Pipe nominal sizes with inside diameters (PVC Schedule 40)
const pipeSizes = {
  '1"': { nominal: '1"', insideDiameter: 1.049 },
  '1.25"': { nominal: '1.25"', insideDiameter: 1.380 },
  '1.5"': { nominal: '1.5"', insideDiameter: 1.610 },
  '2"': { nominal: '2"', insideDiameter: 2.067 },
  '2.5"': { nominal: '2.5"', insideDiameter: 2.469 },
  '3"': { nominal: '3"', insideDiameter: 3.068 },
  '4"': { nominal: '4"', insideDiameter: 4.026 },
  '6"': { nominal: '6"', insideDiameter: 6.065 },
  '8"': { nominal: '8"', insideDiameter: 7.981 },
  '10"': { nominal: '10"', insideDiameter: 10.020 },
  '12"': { nominal: '12"', insideDiameter: 11.938 },
};

function calculateVelocity({ flow, flowUnit, diameter, diameterUnit, velocityUnit }) {
  if (!flow || !diameter) return null;
  const Q = flowUnits.find(u => u.value === flowUnit).toGpm(Number(flow));
  const D = diameterUnits.find(u => u.value === diameterUnit).toIn(Number(diameter));
  if (Q <= 0 || D <= 0) return null;
  const V_ftsec = 0.408 * Q / (D * D);
  const outConv = velocityUnits.find(u => u.value === velocityUnit).fromFtSec;
  return outConv(V_ftsec);
}

function calculateMinDiameter({ flow, flowUnit, diameterUnit }) {
  if (!flow) return null;
  const Q = flowUnits.find(u => u.value === flowUnit).toGpm(Number(flow));
  if (Q <= 0) return null;
  // D = sqrt(0.408 * Q / V) where V = 5 fps
  const D_in = Math.sqrt(0.408 * Q / 5);
  const outConv = diameterUnits.find(u => u.value === diameterUnit).fromIn;
  return outConv(D_in);
}

const PipeWaterVelocityCalculator = () => {
  const [velocityInputs, setVelocityInputs] = useState({
    flow: '',
    flowUnit: 'gpm',
    diameter: '',
    diameterUnit: 'in',
    velocityUnit: 'fps',
  });
  const [minDiameterInputs, setMinDiameterInputs] = useState({
    flow: '',
    flowUnit: 'gpm',
    diameterUnit: 'in',
  });
  const [velocityResult, setVelocityResult] = useState(null);
  const [minDiameterResult, setMinDiameterResult] = useState(null);
  const [pipeSizeHelperOpen, setPipeSizeHelperOpen] = useState(false);
  const [selectedPipeSize, setSelectedPipeSize] = useState('2"');
  const [flowRateHelperOpen, setFlowRateHelperOpen] = useState(false);
  const [emitterFlow, setEmitterFlow] = useState('');
  const [emitterFlowUnit, setEmitterFlowUnit] = useState('gph');
  const [numEmitters, setNumEmitters] = useState('');

  const handleVelocityInputChange = (field) => (event) => {
    setVelocityInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleMinDiameterInputChange = (field) => (event) => {
    setMinDiameterInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  // Auto-apply when pipe size changes
  useEffect(() => {
    if (selectedPipeSize) {
      const pipe = pipeSizes[selectedPipeSize];
      if (pipe) {
        setVelocityInputs((prev) => ({
          ...prev,
          diameter: pipe.insideDiameter.toString(),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPipeSize]);

  // Calculate total flow rate from emitters
  const calculateTotalFlow = () => {
    const flowPerEmitter = parseFloat(emitterFlow) || 0;
    const count = parseFloat(numEmitters) || 0;
    
    if (flowPerEmitter > 0 && count > 0) {
      let totalFlow = flowPerEmitter * count;
      
      // Convert to GPM if needed
      if (emitterFlowUnit === 'gph') {
        totalFlow = totalFlow / 60;
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'gph' };
      } else if (emitterFlowUnit === 'gpm') {
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: totalFlow.toFixed(2), originalUnit: 'gpm' };
      } else if (emitterFlowUnit === 'lph') {
        totalFlow = (totalFlow * 0.00440287) / 60;
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'lph' };
      } else if (emitterFlowUnit === 'lpm') {
        totalFlow = totalFlow * 0.264172;
        return { value: totalFlow.toFixed(2), unit: 'gpm', original: (flowPerEmitter * count).toFixed(2), originalUnit: 'lpm' };
      }
    }
    return null;
  };

  const totalFlowResult = calculateTotalFlow();

  // Apply calculated total flow to the main form
  const applyTotalFlow = () => {
    if (totalFlowResult) {
      setVelocityInputs((prev) => ({ ...prev, flow: totalFlowResult.value }));
      setVelocityInputs((prev) => ({ ...prev, flowUnit: 'gpm' }));
    }
  };

  // Get velocity status for interpretation
  const getVelocityStatus = () => {
    if (velocityResult === null) return null;
    const velocityFps = velocityInputs.velocityUnit === 'fps' ? velocityResult : velocityResult / 0.3048;
    
    if (velocityFps < 3) {
      return { status: 'low', message: 'Velocity is below ideal range. May allow sediment settling.' };
    } else if (velocityFps >= 3 && velocityFps <= 5) {
      return { status: 'excellent', message: 'Excellent velocity - ideal range. Prevents sediment settling and minimizes pipe wear.' };
    } else if (velocityFps > 5 && velocityFps <= 7) {
      return { status: 'high', message: 'High velocity - acceptable in short sections but may cause water hammer.' };
    } else {
      return { status: 'risky', message: 'Too high - causes pipe erosion, fittings damage, and water hammer. Consider larger pipe.' };
    }
  };

  const velocityStatus = getVelocityStatus();

  // Get typical pipe size for minimum diameter result
  const getTypicalPipeSize = () => {
    if (minDiameterResult === null) return null;
    const diameterIn = minDiameterInputs.diameterUnit === 'in' ? minDiameterResult : 
                       minDiameterInputs.diameterUnit === 'mm' ? minDiameterResult / 25.4 :
                       minDiameterInputs.diameterUnit === 'cm' ? minDiameterResult / 2.54 :
                       minDiameterResult * 12;
    
    // Find closest standard pipe size
    const sizes = Object.values(pipeSizes);
    const closest = sizes.reduce((prev, curr) => {
      return Math.abs(curr.insideDiameter - diameterIn) < Math.abs(prev.insideDiameter - diameterIn) ? curr : prev;
    });
    
    return closest;
  };

  const typicalPipeSize = getTypicalPipeSize();

  useEffect(() => {
    const res = calculateVelocity(velocityInputs);
    setVelocityResult(res);
  }, [velocityInputs]);

  useEffect(() => {
    const res = calculateMinDiameter(minDiameterInputs);
    setMinDiameterResult(res);
  }, [minDiameterInputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Water Velocity Calculator
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the water velocity inside a pipe using flow rate and pipe diameter.
      </Typography>
      <Box sx={{ mb: 4 }} />

      {/* Flow Rate Helper */}
      <Card sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
              💡 Calculate Total Flow from Emitters (Optional)
            </Typography>
            <IconButton
              size="small"
              onClick={() => setFlowRateHelperOpen(!flowRateHelperOpen)}
            >
              {flowRateHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            If you know flow per emitter, calculate total flow: <strong>Total flow = flow per emitter × number of emitters</strong>
          </Typography>
          <Collapse in={flowRateHelperOpen}>
            <Box sx={{ mt: 2 }}>
              <Card sx={{ backgroundColor: '#f5f5f5', mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Flow per Emitter"
                        type="number"
                        value={emitterFlow}
                        onChange={(e) => setEmitterFlow(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={emitterFlowUnit}
                          label="Unit"
                          onChange={(e) => setEmitterFlowUnit(e.target.value)}
                        >
                          <MenuItem value="gph">GPH</MenuItem>
                          <MenuItem value="gpm">GPM</MenuItem>
                          <MenuItem value="lph">LPH</MenuItem>
                          <MenuItem value="lpm">LPM</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography sx={{ textAlign: 'center', pt: 1.5, fontWeight: 600 }}>×</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Number of Emitters"
                        type="number"
                        value={numEmitters}
                        onChange={(e) => setNumEmitters(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  {totalFlowResult && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="success" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total Flow: {totalFlowResult.original} {totalFlowResult.originalUnit} = {totalFlowResult.value} {totalFlowResult.unit}
                        </Typography>
                      </Alert>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={applyTotalFlow}
                        sx={{ backgroundColor: '#8cb43a', '&:hover': { backgroundColor: '#7ba32a' } }}
                      >
                        Use This Value
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate"
              type="number"
              value={velocityInputs.flow}
              onChange={handleVelocityInputChange('flow')}
              helperText="Enter the total flow through the pipe (from pump or zone). Typical values: 5–50 gpm (drip), 30–200 gpm (sprinklers), 100–600 gpm (mainlines)."
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Flow Rate Unit</InputLabel>
            <Select
              value={velocityInputs.flowUnit}
              label="Flow Rate Unit"
              onChange={handleVelocityInputChange('flowUnit')}
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
              value={velocityInputs.diameter}
              onChange={handleVelocityInputChange('diameter')}
              helperText='Use the inside diameter, not nominal size. Common IDs: 2" PVC = 2.067 in, 3" PVC = 3.068 in, 4" PVC = 4.026 in.'
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Diameter Unit</InputLabel>
            <Select
              value={velocityInputs.diameterUnit}
              label="Diameter Unit"
              onChange={handleVelocityInputChange('diameterUnit')}
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
                  💡 Quick Select: Pipe Material & Nominal Size
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
                  <InputLabel>PVC Schedule 40 - Nominal Size</InputLabel>
                  <Select
                    value={selectedPipeSize}
                    label="PVC Schedule 40 - Nominal Size"
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
      </Grid>
      {/* Result and output unit dropdown side by side, below input fields */}
      {velocityResult !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Water Velocity:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {velocityResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <FormControl size="small">
              <Select
                value={velocityInputs.velocityUnit}
                onChange={handleVelocityInputChange('velocityUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {velocityUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Velocity Guidelines */}
          <Box sx={{ mt: 3, maxWidth: 700, width: '100%' }}>
            <Alert 
              severity={velocityStatus?.status === 'excellent' ? 'success' : velocityStatus?.status === 'high' ? 'warning' : velocityStatus?.status === 'risky' ? 'error' : 'info'}
              sx={{ 
                backgroundColor: velocityStatus?.status === 'excellent' ? '#e8f5e9' : velocityStatus?.status === 'high' ? '#fff3cd' : velocityStatus?.status === 'risky' ? '#ffebee' : '#e3f2fd',
                borderLeft: `4px solid ${velocityStatus?.status === 'excellent' ? '#4caf50' : velocityStatus?.status === 'high' ? '#ff9800' : velocityStatus?.status === 'risky' ? '#f44336' : '#2196f3'}`
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                🔥 Velocity Guidelines (Industry Standard)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>Excellent</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>3–5 fps</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>Ideal, prevents sediment settling and minimizes pipe wear</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>Safe Maximum</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>≤ 5 fps</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>Recommended by most irrigation engineers</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>High</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>5–7 fps</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>Acceptable in short sections, may cause water hammer</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none', py: 0.5 }}>Too High / Risky</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>&gt; 7 fps</TableCell>
                      <TableCell sx={{ border: 'none', py: 0.5 }}>Causes pipe erosion, fittings damage, water hammer</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {velocityStatus && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Your velocity: <strong>{velocityResult.toFixed(2)} {velocityInputs.velocityUnit}</strong> — {velocityStatus.message}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Most systems should target 3–5 fps. Never exceed 7 fps to avoid damage.
              </Typography>
            </Alert>
          </Box>
        </Box>
      )}

      <Box sx={{ my: 4, borderTop: '1px solid #ddd' }} />

      <Typography gutterBottom sx={fontTitle} align="center">
        Minimum Pipe Diameter (5 fps)
      </Typography>
      <Typography gutterBottom sx={fontText} align="center">
        Calculate the minimum pipe diameter required for a 5 fps pipe velocity.
      </Typography>
      <Typography gutterBottom sx={{ ...fontText, fontStyle: 'italic', color: '#666', mb: 4 }} align="center">
        This calculator determines the minimum pipe diameter needed to keep water velocity at 5 ft/s, which is the recommended upper limit for irrigation pipelines.
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Flow Rate"
              type="number"
              value={minDiameterInputs.flow}
              onChange={handleMinDiameterInputChange('flow')}
                helperText='Enter the total flow through the pipe. Typical sizing: 70 gpm → 2" pipe, 120 gpm → 2.5" pipe, 200 gpm → 3" pipe, 350 gpm → 4" pipe, 600 gpm → 6" pipe.'
            />
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Flow Rate Unit</InputLabel>
            <Select
              value={minDiameterInputs.flowUnit}
              label="Flow Rate Unit"
              onChange={handleMinDiameterInputChange('flowUnit')}
            >
              {flowUnits.map((u) => (
                <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {minDiameterResult !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Minimum Pipe Diameter:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, textAlign: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {minDiameterResult.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </Typography>
            <FormControl size="small">
              <Select
                value={minDiameterInputs.diameterUnit}
                onChange={handleMinDiameterInputChange('diameterUnit')}
                sx={{ fontWeight: 600, color: '#8cb43a', minWidth: 100 }}
              >
                {diameterUnits.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Interpretation */}
          {typicalPipeSize && (
            <Box sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
              <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Interpretation
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  To prevent water hammer and pipe wear, velocity should be ≤ 5 ft/s.
                </Typography>
                <Typography variant="body2">
                  For a flow of <strong>{minDiameterInputs.flow} {minDiameterInputs.flowUnit}</strong>, you need a pipe with inside diameter of at least <strong>{minDiameterResult.toFixed(3)} {minDiameterInputs.diameterUnit}</strong>.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Recommended standard pipe size: <strong>{typicalPipeSize.nominal} PVC Schedule 40</strong> (ID: {typicalPipeSize.insideDiameter.toFixed(3)} in)
                </Typography>
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
            V = 0.408 &times; Q / D<sup>2</sup>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            Where:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, textAlign: 'left' }}>
            <Typography sx={{ fontSize: 16 }}><b>V</b> = Water velocity inside the pipe (ft/second)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q</b> = Flow rate of water inside pipe (gpm)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>D</b> = Pipe inside diameter (in)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default PipeWaterVelocityCalculator; 
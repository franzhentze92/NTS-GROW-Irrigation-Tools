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

const flowUnits = [
  { label: 'gph', value: 'gph', toGph: v => v },
  { label: 'lph', value: 'lph', toGph: v => v * 0.264172 },
  { label: 'gpm', value: 'gpm', toGph: v => v * 60 },
  { label: 'lps', value: 'lps', toGph: v => v * 951.019 },
];
const spacingUnits = [
  { label: 'in', value: 'in', toIn: v => v },
  { label: 'ft', value: 'ft', toIn: v => v * 12 },
  { label: 'cm', value: 'cm', toIn: v => v * 0.393701 },
  { label: 'mm', value: 'mm', toIn: v => v * 0.0393701 },
  { label: 'm', value: 'm', toIn: v => v * 39.3701 },
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

function calculateDripAppRate({ flow, flowUnit, row, rowUnit, emit, emitUnit, appRateUnit }) {
  if (!flow || !row || !emit) return null;
  const Qe = flowUnits.find(u => u.value === flowUnit).toGph(Number(flow));
  const Eff = 0.95; // Per WSU reference
  const Rowx = spacingUnits.find(u => u.value === rowUnit).toIn(Number(row));
  const Emity = spacingUnits.find(u => u.value === emitUnit).toIn(Number(emit));
  if (Qe <= 0 || Rowx <= 0 || Emity <= 0) return null;
  const PR_inhr = 231 * Qe * Eff / (Rowx * Emity);
  const outConv = appRateUnits.find(u => u.value === appRateUnit).fromInHr;
  return outConv(PR_inhr);
}

const DripLineApplicationRateCalculator = () => {
  const [inputs, setInputs] = useState({
    flow: '',
    flowUnit: 'gph',
    row: '',
    rowUnit: 'in',
    emit: '',
    emitUnit: 'in',
    appRateUnit: 'inhr',
  });
  const [result, setResult] = useState(null);
  const [emitterFlowHelperOpen, setEmitterFlowHelperOpen] = useState(false);
  const [emitterSpacingHelperOpen, setEmitterSpacingHelperOpen] = useState(false);
  const [rowSpacingHelperOpen, setRowSpacingHelperOpen] = useState(false);
  const [defaultsHelperOpen, setDefaultsHelperOpen] = useState(false);

  const handleInputChange = (field) => (event) => {
    setInputs(prev => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    const res = calculateDripAppRate(inputs);
    setResult(res);
  }, [inputs]);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">
        Drip Line Application Rate
      </Typography>
      <Typography gutterBottom align="center" sx={{ mb: 2, ...fontText }}>
        Use this form to calculate the water application rate of drip irrigation lines (tape, tubing) given the flow rate from individual emitters, the spacing of the emitters along the drip line, and the spacing between the drip lines.
      </Typography>

      {/* What this tool is really answering */}
      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          What this tool is really answering
        </Typography>
        <Typography variant="body2">
          This tool calculates: <strong>"How fast does my drip system apply water (in/hr or mm/hr)?"</strong>
          <br />
          Based on your emitter flow rate, emitter spacing, and row spacing, this tells you the application rate — essential for determining how long to run your system to apply the required depth of water.
        </Typography>
      </Alert>

      {/* Recommended Default Set */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Recommended Default Set (Quick Setup)
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
                <strong>Vegetables in raised beds / open field:</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2">
                  • Emitter flow: <strong>1.0 gph</strong>
                </Typography>
                <Typography variant="body2">
                  • Emitter spacing: <strong>12 in</strong>
                </Typography>
                <Typography variant="body2">
                  • Line spacing: <strong>30 in</strong>
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setInputs(prev => ({
                    ...prev,
                    flow: '1.0',
                    emit: '12',
                    row: '30',
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Apply These Defaults
              </Button>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: '#666' }}>
                This produces results very close to commercial irrigation design standards.
              </Typography>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <TextField
              label="Emitter flow"
              type="number"
              value={inputs.flow}
              onChange={handleInputChange('flow')}
              helperText='Flow rate from a single emitter. Typical: 0.5–1.0 gph for vegetables, 2–4 gph for trees. If unsure, use 1.0 gph (industry default).'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.flowUnit}
                    onChange={handleInputChange('flowUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 100 }}
                  >
                    {flowUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                )
              }}
            />
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Typical Drip Emitter Flow Rates
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEmitterFlowHelperOpen(!emitterFlowHelperOpen)}
                >
                  {emitterFlowHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={emitterFlowHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Emitter Type</strong></TableCell>
                          <TableCell><strong>Typical Flow</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Low-flow drip</strong></TableCell>
                          <TableCell>0.5 gph (1.9 L/hr)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Standard drip</strong></TableCell>
                          <TableCell>1.0 gph (3.8 L/hr)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>High-flow drip</strong></TableCell>
                          <TableCell>2.0 gph (7.6 L/hr)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Tree emitter / heavy drip</strong></TableCell>
                          <TableCell>4.0 gph (15 L/hr)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Quick guidance by crop:</strong>
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                    <li><Typography variant="body2" component="span">Vegetables: 0.5 – 1.0 gph</Typography></li>
                    <li><Typography variant="body2" component="span">Orchards / trees: 2.0 – 4.0 gph</Typography></li>
                    <li><Typography variant="body2" component="span">Vines (grape, berries): 0.5 – 1.0 gph</Typography></li>
                    <li><Typography variant="body2" component="span">Greenhouse drip tape: 0.2 – 0.5 gph</Typography></li>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If unsure:</strong> Use <strong>1.0 gph</strong> (industry default across many crops)
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <TextField
              label="Emitter spacing along the line"
              type="number"
              value={inputs.emit}
              onChange={handleInputChange('emit')}
              helperText='Distance between emitters on the same tape or tube. Typical: 6–12 in for vegetables, 18–36 in for orchards. If unsure, use 12 inches.'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.emitUnit}
                    onChange={handleInputChange('emitUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 100 }}
                  >
                    {spacingUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                )
              }}
            />
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Typical Emitter Spacings
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEmitterSpacingHelperOpen(!emitterSpacingHelperOpen)}
                >
                  {emitterSpacingHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={emitterSpacingHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Crop / Use</strong></TableCell>
                          <TableCell><strong>Common Spacing</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Vegetables (drip tape)</strong></TableCell>
                          <TableCell>6–12 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Fruit trees</strong></TableCell>
                          <TableCell>18–36 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Vines (grapes/berries)</strong></TableCell>
                          <TableCell>12–18 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Landscape dripline</strong></TableCell>
                          <TableCell>12–18 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Row crops (maize, cotton, beans)</strong></TableCell>
                          <TableCell>12–24 in</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Simple rule:</strong> Use <strong>12 inches (30 cm)</strong> if you don't know.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <TextField
              label="Distance between drip lines"
              type="number"
              value={inputs.row}
              onChange={handleInputChange('row')}
              helperText='How far apart the rows of drip tape/tube are. Typical: 12–36 in for vegetables, 36–72 in for orchards. If unsure, use 30 inches (2.5 ft).'
              InputProps={{
                endAdornment: (
                  <Select
                    value={inputs.rowUnit}
                    onChange={handleInputChange('rowUnit')}
                    sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, minWidth: 100 }}
                  >
                    {spacingUnits.map((u) => (
                      <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                    ))}
                  </Select>
                )
              }}
            />
          </FormControl>
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Standard Row Spacings
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setRowSpacingHelperOpen(!rowSpacingHelperOpen)}
                >
                  {rowSpacingHelperOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={rowSpacingHelperOpen}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Crop Type</strong></TableCell>
                          <TableCell><strong>Drip Line Spacing</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Vegetables</strong></TableCell>
                          <TableCell>12–36 in (1–3 ft)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Berries</strong></TableCell>
                          <TableCell>12–36 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Orchards</strong></TableCell>
                          <TableCell>36–72 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Row crops</strong></TableCell>
                          <TableCell>30–40 in</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Greenhouses</strong></TableCell>
                          <TableCell>8–18 in</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>If user is unsure:</strong> Use <strong>30 inches (2.5 ft)</strong> — fits most vegetable beds and row crops.
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {result !== null && (
        <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ ...fontSection, mb: 1 }} align="center">
            Application Rate:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minWidth: 250, justifyContent: 'center' }}>
            <Typography sx={{ ...fontFormula, fontSize: 28, mb: 0 }}>
              {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
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

          {/* Result Interpretation */}
          <Alert 
            severity={(() => {
              const resultInInHr = appRateUnits.find(u => u.value === inputs.appRateUnit)?.toInHr(result) || result;
              if (resultInInHr > 1) return 'warning';
              if (resultInInHr < 0.15) return 'info';
              return 'success';
            })()}
            sx={{ mt: 3, maxWidth: 800 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Result Interpretation
            </Typography>
            {(() => {
              const resultInInHr = appRateUnits.find(u => u.value === inputs.appRateUnit)?.toInHr(result) || result;
              if (resultInInHr > 1) {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is too high (&gt;1 in/hr)</strong>
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Emitter flow may be too high</li>
                      <li>Emitters too close together</li>
                      <li>Drip lines too close</li>
                      <li>Risk of runoff on heavy soils</li>
                      <li><strong>Try:</strong> Reduce to 0.5 gph or increase spacing</li>
                    </ul>
                  </Typography>
                );
              } else if (resultInInHr < 0.15) {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is too low (&lt;0.15 in/hr)</strong>
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Wide spacing between emitters or lines</li>
                      <li>Very low-flow emitters</li>
                      <li>Slow irrigation — may need longer run times</li>
                      <li><strong>Try:</strong> Increase to 1.0 gph or decrease spacing</li>
                    </ul>
                  </Typography>
                );
              } else {
                return (
                  <Typography variant="body2">
                    <strong>Application rate is ideal (0.2–0.5 in/hr)</strong>
                    <br />
                    This range is perfect for most vegetables and provides good water distribution without runoff risk. Use this application rate with the "Irrigation Run Time" tool to determine how long to run your system.
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
          This calculator uses this equation to determine the Application Rate of a drip line irrigation system.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, alignItems: 'center', p: 2, background: '#f5f5f5', borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24, mr: 1 }}>PR = 231</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>Q<sub>e</sub> × Eff</Typography>
            <Box sx={{ borderTop: '2px solid #222', width: '100%' }} />
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 24 }}>Row<sub>x</sub> × Emit<sub>y</sub></Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
            where:
          </Typography>
          <Box sx={{ display: 'inline-block', textAlign: 'left', mb: 2 }}>
            <Typography sx={{ fontSize: 16 }}><b>PR</b> = Precipitation rate (in/hr)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Q<sub>e</sub></b> = Drip emitter flow rate (gal/hr)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Eff</b> = Irrigation efficiency (decimal) (use 0.95 for drip)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Row<sub>x</sub></b> = Distance between drip rows (lines) (in)</Typography>
            <Typography sx={{ fontSize: 16 }}><b>Emit<sub>y</sub></b> = Emitter spacing (in)</Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University / IrrigationBox
      </Typography>
    </Paper>
  );
};

export default DripLineApplicationRateCalculator; 
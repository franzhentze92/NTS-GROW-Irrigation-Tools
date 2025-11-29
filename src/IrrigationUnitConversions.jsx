import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Grid, Card, CardContent } from '@mui/material';
import BackButton from './BackButton';

const conversionConfig = {
  'Flow Rate': {
    baseUnit: 'lps',
    units: {
      'lps': { label: 'lps', toBase: v => v, fromBase: v => v },
      'lpm': { label: 'lpm', toBase: v => v / 60, fromBase: v => v * 60 },
      'lph': { label: 'lph', toBase: v => v / 3600, fromBase: v => v * 3600 },
      'gpm': { label: 'gpm', toBase: v => v * 0.06309, fromBase: v => v / 0.06309 },
      'gph': { label: 'gph', toBase: v => v * 0.00105, fromBase: v => v / 0.00105 },
      'gpd': { label: 'gpd', toBase: v => v * 0.0000438, fromBase: v => v / 0.0000438 },
      'cfs': { label: 'cfs', toBase: v => v * 28.317, fromBase: v => v / 28.317 },
      'cfm': { label: 'cfm', toBase: v => v * 0.4719, fromBase: v => v / 0.4719 },
      'cu. m/hr': { label: 'cu. m/hr', toBase: v => v * 0.2778, fromBase: v => v / 0.2778 },
      'cu. yd/min': { label: 'cu. yd/min', toBase: v => v * 12.74, fromBase: v => v / 12.74 },
      'mgd': { label: 'mgd', toBase: v => v * 43.81, fromBase: v => v / 43.81 },
      'acre-in/day': { label: 'acre-in/day', toBase: v => v * 1.19, fromBase: v => v / 1.19 },
      'acre-in/hour': { label: 'acre-in/hour', toBase: v => v * 28.56, fromBase: v => v / 28.56 },
      'acre-ft/day': { label: 'acre-ft/day', toBase: v => v * 14.28, fromBase: v => v / 14.28 },
      'cms': { label: 'cms', toBase: v => v * 1000, fromBase: v => v / 1000 },
    }
  },
  'Area': {
    baseUnit: 'sq. meter',
    units: {
      'sq. meter': { label: 'sq. meter', toBase: v => v, fromBase: v => v },
      'acre': { label: 'acre', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
      'sq. in.': { label: 'sq. in.', toBase: v => v * 0.000645, fromBase: v => v / 0.000645 },
      'sq. ft.': { label: 'sq. ft.', toBase: v => v * 0.0929, fromBase: v => v / 0.0929 },
      'hectare': { label: 'hectare', toBase: v => v * 10000, fromBase: v => v / 10000 },
      'sq. cm.': { label: 'sq. cm.', toBase: v => v * 0.0001, fromBase: v => v / 0.0001 },
      'sq. yd': { label: 'sq. yd', toBase: v => v * 0.8361, fromBase: v => v / 0.8361 },
      'sq. km': { label: 'sq. km', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      'sq. mile': { label: 'sq. mile', toBase: v => v * 2.59e6, fromBase: v => v / 2.59e6 },
    }
  },
  'Distance': {
    baseUnit: 'm',
    units: {
      'm': { label: 'm', toBase: v => v, fromBase: v => v },
      'ft': { label: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      'in': { label: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      'mm': { label: 'mm', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      'cm': { label: 'cm', toBase: v => v * 0.01, fromBase: v => v / 0.01 },
      'yd': { label: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      'mile': { label: 'mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
      'km': { label: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
    }
  },
  'Time': {
    baseUnit: 'sec',
    units: {
      'sec': { label: 'sec', toBase: v => v, fromBase: v => v },
      'min': { label: 'min', toBase: v => v * 60, fromBase: v => v / 60 },
      'hr': { label: 'hr', toBase: v => v * 3600, fromBase: v => v / 3600 },
      'days': { label: 'days', toBase: v => v * 86400, fromBase: v => v / 86400 },
      'weeks': { label: 'weeks', toBase: v => v * 604800, fromBase: v => v / 604800 },
      'months': { label: 'months', toBase: v => v * 2.628e6, fromBase: v => v / 2.628e6 },
      'yrs': { label: 'yrs', toBase: v => v * 3.154e7, fromBase: v => v / 3.154e7 },
    }
  },
  'Volume': {
    baseUnit: 'liter',
    units: {
      'liter': { label: 'liter', toBase: v => v, fromBase: v => v },
      'cu. in.': { label: 'cu. in.', toBase: v => v * 0.0163871, fromBase: v => v / 0.0163871 },
      'cu. ft.': { label: 'cu. ft.', toBase: v => v * 28.3168, fromBase: v => v / 28.3168 },
      'cu. yd.': { label: 'cu. yd.', toBase: v => v * 764.555, fromBase: v => v / 764.555 },
      'gal': { label: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      'gal UK': { label: 'gal UK', toBase: v => v * 4.54609, fromBase: v => v / 4.54609 },
      'cu. meter': { label: 'cu. meter', toBase: v => v * 1000, fromBase: v => v / 1000 },
      'ml': { label: 'ml', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      'acre-in': { label: 'acre-in', toBase: v => v * 102790, fromBase: v => v / 102790 },
      'acre-ft': { label: 'acre-ft', toBase: v => v * 1.233e6, fromBase: v => v / 1.233e6 },
      'hectare-mm': { label: 'hectare-mm', toBase: v => v * 10000, fromBase: v => v / 10000 },
      'hectare-m': { label: 'hectare-m', toBase: v => v * 1e7, fromBase: v => v / 1e7 },
      'cups': { label: 'cups', toBase: v => v * 0.24, fromBase: v => v / 0.24 }, // US legal cup
      'quarts': { label: 'quarts', toBase: v => v * 0.946353, fromBase: v => v / 0.946353 }, // US liquid quart
    }
  },
  'Pressure': {
    baseUnit: 'psi',
    units: {
      'psi': { label: 'psi', toBase: v => v, fromBase: v => v },
      'bars': { label: 'bars', toBase: v => v * 14.5038, fromBase: v => v / 14.5038 },
      'milli bars': { label: 'milli bars', toBase: v => v * 0.0145, fromBase: v => v / 0.0145 },
      'kPa': { label: 'kPa', toBase: v => v * 0.145038, fromBase: v => v / 0.145038 },
      'atm': { label: 'atm', toBase: v => v * 14.696, fromBase: v => v / 14.696 },
      'in of Mercury': { label: 'in of Mercury', toBase: v => v * 0.491, fromBase: v => v / 0.491 },
      'ft of water': { label: 'ft of water', toBase: v => v * 0.4335, fromBase: v => v / 0.4335 },
      'm of water': { label: 'm of water', toBase: v => v * 1.422, fromBase: v => v / 1.422 },
    }
  },
  'Power': {
    baseUnit: 'hp',
    units: {
      'hp': { label: 'hp', toBase: v => v, fromBase: v => v },
      'kw': { label: 'kw', toBase: v => v * 1.341, fromBase: v => v / 1.341 },
      'BTU/min': { label: 'BTU/min', toBase: v => v * 0.02358, fromBase: v => v / 0.02358 },
      'BTU/hr': { label: 'BTU/hr', toBase: v => v * 0.000393, fromBase: v => v / 0.000393 },
    }
  },
  'Precipitation': {
    baseUnit: 'in/hr',
    units: {
      'in/hr': { label: 'in/hr', toBase: v => v, fromBase: v => v },
      'mm/hr': { label: 'mm/hr', toBase: v => v * 0.03937, fromBase: v => v / 0.03937 },
      'mm/month': { label: 'mm/month', toBase: v => v * 0.0000548, fromBase: v => v / 0.0000548 },
      'mm/day': { label: 'mm/day', toBase: v => v * 0.00164, fromBase: v => v / 0.00164 },
      'in/day': { label: 'in/day', toBase: v => v * 0.04167, fromBase: v => v / 0.04167 },
      'in/month': { label: 'in/month', toBase: v => v * 0.00137, fromBase: v => v / 0.00137 },
      'gpm/acre': { label: 'gpm/acre', toBase: v => v * 0.0011, fromBase: v => v / 0.0011 },
      'cfs/acre': { label: 'cfs/acre', toBase: v => v * 1.008, fromBase: v => v / 1.008 },
      'lps/ha': { label: 'lps/ha', toBase: v => v * 0.00354, fromBase: v => v / 0.00354 },
      'cms/ha': { label: 'cms/ha', toBase: v => v * 3.54, fromBase: v => v / 3.54 },
    }
  },
  'Salinity': {
    baseUnit: 'dS/m',
    units: {
      'dS/m': { label: 'dS/m', toBase: v => v, fromBase: v => v },
      'mS/cm': { label: 'mS/cm', toBase: v => v, fromBase: v => v },
      'microS/cm': { label: 'microS/cm', toBase: v => v / 1000, fromBase: v => v * 1000 },
      'mg/l': { label: 'mg/l', toBase: v => v / 640, fromBase: v => v * 640 },
      'ppm': { label: 'ppm', toBase: v => v / 640, fromBase: v => v * 640 },
      'tons/acre-ft': { label: 'tons/acre-ft', toBase: v => v / 0.735, fromBase: v => v * 0.735 },
    }
  },
  'Speed': {
    baseUnit: 'm/sec',
    units: {
      'm/sec': { label: 'm/sec', toBase: v => v, fromBase: v => v },
      'm/min': { label: 'm/min', toBase: v => v / 60, fromBase: v => v * 60 },
      'm/hr': { label: 'm/hr', toBase: v => v / 3600, fromBase: v => v * 3600 },
      'ft/min': { label: 'ft/min', toBase: v => v * 0.00508, fromBase: v => v / 0.00508 },
      'ft/sec': { label: 'ft/sec', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      'ft/hr': { label: 'ft/hr', toBase: v => v * 0.0000847, fromBase: v => v / 0.0000847 },
      'in/min': { label: 'in/min', toBase: v => v * 0.000423, fromBase: v => v / 0.000423 },
      'mph': { label: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      'km/hr': { label: 'km/hr', toBase: v => v * 0.277778, fromBase: v => v / 0.277778 },
    }
  }
};

const fontTitle = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 32, color: '#222' };
const fontSection = { fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 600, fontSize: 20, color: '#8cb43a' };
const fontText = { fontFamily: 'Roboto, Arial, sans-serif', fontSize: 16, color: '#222' };

// Reusable Converter Component
const UnitConverter = ({ category, config }) => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState(Object.keys(config.units)[0]);
  const [toUnit, setToUnit] = useState(Object.keys(config.units)[1] || Object.keys(config.units)[0]);
  const [result, setResult] = useState('');

  useEffect(() => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const from = config.units[fromUnit];
      const to = config.units[toUnit];
      const baseValue = from.toBase(numValue);
      const convertedValue = to.fromBase(baseValue);
      setResult(convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    } else {
      setResult('');
    }
  }, [value, fromUnit, toUnit, config]);

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ ...fontSection, mb: 2 }}>{category}</Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 'auto' }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              select
              fullWidth
              label="From"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              variant="outlined"
            >
              {Object.values(config.units).map(u => <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={2} sx={{ textAlign: 'center' }}>
            <Typography>to</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              select
              fullWidth
              label="To"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              variant="outlined"
            >
              {Object.values(config.units).map(u => <MenuItem key={u.label} value={u.label}>{u.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#222', mt: 2, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
              {result || '...'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const IrrigationUnitConversions = () => {
  return (
    <Paper sx={{ p: 4, maxWidth: 1600, mx: 'auto' }}>
      <BackButton />
      <Typography gutterBottom sx={fontTitle} align="center">Irrigation Unit Conversions</Typography>
      <Typography gutterBottom align="center" sx={{ mb: 4, ...fontText }}>
        Convert a given value and unit to different unit type. Conversions are available for flow rate, area, distance, time, volume, pressure, power, precipitation, salinity, and speed.
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(conversionConfig).map(([category, config]) => (
          <Grid item xs={12} md={6} lg={4} key={category}>
            <UnitConverter category={category} config={config} />
          </Grid>
        ))}
      </Grid>
      
      <Typography sx={{ fontSize: 13, color: '#888', mt: 4, textAlign: 'center' }}>
        Reference: Washington State University
      </Typography>
    </Paper>
  );
};

export default IrrigationUnitConversions; 
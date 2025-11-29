import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: {
      main: '#8cb43a',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f7f7f9',
      paper: '#ffffff',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
) 
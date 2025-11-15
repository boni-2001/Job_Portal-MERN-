import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5b8def' },
    secondary: { main: '#00bfa6' },
    background: { default: '#f7f9fc' }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 18, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' } } },
    MuiButton: { defaultProps: { disableElevation: true } }
  }
});

export default theme;

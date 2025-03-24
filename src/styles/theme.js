import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
    },
    h2: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 540,
    },
    h3: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 540,
    },
    h4: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      fontSize: '16px',
    },
    body1: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      fontSize: '14px',
    },
    body2: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
    },
  },
});

export default theme;
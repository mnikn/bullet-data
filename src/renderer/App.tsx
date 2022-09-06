import { createTheme, ThemeProvider } from '@mui/material';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './home';
import { PRIMARY_COLOR1, SECOND_COLOR1 } from './style';

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#cbd5e1',
      },
      secondary: {
        main: '#d4d4d8',
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Home />
    </ThemeProvider>
  );
}

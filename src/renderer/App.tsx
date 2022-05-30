import { createTheme, ThemeProvider } from '@mui/material';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './home';
import { PRIMARY_COLOR1, SECOND_COLOR1 } from './style';

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: PRIMARY_COLOR1,
      },
      secondary: {
        main: SECOND_COLOR1,
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

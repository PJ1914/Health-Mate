import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FoodDetection from './pages/FoodDetection';
import NutritionTracking from './pages/NutritionTracking';
import FoodDatabase from './pages/FoodDatabase';
import Profile from './pages/UserProfile';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReactNode } from 'react';
import { Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#2196F3',
    },
  },
});

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? true;

  console.log('ProtectedRoute: Checking auth', { user, authLoading });

  if (authLoading) {
    return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Home />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/detect"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <FoodDetection />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Profile />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <NutritionTracking />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/database"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <FoodDatabase />
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
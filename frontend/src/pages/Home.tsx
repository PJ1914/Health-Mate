import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box className={styles.welcomeSection} textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom className={styles.title}>
            Welcome to Health Mate
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph className={styles.subtitle}>
            Your personal assistant for real-time food calorie detection and nutrition tracking
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Link to="/detect" style={{ textDecoration: 'none' }}>
              <Paper
                className={styles.featureCard}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CameraAltIcon 
                  className={styles.featureIcon}
                  sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} 
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Real-time Detection
                </Typography>
                <Typography align="center" color="text.secondary">
                  Use your camera to instantly identify food items and their caloric content
                </Typography>
              </Paper>
            </Link>
          </Grid>

          <Grid item xs={12} md={4}>
            <Link to="/nutrition" style={{ textDecoration: 'none' }}>
              <Paper
                className={styles.featureCard}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <BarChartIcon 
                  className={styles.featureIcon}
                  sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} 
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Nutrition Tracking
                </Typography>
                <Typography align="center" color="text.secondary">
                  Keep track of your daily caloric intake and nutritional information
                </Typography>
              </Paper>
            </Link>
          </Grid>

          <Grid item xs={12} md={4}>
            <Link to="/database" style={{ textDecoration: 'none' }}>
              <Paper
                className={styles.featureCard}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <LocalDiningIcon 
                  className={styles.featureIcon}
                  sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} 
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Food Database
                </Typography>
                <Typography align="center" color="text.secondary">
                  Access a comprehensive database of food items and their nutritional values
                </Typography>
              </Paper>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Home; 
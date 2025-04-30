import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Box,
  LinearProgress,
  Button,
  TextField,
  Skeleton,
} from '@mui/material';
import axios from 'axios';
import { getAuth, updateProfile } from 'firebase/auth';
import Chart from 'chart.js/auto';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserProfile.module.css';

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

interface HealthSummary {
  totalCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
}

const NUTRITION_API_URL = 'http://localhost:8000/api/nutrition/food/';
const DEFAULT_CALORIE_GOAL = 2000;

const UserProfile = () => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? true;

  const [nutritionEntries, setNutritionEntries] = useState<FoodEntry[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary>({
    totalCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
  });
  const [error, setError] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(DEFAULT_CALORIE_GOAL);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loadingData, setLoadingData] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    console.log('UserProfile: useEffect triggered', { user, authLoading });
    if (user && !authLoading) {
      console.log('UserProfile: Fetching nutrition entries for user', user.uid);
      fetchNutritionEntries();
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (nutritionEntries.length > 0 && !chartInitialized) {
      initializeChart();
      setChartInitialized(true);
    }
  }, [nutritionEntries, chartInitialized]);

  const fetchNutritionEntries = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      console.log('UserProfile: Sending API request to', NUTRITION_API_URL, 'with userId:', user.uid);
      const response = await axios.get(NUTRITION_API_URL, {
        params: { userId: user.uid },
      });
      const entries = response.data.slice(0, 5);
      setNutritionEntries(entries);
      console.log('UserProfile: Nutrition entries fetched', response.data);

      // Calculate health summary
      const totalCalories = entries.reduce((sum: number, entry: FoodEntry) => sum + entry.calories, 0);
      const avgProtein = entries.length
        ? Number((entries.reduce((sum: number, entry: FoodEntry) => sum + entry.protein, 0) / entries.length).toFixed(1))
        : 0;
      const avgCarbs = entries.length
        ? Number((entries.reduce((sum: number, entry: FoodEntry) => sum + entry.carbs, 0) / entries.length).toFixed(1))
        : 0;
      const avgFat = entries.length
        ? Number((entries.reduce((sum: number, entry: FoodEntry) => sum + entry.fat, 0) / entries.length).toFixed(1))
        : 0;

      setHealthSummary({ totalCalories, avgProtein, avgCarbs, avgFat });
    } catch (err) {
      console.error('UserProfile: Error fetching nutrition entries:', err);
      setError('Failed to load health history. Please try again later.');
    } finally {
      setLoadingData(false);
    }
  };

  const initializeChart = () => {
    const ctx = document.getElementById('nutritionChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('UserProfile: Chart canvas not found');
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: nutritionEntries.map((entry) => new Date(entry.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'Calories (kcal)',
            data: nutritionEntries.map((entry) => entry.calories),
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Calories (kcal)' },
          },
          x: {
            title: { display: true, text: 'Date' },
          },
        },
      },
    });
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    try {
      await updateProfile(getAuth().currentUser!, {
        displayName,
        photoURL,
      });
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error('UserProfile: Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCalorieGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCalorieGoal(value);
    }
  };

  const exportToCSV = () => {
    const headers = ['Food Name', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Date'];
    const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;
    const rows = nutritionEntries.map((entry) => [
      escapeCsvField(entry.food_name),
      entry.calories,
      entry.protein,
      entry.carbs,
      entry.fat,
      new Date(entry.timestamp).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'health_mate_nutrition.csv';
    link.click();
  };

  console.log('UserProfile: Rendering', { authLoading, user, error, nutritionEntries, healthSummary });

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={150} sx={{ mt: 2, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          User Profile
        </Typography>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          Health-Mate Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} className={styles.profileSection} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} className={styles.avatarSection}>
              <Avatar
                src={photoURL || undefined}
                alt={displayName || 'User'}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
              />
              {editMode ? (
                <Box sx={{ textAlign: 'center' }}>
                  <TextField
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Photo URL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button variant="contained" size="small" onClick={handleProfileUpdate}>
                      Save
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {displayName || 'Unknown'}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEditMode(true)}
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ pl: { sm: 2 } }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {displayName || 'Unknown'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user.email || 'No email'}
                </Typography>
                <Typography variant="body1">
                  <strong>User ID:</strong> {user.uid}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} className={styles.nutritionSection} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Health Summary</Typography>
          {loadingData ? (
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ) : (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Total Calories:</strong> {healthSummary.totalCalories} kcal
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Avg Protein:</strong> {healthSummary.avgProtein} g
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Avg Carbs:</strong> {healthSummary.avgCarbs} g
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    <strong>Avg Fat:</strong> {healthSummary.avgFat} g
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Daily Calorie Goal:</strong>
                </Typography>
                <TextField
                  type="number"
                  value={calorieGoal}
                  onChange={handleCalorieGoalChange}
                  size="small"
                  sx={{ width: 100, mr: 2 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={Math.min((healthSummary.totalCalories / calorieGoal) * 100, 100)}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {healthSummary.totalCalories} / {calorieGoal} kcal
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>

        <Paper elevation={3} className={styles.nutritionSection} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Calorie Trend</Typography>
          {loadingData ? (
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          ) : (
            <Box sx={{ position: 'relative', height: 200 }}>
              <canvas id="nutritionChart" className={styles.chart}></canvas>
            </Box>
          )}
        </Paper>

        <Paper elevation={3} className={styles.nutritionSection} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Recent Health Entries</Typography>
            {nutritionEntries.length > 0 && (
              <Button variant="contained" size="small" onClick={exportToCSV}>
                Export to CSV
              </Button>
            )}
          </Box>
          {loadingData ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          ) : nutritionEntries.length === 0 ? (
            <Typography color="text.secondary">No recent entries found.</Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {nutritionEntries.map((entry: FoodEntry, idx: number) => (
                <Box key={entry.id}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemText
                      primary={entry.food_name}
                      secondary={`Calories: ${entry.calories} kcal | Protein: ${entry.protein}g | Carbs: ${entry.carbs}g | Fat: ${entry.fat}g | Date: ${new Date(
                        entry.timestamp
                      ).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body1' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {idx < nutritionEntries.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile;
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import styles from './NutritionTracking.module.css';
import { useAuth } from '../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

const NUTRITION_API_URL = 'http://localhost:8000/api/nutrition/food/';

const NutritionTracking = () => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newFood, setNewFood] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month'>('all');
  const [tabValue, setTabValue] = useState(0);

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

  // Fetch food entries from Django backend
  useEffect(() => {
    const fetchFoodEntries = async () => {
      if (!user) {
        setError('Please sign in to view entries');
        setFoodEntries([]);
        return;
      }
      try {
        console.log('NutritionTracking: Fetching entries for user', user.id);
        const response = await axios.get(NUTRITION_API_URL, {
          params: { userId: user.id },
        });
        const entries = response.data.map((entry: any) => ({
          id: entry.id,
          food_name: entry.food_name,
          calories: Number(entry.calories),
          protein: Number(entry.protein || 0),
          carbs: Number(entry.carbs || 0),
          fat: Number(entry.fat || 0),
          timestamp: entry.timestamp,
        }));
        setFoodEntries(entries);
        setError('');
        console.log('NutritionTracking: Entries fetched', entries);
      } catch (err) {
        console.error('NutritionTracking: Error fetching entries', err);
        setError('Failed to fetch food entries');
        setFoodEntries([]);
      }
    };
    fetchFoodEntries();
  }, [user]);

  // Filter today’s entries
  const todayEntries = foodEntries.filter(
    (entry) => new Date(entry.timestamp).toDateString() === new Date().toDateString()
  );

  // Calculate total nutrients for today
  const calculateTotalNutrients = () => {
    return todayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totals = calculateTotalNutrients();

  const handleDeleteEntry = async (id: string) => {
    if (!user) {
      setError('Please sign in to delete entries');
      return;
    }
    try {
      console.log('NutritionTracking: Deleting entry', id);
      await axios.delete(`${NUTRITION_API_URL}${id}/`, {
        params: { userId: user.id },
      });
      setFoodEntries((entries) => entries.filter((entry) => entry.id !== id));
      setError('');
      console.log('NutritionTracking: Entry deleted', id);
    } catch (err) {
      console.error('NutritionTracking: Error deleting entry', err);
      setError('Failed to delete entry');
    }
  };

  const handleAddFood = async () => {
    setError('');
    const { food_name, calories, protein, carbs, fat } = newFood;

    // Validate inputs
    if (!food_name || !calories || !protein || !carbs || !fat) {
      setError('All fields are required');
      return;
    }
    const numericFields = { calories, protein, carbs, fat };
    for (const [key, value] of Object.entries(numericFields)) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        setError(`${key.charAt(0).toUpperCase() + key.slice(1)} must be a non-negative number`);
        return;
      }
    }

    if (!user) {
      setError('Please sign in to add entries');
      return;
    }

    try {
      const newEntry = {
        food_name,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        timestamp: new Date().toISOString(),
        userId: user.id,
      };
      console.log('NutritionTracking: Adding entry', newEntry);
      const response = await axios.post(NUTRITION_API_URL, newEntry);
      setFoodEntries((prevEntries) => [
        ...prevEntries,
        { ...newEntry, id: response.data.id },
      ]);
      setNewFood({ food_name: '', calories: '', protein: '', carbs: '', fat: '' });
      setError('');
      console.log('NutritionTracking: Entry added', response.data);
    } catch (err) {
      console.error('NutritionTracking: Error adding entry', err);
      setError('Failed to add food entry');
    }
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof typeof newFood, value: string) => {
    if (field !== 'food_name') {
      const num = parseFloat(value);
      if (value && (isNaN(num) || num < 0)) {
        return; // Prevent negative or invalid numbers
      }
    }
    setNewFood({ ...newFood, [field]: value });
  };

  // Filter entries for chart by date range
  const filteredEntries = foodEntries
    .filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      if (dateRange === 'week') {
        return entryDate >= new Date(now.setDate(now.getDate() - 7));
      }
      if (dateRange === 'month') {
        return entryDate >= new Date(now.setDate(now.getDate() - 30));
      }
      return true;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Chart data
  const chartData = {
    labels: filteredEntries.map((entry) => new Date(entry.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Calories',
        data: filteredEntries.map((entry) => entry.calories),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#f97316',
        pointBorderWidth: 2,
      },
      {
        label: 'Protein',
        data: filteredEntries.map((entry) => entry.protein),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
      },
      {
        label: 'Carbs',
        data: filteredEntries.map((entry) => entry.carbs),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#eab308',
        pointBorderWidth: 2,
      },
      {
        label: 'Fat',
        data: filteredEntries.map((entry) => entry.fat),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#ec4899',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1f2937',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
        },
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          ci.getDatasetMeta(index).hidden = !ci.getDatasetMeta(index).hidden;
          ci.update();
        },
      },
      title: {
        display: true,
        text: 'Nutrition Trends',
        color: '#1f2937',
        font: { size: 16, weight: '600' },
        padding: { top: 10, bottom: 15 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const entry = filteredEntries[context.dataIndex];
            return [
              `Food: ${entry.food_name}`,
              `Calories: ${entry.calories} kcal`,
              `Protein: ${entry.protein}g`,
              `Carbs: ${entry.carbs}g`,
              `Fat: ${entry.fat}g`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4b5563', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#4b5563', font: { size: 11 } },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutCubic',
    },
    onClick: (event: any, elements: any, chart: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedEntry(filteredEntries[index]);
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className={styles.trackingContainer}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
          Nutrition Tracking
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {!user && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please sign in to track nutrition.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Daily Summary Cards */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.summaryCard}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Today’s Summary
                </Typography>
                <Grid container spacing={2}>
                  {(['calories', 'protein', 'carbs', 'fat'] as Array<keyof typeof totals>).map((macro) => (
                    <Grid item xs={12} key={macro}>
                      <Typography variant="subtitle2">
                        {macro.charAt(0).toUpperCase() + macro.slice(1)}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box width="100%" mr={1}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((totals[macro] / dailyGoals[macro]) * 100, 100)}
                            className={`${styles.progressBar} ${styles[`progressBar${macro.charAt(0).toUpperCase() + macro.slice(1)}`]}`}
                          />
                        </Box>
                        <Box minWidth={60}>
                          <Typography variant="body2">
                            {totals[macro]}/{dailyGoals[macro]}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Nutrition Graph */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.summaryCard}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Nutrition Trends
                </Typography>
                <Box mb={2}>
                  <Button
                    variant={dateRange === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setDateRange('all')}
                    sx={{ mr: 1 }}
                  >
                    All
                  </Button>
                  <Button
                    variant={dateRange === 'week' ? 'contained' : 'outlined'}
                    onClick={() => setDateRange('week')}
                    sx={{ mr: 1 }}
                  >
                    Week
                  </Button>
                  <Button
                    variant={dateRange === 'month' ? 'contained' : 'outlined'}
                    onClick={() => setDateRange('month')}
                  >
                    Month
                  </Button>
                </Box>
                <div className={styles.chartContainer}>
                  {filteredEntries.length === 0 ? (
                    <Typography>No data available for the selected range.</Typography>
                  ) : (
                    <Line data={chartData} options={chartOptions} />
                  )}
                </div>
              </Box>
            </Paper>
          </Grid>

          {/* Food Log and History Tabs */}
          <Grid item xs={12}>
            <Paper className={styles.foodLog}>
              <Box p={3}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                  <Tab label="Today’s Food Log" />
                  <Tab label="History" />
                </Tabs>
                {tabValue === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Today’s Food Log
                    </Typography>
                    <List>
                      {todayEntries.length === 0 ? (
                        <Typography>No entries for today</Typography>
                      ) : (
                        todayEntries.map((entry) => (
                          <ListItem key={entry.id} className={styles.foodEntry}>
                            <ListItemText
                              primary={entry.food_name}
                              secondary={`${entry.calories} cal | P: ${entry.protein}g | C: ${entry.carbs}g | F: ${entry.fat}g`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={!user}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Food History
                    </Typography>
                    <List>
                      {foodEntries
                        .filter(
                          (entry) => new Date(entry.timestamp).toDateString() !== new Date().toDateString()
                        )
                        .map((entry) => (
                          <ListItem key={entry.id} className={styles.foodEntry}>
                            <ListItemText
                              primary={`${entry.food_name} (${new Date(entry.timestamp).toLocaleDateString()})`}
                              secondary={`${entry.calories} cal | P: ${entry.protein}g | C: ${entry.carbs}g | F: ${entry.fat}g`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={!user}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                    </List>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Add New Food Entry */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add New Food Entry
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Food Name"
                      fullWidth
                      value={newFood.food_name}
                      onChange={(e) => handleInputChange('food_name', e.target.value)}
                      required
                      disabled={!user}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Calories"
                      type="number"
                      fullWidth
                      value={newFood.calories}
                      onChange={(e) => handleInputChange('calories', e.target.value)}
                      inputProps={{ step: '0.1', min: '0' }}
                      required
                      disabled={!user}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Protein (g)"
                      type="number"
                      fullWidth
                      value={newFood.protein}
                      onChange={(e) => handleInputChange('protein', e.target.value)}
                      inputProps={{ step: '0.1', min: '0' }}
                      required
                      disabled={!user}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Carbs (g)"
                      type="number"
                      fullWidth
                      value={newFood.carbs}
                      onChange={(e) => handleInputChange('carbs', e.target.value)}
                      inputProps={{ step: '0.1', min: '0' }}
                      required
                      disabled={!user}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Fat (g)"
                      type="number"
                      fullWidth
                      value={newFood.fat}
                      onChange={(e) => handleInputChange('fat', e.target.value)}
                      inputProps={{ step: '0.1', min: '0' }}
                      required
                      disabled={!user}
                    />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddFood}
                    disabled={!user}
                  >
                    Add Food
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Modal for entry details */}
        <Dialog open={!!selectedEntry} onClose={() => setSelectedEntry(null)}>
          <DialogTitle>{selectedEntry?.food_name || 'Entry Details'}</DialogTitle>
          <DialogContent>
            {selectedEntry ? (
              <>
                <Typography>Calories: {selectedEntry.calories} kcal</Typography>
                <Typography>Protein: {selectedEntry.protein}g</Typography>
                <Typography>Carbs: {selectedEntry.carbs}g</Typography>
                <Typography>Fat: {selectedEntry.fat}g</Typography>
                <Typography>
                  Date: {new Date(selectedEntry.timestamp).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography>No data available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedEntry(null)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default NutritionTracking;
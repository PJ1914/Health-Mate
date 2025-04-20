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
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './NutritionTracking.module.css';
import { fetchFoodEntries, createFoodEntry, deleteFoodEntry } from '../config/apiService';

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
}

const NutritionTracking = () => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

  // Fetch food entries when component is mounted
  useEffect(() => {
    const getFoodEntries = async () => {
      const entries = await fetchFoodEntries();
      const mappedEntries: FoodEntry[] = entries.map((entry: any) => ({
        id: entry.id.toString(),
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        timestamp: new Date(entry.timestamp),
      }));
      setFoodEntries(mappedEntries);
    };
    getFoodEntries();
  }, []);

  // Calculate total nutrients
  const calculateTotalNutrients = () => {
    return foodEntries.reduce(
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
    const success = await deleteFoodEntry((id));
    if (success) {
      setFoodEntries(entries => entries.filter(entry => entry.id !== id));
    }
  };

  const handleAddFood = async () => {
    if (newFood.name && newFood.calories > 0) {
      const newEntry: FoodEntry = {
        id: (foodEntries.length + 1).toString(),  // For simplicity, auto-generate ID
        ...newFood,
        timestamp: new Date(),
      };
      try {
        const createdFood = await createFoodEntry(newEntry); // Make sure this returns the correct object
        setFoodEntries((prevEntries) => [
          ...prevEntries,
          { 
            ...createdFood, 
            id: createdFood.id.toString(), 
            protein: createdFood.protein || 0, 
            carbs: createdFood.carbs || 0, 
            fat: createdFood.fat || 0, 
            timestamp: createdFood.timestamp || new Date() 
          },
        ]);
        setNewFood({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }); // Reset form fields
      } catch (error) {
        console.error('Error adding food:', error);
      }
    }
  };

  return (
    <div className={styles.trackingContainer}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
          Nutrition Tracking
        </Typography>

        <Grid container spacing={4}>
          {/* Daily Summary Cards */}
          <Grid item xs={12} md={6}>
            <Paper className={styles.summaryCard}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Daily Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Calories</Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box width="100%" mr={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(totals.calories / dailyGoals.calories) * 100}
                          className={styles.progressBar}
                        />
                      </Box>
                      <Box minWidth={60}>
                        <Typography variant="body2">
                          {totals.calories}/{dailyGoals.calories}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {/* Repeat for Protein, Carbs, Fat */}
                  {(['protein', 'carbs', 'fat'] as Array<keyof typeof totals>).map((macro) => (
                    <Grid item xs={12} key={macro}>
                      <Typography variant="subtitle2">{macro.charAt(0).toUpperCase() + macro.slice(1)}</Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box width="100%" mr={1}>
                          <LinearProgress
                            variant="determinate"
                            value={(totals[macro] / dailyGoals[macro]) * 100}
                            className={styles.progressBar}
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

          {/* Food Log */}
          <Grid item xs={12}>
            <Paper className={styles.foodLog}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Today's Food Log
                </Typography>
                <List>
                  {foodEntries.map((entry) => (
                    <ListItem key={entry.id} className={styles.foodEntry}>
                      <ListItemText
                        primary={entry.name}
                        secondary={`${entry.calories} cal | P: ${entry.protein}g | C: ${entry.carbs}g | F: ${entry.fat}g`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
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
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Calories"
                      type="number"
                      fullWidth
                      value={newFood.calories}
                      onChange={(e) => setNewFood({ ...newFood, calories: +e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Protein (g)"
                      type="number"
                      fullWidth
                      value={newFood.protein}
                      onChange={(e) => setNewFood({ ...newFood, protein: +e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Carbs (g)"
                      type="number"
                      fullWidth
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({ ...newFood, carbs: +e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Fat (g)"
                      type="number"
                      fullWidth
                      value={newFood.fat}
                      onChange={(e) => setNewFood({ ...newFood, fat: +e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Button variant="contained" color="primary" onClick={handleAddFood}>
                    Add Food
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default NutritionTracking;

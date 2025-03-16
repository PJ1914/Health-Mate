import { useState } from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import styles from './NutritionTracking.module.css';

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
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([
    {
      id: '1',
      name: 'Grilled Chicken Salad',
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 20,
      timestamp: new Date(),
    },
    // Add more sample entries as needed
  ]);

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };

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

  const handleDeleteEntry = (id: string) => {
    setFoodEntries(entries => entries.filter(entry => entry.id !== id));
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
                  {/* Similar progress bars for protein, carbs, and fat */}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Nutrition Stats */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card className={styles.statsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Macronutrient Distribution
                    </Typography>
                    <Box className={styles.macroDistribution}>
                      {/* Add pie chart or other visualization here */}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
        </Grid>
      </Container>
    </div>
  );
};

export default NutritionTracking; 
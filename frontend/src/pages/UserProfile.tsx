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
} from '@mui/material';
import axios from 'axios';
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

const NUTRITION_API_URL = 'http://localhost:8000/api/nutrition/food/';

const UserProfile = () => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? true;

  const [nutritionEntries, setNutritionEntries] = useState<FoodEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('UserProfile: useEffect triggered', { user, authLoading });
    if (user && !authLoading) {
      console.log('UserProfile: Fetching nutrition entries for user', user.id);
      fetchNutritionEntries();
    }
  }, [user, authLoading]);

  const fetchNutritionEntries = async () => {
    if (!user) return;
    try {
      console.log('UserProfile: Sending API request to', NUTRITION_API_URL, 'with userId:', user.id);
      const response = await axios.get(NUTRITION_API_URL, {
        params: { userId: user.id },
      });
      setNutritionEntries(response.data.slice(0, 5));
      console.log('UserProfile: Nutrition entries fetched', response.data);
    } catch (err) {
      console.error('UserProfile: Error fetching nutrition entries:', err);
      setError('Failed to load health history.');
    }
  };

  console.log('UserProfile: Rendering', { authLoading, user, error, nutritionEntries });

  if (authLoading) {
    return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>User Profile</Typography>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          User Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} className={styles.profileSection} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} textAlign="center">
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h6">{user.displayName || 'Unknown'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email || 'No email'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box>
                <Typography>
                  <strong>Name:</strong> {user.displayName || 'Unknown'}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {user.email || 'No email'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} className={styles.nutritionSection} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>Health History</Typography>
          {nutritionEntries.length === 0 ? (
            <Typography color="text.secondary">No recent entries found.</Typography>
          ) : (
            <List>
              {nutritionEntries.map((entry, idx) => (
                <div key={entry.id}>
                  <ListItem>
                    <ListItemText
                      primary={entry.food_name}
                      secondary={`Calories: ${entry.calories} | Protein: ${entry.protein}g | Carbs: ${entry.carbs}g | Fat: ${entry.fat}g | Date: ${new Date(
                        entry.timestamp
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                  {idx < nutritionEntries.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile;
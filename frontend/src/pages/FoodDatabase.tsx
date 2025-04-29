import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './FoodDatabase.module.css';
import axios from 'axios';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  image: string;
}

const API_URL = 'http://localhost:8000/api/fooddb/';
const NUTRITION_API_URL = 'http://localhost:8000/api/nutrition/food/';

const FoodDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['all', 'Protein', 'Carbs', 'Vegetables', 'Fruits', 'Dairy'];

  useEffect(() => {
    const fetchFoodItems = async () => {
      if (!searchTerm) {
        setFoodItems([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const params = { search: searchTerm, category: selectedCategory };
        const response = await axios.get(API_URL, { params });
        setFoodItems(response.data);
      } catch (err) {
        setError('Failed to load food items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoodItems();
  }, [searchTerm, selectedCategory]);

  const handleAddToLog = async (item: FoodItem) => {
    try {
      const entry = {
        food_name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        userId: 'guest', // Placeholder for unauthenticated users
        timestamp: new Date().toISOString(),
      };
      await axios.post(NUTRITION_API_URL, entry);
      alert(`${item.name} added to log`);
    } catch (err) {
      setError('Failed to add food to log.');
    }
  };

  return (
    <div className={styles.databaseContainer}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
          Food Database
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Typography variant="body1" align="center" sx={{ my: 2 }}>
            Loading...
          </Typography>
        )}

        <Paper className={styles.searchSection}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3} className={styles.foodGrid}>
          {foodItems.length === 0 && !loading && searchTerm ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center">
                No foods found. Try another search term.
              </Typography>
            </Grid>
          ) : (
            foodItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card className={styles.foodCard}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image}
                    alt={item.name}
                    className={styles.foodImage}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Box className={styles.nutritionInfo}>
                      <Chip
                        label={`${item.calories.toFixed(0)} cal`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Box className={styles.macros}>
                        <Typography variant="body2" color="text.secondary">
                          P: {item.protein.toFixed(1)}g
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          C: {item.carbs.toFixed(1)}g
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          F: {item.fat.toFixed(1)}g
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddToLog(item)}
                      sx={{ mt: 1 }}
                    >
                      Add to Log
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </div>
  );
};

export default FoodDatabase;
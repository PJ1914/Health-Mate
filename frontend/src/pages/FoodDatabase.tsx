import { useState } from 'react';
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
  //IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import FilterListIcon from '@mui/icons-material/FilterList';
import styles from './FoodDatabase.module.css';

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

const FoodDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample food data
  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'Grilled Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      category: 'Protein',
      image: 'https://source.unsplash.com/featured/?grilled,chicken',
    },
    {
      id: '2',
      name: 'Brown Rice',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      category: 'Carbs',
      image: 'https://source.unsplash.com/featured/?brown,rice',
    },
    {
      id: '3',
      name: 'Broccoli',
      calories: 55,
      protein: 3.7,
      carbs: 11.2,
      fat: 0.6,
      category: 'Vegetables',
      image: 'https://source.unsplash.com/featured/?broccoli',
    },
    {
      id: '4',
      name: 'Banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      category: 'Fruits',
      image: 'https://source.unsplash.com/featured/?banana',
    },
    {
      id: '5',
      name: 'Greek Yogurt',
      calories: 130,
      protein: 12,
      carbs: 9,
      fat: 4,
      category: 'Dairy',
      image: 'https://source.unsplash.com/featured/?yogurt',
    },
    {
      id: '6',
      name: 'Salmon Fillet',
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 13,
      category: 'Protein',
      image: 'https://source.unsplash.com/featured/?salmon',
    },
    {
      id: '7',
      name: 'Sweet Potato',
      calories: 103,
      protein: 2,
      carbs: 24,
      fat: 0.2,
      category: 'Carbs',
      image: 'https://source.unsplash.com/featured/?sweet,potato',
    },
    {
      id: '8',
      name: 'Spinach',
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      category: 'Vegetables',
      image: 'https://source.unsplash.com/featured/?spinach',
    }
  ];

  const categories = ['all', 'Protein', 'Carbs', 'Vegetables', 'Fruits', 'Dairy'];

  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.databaseContainer}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
          Food Database
        </Typography>

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
          {filteredFoodItems.map((item) => (
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
                      label={`${item.calories} cal`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Box className={styles.macros}>
                      <Typography variant="body2" color="text.secondary">
                        P: {item.protein}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        C: {item.carbs}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        F: {item.fat}g
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default FoodDatabase; 
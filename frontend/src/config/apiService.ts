import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/nutrition/'; // Update with your backend URL if needed

// Define types for the data
export interface FoodEntry {
    id: number;
    name: string;
    calories: number;
    [key: string]: any; // Add additional fields as needed
}

export interface FoodSummary {
    totalCalories: number;
    [key: string]: any; // Add additional fields as needed
}

// Fetch all food entries
export const fetchFoodEntries = async (): Promise<FoodEntry[]> => {
    try {
        const response = await axios.get<FoodEntry[]>(`${API_URL}foods/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching food entries:', error);
        return [];
    }
};

// Create a new food entry
export const createFoodEntry = async (foodData: Omit<FoodEntry, 'id'>): Promise<FoodEntry> => {
    try {
        const response = await axios.post<FoodEntry>(`${API_URL}foods/`, foodData);
        return response.data;
    } catch (error) {
        console.error('Error creating food entry:', error);
        throw error;
    }
};

// Delete a food entry by ID
export const deleteFoodEntry = async (id: number): Promise<boolean> => {
    try {
        await axios.delete(`${API_URL}foods/${id}/`);
        return true;
    } catch (error) {
        console.error('Error deleting food entry:', error);
        return false;
    }
};

// Get summary of food entries
export const fetchFoodSummary = async (): Promise<FoodSummary> => {
    try {
        const response = await axios.get<FoodSummary>(`${API_URL}foods/summary/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching food summary:', error);
        return {} as FoodSummary;
    }
};

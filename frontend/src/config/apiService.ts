import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/nutrition/';

export interface FoodEntry {
    id: string; // UUID string from Firestore
    name: string;
    calories: number;
    [key: string]: any;
}

export interface FoodSummary {
    totalCalories: number;
    [key: string]: any;
}

// Fetch all food entries
export const fetchFoodEntries = async (): Promise<FoodEntry[]> => {
    try {
        const response = await axios.get<FoodEntry[]>(`${API_URL}food/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching food entries:', error);
        return [];
    }
};

// Create a new food entry
export const createFoodEntry = async (foodData: Omit<FoodEntry, 'id'>): Promise<FoodEntry> => {
    try {
        const response = await axios.post<FoodEntry>(`${API_URL}food/`, foodData);
        return response.data;
    } catch (error) {
        console.error('Error creating food entry:', error);
        throw error;
    }
};

// ❗ Fix: Delete a food entry by string ID
export const deleteFoodEntry = async (id: string): Promise<boolean> => {
    try {
        await axios.delete(`${API_URL}food/${id}/`);
        return true;
    } catch (error) {
        console.error('Error deleting food entry:', error);
        return false;
    }
};

// Get summary of food entries
export const fetchFoodSummary = async (): Promise<FoodSummary> => {
    try {
        const response = await axios.get<FoodSummary>(`${API_URL}summary/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching food summary:', error);
        return {} as FoodSummary;
    }
};

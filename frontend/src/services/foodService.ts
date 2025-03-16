import { api } from '../config/api';

export interface Food {
    id: number;
    name: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image_url: string;
    food_class: string;
}

export interface DetectionResult {
    detected_foods: Food[];
    message: string;
}

export const foodService = {
    // Get all foods
    getAllFoods: async () => {
        const response = await api.get<Food[]>('/foods/');
        return response.data;
    },

    // Get foods by category
    getFoodsByCategory: async (category: string) => {
        const response = await api.get<Food[]>(`/foods/?category=${category}`);
        return response.data;
    },

    // Search foods by name
    searchFoods: async (query: string) => {
        const response = await api.get<Food[]>(`/foods/?search=${query}`);
        return response.data;
    },

    // Detect food from image
    detectFood: async (image: File) => {
        const formData = new FormData();
        formData.append('image', image);

        const response = await api.post<DetectionResult>('/detect/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
}; 
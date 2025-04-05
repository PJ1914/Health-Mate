import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface DetectionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  image_url?: string;
}

const FoodDetection = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isRealTimeDetection, setIsRealTimeDetection] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsLoading(true);
        setError(null);
        try {
          // Convert base64 to blob
          const base64Data = imageSrc.split(',')[1];
          const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
          
          // Create form data
          const formData = new FormData();
          formData.append('image', blob, 'capture.jpg');

          const response = await fetch('http://localhost:8000/api/detect/', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
          }

          if (data.detected_foods && Array.isArray(data.detected_foods)) {
            setDetectionResults(data.detected_foods);
          } else {
            throw new Error('Invalid response format from server');
          }
        } catch (error) {
          console.error('Error detecting food:', error);
          setError(error instanceof Error ? error.message : 'An error occurred');
          setDetectionResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [webcamRef]);

  // Start/stop real-time detection
  const toggleRealTimeDetection = useCallback(() => {
    setIsRealTimeDetection(prev => {
      if (!prev) {
        // Starting real-time detection
        detectionInterval.current = setInterval(capture, 2000); // Detect every 2 seconds
        return true;
      } else {
        // Stopping real-time detection
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
        }
        return false;
      }
    });
  }, [capture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Food Detection
      </Typography>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 720,
                  height: 400,
                  facingMode: "user"
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CameraAltIcon />}
                onClick={capture}
                disabled={isLoading || isRealTimeDetection}
              >
                {isLoading ? 'Processing...' : 'Detect Once'}
              </Button>
              <Button
                variant="contained"
                color={isRealTimeDetection ? "error" : "success"}
                startIcon={<PhotoCameraIcon />}
                onClick={toggleRealTimeDetection}
                disabled={isLoading}
              >
                {isRealTimeDetection ? 'Stop Real-time' : 'Start Real-time'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detection Results
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {detectionResults.length > 0 ? (
                  detectionResults
                    .slice(0, 5) // Show only top 5 results
                    .map((result, index) => (
                      <div key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`${result.name} (${(result.confidence * 100).toFixed(1)}%)`}
                            secondary={
                              <>
                                <Typography component="span" display="block">
                                  Calories: {result.calories} kcal
                                </Typography>
                                <Typography component="span" display="block">
                                  Protein: {result.protein}g | Carbs: {result.carbs}g | Fat: {result.fat}g
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < Math.min(detectionResults.length - 1, 4) && <Divider />}
                      </div>
                    ))
                ) : (
                  <Typography color="text.secondary" align="center">
                    No food detected yet. Take a photo to begin.
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FoodDetection; 
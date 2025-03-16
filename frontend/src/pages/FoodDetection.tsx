import { useState, useRef, useCallback } from 'react';
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
  food_name: string;
  calories: number;
  confidence: number;
}

const FoodDetection = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsLoading(true);
        try {
          const response = await fetch('http://localhost:8000/api/detect-food/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageSrc }),
          });

          const data = await response.json();
          setDetectionResults(data.results);
        } catch (error) {
          console.error('Error detecting food:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [webcamRef]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Food Detection
      </Typography>

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
                  facingMode: 'user',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<CameraAltIcon />}
                onClick={capture}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Detect Food'}
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
                  detectionResults.map((result, index) => (
                    <div key={index}>
                      <ListItem>
                        <ListItemText
                          primary={result.food_name}
                          secondary={`Calories: ${result.calories} kcal | Confidence: ${(
                            result.confidence * 100
                          ).toFixed(1)}%`}
                        />
                      </ListItem>
                      {index < detectionResults.length - 1 && <Divider />}
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
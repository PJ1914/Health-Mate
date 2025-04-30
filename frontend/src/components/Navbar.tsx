import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { getAuth, signOut, User } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Anchor element for the menu

  // Listen for authentication state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe(); // Clean up on component unmount
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open the menu when profile avatar is clicked
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };

  // Removed handleProfileNavigation function as requested

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #6a1b9a, #ab47bc)', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RestaurantIcon sx={{ mr: 2, fontSize: '2rem', color: '#fff' }} />
          <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: '600' }}>
            Health Mate
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={RouterLink} to="/" sx={{ fontSize: '1rem', fontWeight: '500' }}>
            Home
          </Button>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  mr: 1,
                  cursor: 'pointer',
                  width: 35,
                  height: 35,
                  border: '2px solid #fff',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                }}
                src={user.photoURL || ''}
                onClick={handleProfileMenuOpen} // Open menu on click
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose} // Close the menu when clicking outside or on a menu item
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right', // Align the menu to the right
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right', // Align the menu to open below the profile avatar
                }}
                sx={{ mt: 2 }}
              >
                <MenuItem component={RouterLink} to="/Profile" >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login" sx={{ fontSize: '1rem', fontWeight: '500' }}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

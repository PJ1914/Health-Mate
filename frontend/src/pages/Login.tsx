import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import styles from './Login.module.css';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome to Health Mate</h1>
        <p className={styles.subtitle}>Your personal health companion</p>
        
        <button 
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className={styles.googleIcon} />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login; 
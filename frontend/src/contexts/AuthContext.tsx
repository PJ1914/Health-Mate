import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        console.log('AuthContext: onAuthStateChanged fired', { firebaseUser });
        if (firebaseUser) {
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(userData);
          console.log('AuthContext: User set', userData);
        } else {
          setUser(null);
          console.log('AuthContext: No user');
        }
        setLoading(false);
        console.log('AuthContext: Loading set to false');
      },
      (error) => {
        console.error('AuthContext: onAuthStateChanged error', error);
        setLoading(false);
        setUser(null);
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up onAuthStateChanged');
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('AuthContext: Logout successful');
    } catch (err) {
      console.error('AuthContext: Logout failed', err);
    }
  };

  return (
<AuthContext.Provider value={{ user, logout, loading }}>
  {children}
</AuthContext.Provider>

  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth: AuthContext is null');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
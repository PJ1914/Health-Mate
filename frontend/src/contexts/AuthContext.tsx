import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config/firebase';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setError(null);
          console.debug('AuthContext: User authenticated', { uid: firebaseUser.uid });
        } else {
          setUser(null);
          setError(null);
          console.debug('AuthContext: No user authenticated');
        }
        setLoading(false);
      },
      (err) => {
        console.error('AuthContext: Authentication error', err);
        setError('Failed to authenticate. Please try again.');
        setUser(null);
        setLoading(false);
      }
    );

    return () => {
      console.debug('AuthContext: Unsubscribing from onAuthStateChanged');
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      console.debug('AuthContext: Logout successful');
    } catch (err) {
      console.error('AuthContext: Logout failed', err);
      setError('Failed to log out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth: Must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
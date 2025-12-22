    // context/AuthContext.jsx
    'use client';

    import { createContext, useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';

    export const AuthContext = createContext(null);

    export function AuthProvider({ children }) {
      const [user, setUser] = useState(null);
      const [token, setToken] = useState(null);
      const [loading, setLoading] = useState(true);
      const router = useRouter();

      useEffect(() => {
        // console.log("[AuthContext useEffect] Starting initial auth check."); // Debug
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            // console.log("AuthContext useEffect: Found existing session. User:", parsedUser, "Token:", storedToken); // Debug success
          } catch (e) {
            console.error("AuthContext useEffect: Error parsing user from localStorage, clearing.", e); // Keep console.error
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
          // console.log("AuthContext useEffect: No existing session found in localStorage."); // Debug no session
        }
        setLoading(false);
        // console.log("AuthContext useEffect: Loading set to false. Current isAuthenticated:", !!user && !!token); // Debug final state
      }, []);

      const login = (newToken, userData) => {
        // console.log("[AuthContext Login] Function called. New Token:", newToken, "User Data:", userData); // Debug
        if (!newToken || !userData) {
          console.error("[AuthContext Login] Error: Missing newToken or userData. Aborting localStorage set."); // Keep console.error
          return;
        }
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        // console.log("[AuthContext Login] localStorage and state set. Redirecting to /"); // Debug
        router.push('/');
      };

      const logout = () => {
        // console.log("[AuthContext Logout] Clearing token and user."); // Debug
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/');
      };

      const authContextValue = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        hasRole: (requiredRole) => user?.role === requiredRole,
        isSeller: user?.role === 'seller',
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer',
      };

      // console.log( // Debug provider state on render
      //   "[AuthContext Render] Current State: User:", user,
      //   "Token:", token ? "Exists (" + token.substring(0, 10) + "...)" : "null",
      //   "Loading:", loading,
      //   "isAuthenticated:", authContextValue.isAuthenticated,
      //   "isSeller:", authContextValue.isSeller
      // );

      return (
        <AuthContext.Provider value={authContextValue}>
          {children}
        </AuthContext.Provider>
      );
    }
    
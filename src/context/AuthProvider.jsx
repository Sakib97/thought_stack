import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Check active session on load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // nullish coalescing operator (??), which returns the right-hand value (null in this case) 
        // if the left-hand value (session?.user) is null or undefined. Otherwise, it returns the left-hand operand

      }
    );

    return () => subscription.unsubscribe();
  }, []);

   return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

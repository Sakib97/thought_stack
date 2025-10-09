import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { set } from "date-fns";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMeta, setUserMeta] = useState(null);

  useEffect(() => {
    // Check active session on load
    const getSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // setLoading(false);

      // Check user metadata
      if (session) {
        const { data: userMetaData, error: userMetaError } = await supabase
          .from("users_meta")
          .select("*")
          .eq("uid", session.user.id)
          .single();

        if (userMetaError) {
          console.error("Error fetching user metadata:", userMetaError);
          setUserMeta(null);
        } else {
          setUserMeta(userMetaData);
        }
      }

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setUser(null);
        setUserMeta(null);
        setLoading(false);
        return;
      }
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
    <AuthContext.Provider value={{
      user,
      setUser,
      setUserMeta,
      setLoading,
      userMeta,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

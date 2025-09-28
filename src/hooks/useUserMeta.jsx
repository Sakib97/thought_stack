import { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthProvider";

const useUserMeta = () => {
    const { user } = useAuth();
    const [userMeta, setUserMeta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserMeta = async () => {
            if (!user) {
                setLoading(false);
                return <p>Not Logged In !</p>;
            }

            const { data, error } = await supabase
                .from("users_meta")
                .select("*")
                .eq("uid", user.id)
                .single();

            if (error) {
                console.error("Error fetching user metadata:", error);
            } else {
                setUserMeta(data);
            }
            setLoading(false);
        };

        fetchUserMeta();
    }, []);

    return { userMeta, loading };
};

export default useUserMeta;

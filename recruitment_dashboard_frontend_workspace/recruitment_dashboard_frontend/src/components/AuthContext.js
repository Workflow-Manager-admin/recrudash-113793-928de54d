import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// PUBLIC_INTERFACE
export const AuthContext = createContext();

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // includes role etc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({data})=>{
      setUser(data?.session?.user ?? null);
      if (data?.session?.user) {
        fetchProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async (id) => {
    setLoading(true);
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      setProfile({ role: 'candidate' }); // fallback
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return error;
  };

  const signUp = async (email, password, role) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data?.user && !error) {
      // create profile with role
      await supabase.from('profiles').insert([{ id: data.user.id, email, role }]);
    }
    setLoading(false);
    return error;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const value = {
    user,
    profile,
    loading,
    login,
    signUp,
    logout,
    setProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

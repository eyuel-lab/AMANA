import { useEffect, useState } from "react";
import { ensureProfile } from "@/lib/profile";
import { useAuth } from "@/lib/AuthContext";

export default function useProfile() {
  const { user, isLoadingAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (isLoadingAuth) return undefined;
    if (!user) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    ensureProfile(user)
      .then((result) => {
        if (active) setProfile(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, isLoadingAuth]);

  return { profile, setProfile, loading, user };
}
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { cacheGuideProfile, loadCachedGuideProfile, resolveGuideProfile } from "../../navigation/guideRouting";
import { GuideProfile } from "../../types";

export function useGuideProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const resolved = await resolveGuideProfile(user.id);
      setProfile(resolved);
    } catch (e: any) {
      setError(e.message || "Could not load guide profile.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (next: GuideProfile) => {
      await cacheGuideProfile(next);
      setProfile(next);
    },
    []
  );

  const readCached = useCallback(async () => {
    if (!user) return null;
    return loadCachedGuideProfile(user.id);
  }, [user]);

  return { profile, loading, error, refresh, updateProfile, readCached, user };
}

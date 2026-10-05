import { useState } from '#imports'

export const useProfile = () => {
  const supabase = useSupabaseClient<any>()
  const profilesCache = useState<Record<string, any>>('profiles-cache', () => ({}))

  const fetchProfile = async (userId: string, options: { force?: boolean } = {}) => {
    if (!userId) return null;
    
    // Якщо профіль вже є в кеші, повертаємо його (крім випадків, коли потрібні свіжі дані)
    if (!options.force && userId in profilesCache.value) {
      return profilesCache.value[userId];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (data) {
      profilesCache.value[userId] = data;
      return data;
    }
    
    // Якщо профілю немає (помилка або не знайдено), кешуємо null, щоб не робити зайвих запитів
    profilesCache.value[userId] = null;
    return null;
  };

  return {
    fetchProfile,
    profilesCache
  };
}

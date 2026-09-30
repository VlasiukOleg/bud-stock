import { useState } from '#imports'

export const useProfile = () => {
  const supabase = useSupabaseClient<any>()
  const profilesCache = useState<Record<string, any>>('profiles-cache', () => ({}))

  const fetchProfile = async (userId: string) => {
    if (!userId) return null;
    
    // Якщо профіль вже є в кеші, повертаємо його
    if (profilesCache.value[userId]) {
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
    
    // Якщо профілю немає (помилка або не знайдено), зберігаємо пустий об'єкт, щоб не робити зайвих запитів
    profilesCache.value[userId] = {};
    return null;
  };

  return {
    fetchProfile,
    profilesCache
  };
}

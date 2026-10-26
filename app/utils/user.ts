export const getUserDisplayName = (
  profile?: {
    full_name?: string | null;
    email?: string | null;
    user_metadata?: { full_name?: string | null };
  } | null
): string => {
  if (!profile) return 'Користувач BudStock';

  if (profile.full_name) return profile.full_name;
  if (profile.user_metadata?.full_name) return profile.user_metadata.full_name;

  if (profile.email) return profile.email.split('@')[0] || 'Користувач BudStock';

  return 'Користувач BudStock';
};

export const getUserAvatarUrl = (userOrProfile?: any | null): string | undefined => {
  if (!userOrProfile) return undefined;
  const target = userOrProfile.value !== undefined ? userOrProfile.value : userOrProfile;
  if (!target) return undefined;

  return target.avatar_url || target.user_metadata?.avatar_url || undefined;
};


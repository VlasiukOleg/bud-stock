export function getUserDisplayName(profile: { full_name?: string | null, email?: string | null, user_metadata?: { full_name?: string | null } } | null): string {
  if (!profile) return 'Користувач BudStock'
  
  if (profile.full_name) return profile.full_name
  if (profile.user_metadata?.full_name) return profile.user_metadata.full_name
  
  if (profile.email) return profile.email.split('@')[0] || 'Користувач BudStock'
  
  return 'Користувач BudStock'
}

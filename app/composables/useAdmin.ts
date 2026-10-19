export const ADMIN_EMAILS = [
  'ikslprint@gmail.com',
];

export const useAdmin = () => {
  const user = useSupabaseUser();

  const isAdmin = computed(() => {
    const email = user.value?.email?.toLowerCase();
    if (!email) return false;
    return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
  });

  return {
    isAdmin,
    adminEmails: ADMIN_EMAILS,
  };
};

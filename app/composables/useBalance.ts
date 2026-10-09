import { useState } from '#imports'

export const useBalance = () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()
  
  // Глобальний стейт для балансу (кеш)
  const balance = useState<number | null>('user-balance-cache', () => null)
  
  // Локальний стейт завантаження (не можна передавати через SSR useState, щоб не зависав '---')
  const isFetching = ref(false)

  const fetchBalance = async (force: boolean = false) => {
    if (!user.value?.sub) return null;
    
    // Якщо вже є в кеші і не примусове оновлення — повертаємо кеш
    if (!force && balance.value !== null) {
      return balance.value;
    }

    // Запобігаємо паралельним запитам, якщо вже вантажимо
    if (isFetching.value && !force) {
      return balance.value;
    }

    isFetching.value = true;
    try {
      const { data, error } = await supabase.rpc('get_my_balance');
      if (!error && data !== null) {
        balance.value = data as number;
        return data as number;
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      isFetching.value = false;
    }
    
    return null;
  };

  const deductBalanceLocally = (amount: number) => {
    if (balance.value !== null) {
      balance.value -= amount;
    }
  }

  const addBalanceLocally = (amount: number) => {
    if (balance.value !== null) {
      balance.value += amount;
    }
  }

  return {
    balance,
    isFetching,
    fetchBalance,
    deductBalanceLocally,
    addBalanceLocally
  };
}

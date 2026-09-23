export const useListings = () => {
  const client = useSupabaseClient<any>()

  const getLatestListings = async (limitCount = 15) => {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount)
      
    if (error) {
      console.error('Помилка завантаження останніх оголошень:', error)
      throw error
    }
    
    return data || []
  }
  
  const getUserListings = async (userId: string ) => {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Помилка завантаження оголошень користувача:', error)
      throw error
    }
    
    return data || []
  }

  const getAllListings = async () => {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Помилка завантаження всіх оголошень:', error)
      throw error
    }
    
    return data || []
  }

  return {
    getLatestListings,
    getUserListings,
    getAllListings
  }
}

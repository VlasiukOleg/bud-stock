export const useListings = () => {
  const client = useSupabaseClient<any>()

  const getLatestListings = async (limitCount = 15) => {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .or('listing_state.eq.active,listing_state.is.null') // Активні або старі (де ще немає статусу)
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
      .or('listing_state.neq.deleted,listing_state.is.null') // Всі крім видалених (старі оголошення мають null)
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
      .or('listing_state.eq.active,listing_state.is.null') // Активні або старі
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Помилка завантаження всіх оголошень:', error)
      throw error
    }
    
    return data || []
  }

  const updateListingState = async (listingId: string, newState: 'active' | 'sold' | 'deactivated' | 'deleted') => {
    const { error } = await client
      .from('listings')
      .update({ listing_state: newState })
      .eq('id', listingId)

    if (error) {
      console.error(`Помилка оновлення статусу (${newState}) оголошення:`, error)
      throw error
    }
    
    return true
  }

  const deleteListing = async (listingId: string) => {
    // Soft Delete: не видаляємо з бази, а просто ставимо статус deleted
    return await updateListingState(listingId, 'deleted')
  }

  const updateListing = async (listingId: string, payload: Record<string, any>) => {
    const { error } = await client
      .from('listings')
      .update(payload)
      .eq('id', listingId)

    if (error) {
      console.error('Помилка оновлення оголошення:', error)
      throw error
    }

    return true
  }

  return {
    getLatestListings,
    getUserListings,
    getAllListings,
    updateListingState,
    deleteListing,
    updateListing
  }
}

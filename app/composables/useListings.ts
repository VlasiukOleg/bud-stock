import { getSearchQueryVariants } from "~/utils/smartSearch";

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

  const incrementViews = async (listingId: string) => {
    // Виклик RPC функції на стороні бази даних (Supabase)
    const { error } = await client.rpc('increment_views', {
      p_listing_id: listingId
    })

    if (error) {
      console.error('Помилка збільшення переглядів:', error)
      return false
    }
    return true
  }

  const getListingById = async (id: string | number) => {
    // 1. Спочатку шукаємо в основній таблиці listings
    const { data: realListing } = await client
      .from('listings')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (realListing) {
      return realListing
    }

    // 2. Якщо не знайдено, перевіряємо таблицю mock_listings
    const { data: mockListing } = await client
      .from('mock_listings')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    return mockListing || null
  }

  const searchListings = async (params: {
    searchQuery?: string;
    userLat?: number;
    userLng?: number;
    radiusMeters?: number;
    categoryId?: string;
    status?: string;
    searchInDescription?: boolean;
    useMock?: boolean;
    limit?: number;
    offset?: number;
    fetchAll?: boolean;
    onlyMapFields?: boolean;
    onlyCategoryFields?: boolean;
  } = {}) => {
    const rawQuery = params.searchQuery ? params.searchQuery.trim() : "";
    const variants = rawQuery && rawQuery.length >= 3 ? getSearchQueryVariants(rawQuery) : [rawQuery || null];

    const fetchSingleVariant = async (queryVariant: string | null) => {
      const fetchAll = params.fetchAll ?? false;

      if (fetchAll) {
        const allResults: any[] = [];
        let currentOffset = params.offset || 0;
        const chunkSize = 15000;

        while (true) {
          let req = client.rpc('search_listings', {
            p_search_query: queryVariant || null,
            p_user_lat: params.userLat ?? null,
            p_user_lng: params.userLng ?? null,
            p_radius_meters: params.radiusMeters ?? null,
            p_category_id: params.categoryId || null,
            p_status: params.status || 'all',
            p_search_in_desc: params.searchInDescription || false,
            p_use_mock: params.useMock || false,
            p_limit: chunkSize,
            p_offset: currentOffset,
          });

          if (params.onlyCategoryFields) {
            req = req.select('id, category_id');
          } else if (params.onlyMapFields) {
            req = req.select('id, latitude, longitude, is_exact_location, price');
          }

          const { data, error } = await req;

          if (error) {
            console.error('Помилка пошуку оголошень (RPC search_listings):', error);
            throw error;
          }

          if (!data || data.length === 0) break;
          allResults.push(...data);

          if (data.length < chunkSize) break;
          currentOffset += chunkSize;

          if (currentOffset >= 20000) break;
        }

        return allResults;
      }

      let req = client.rpc('search_listings', {
        p_search_query: queryVariant || null,
        p_user_lat: params.userLat ?? null,
        p_user_lng: params.userLng ?? null,
        p_radius_meters: params.radiusMeters ?? null,
        p_category_id: params.categoryId || null,
        p_status: params.status || 'all',
        p_search_in_desc: params.searchInDescription || false,
        p_use_mock: params.useMock || false,
        p_limit: params.limit || 20,
        p_offset: params.offset || 0,
      });

      if (params.onlyCategoryFields) {
        req = req.select('id, category_id');
      } else if (params.onlyMapFields) {
        req = req.select('id, latitude, longitude, is_exact_location, price');
      }

      const { data, error } = await req;

      if (error) {
        console.error('Помилка пошуку оголошень (RPC search_listings):', error);
        throw error;
      }

      return data || [];
    };

    // Якщо є кілька мовних варіантів (напр. "гипсокартон" та "гіпсокартон"), шукаємо паралельно і об'єднуємо
    if (variants.length > 1) {
      const resultsArrays = await Promise.all(variants.map((v) => fetchSingleVariant(v)));
      const seenIds = new Set<string | number>();
      const merged: any[] = [];
      for (const arr of resultsArrays) {
        for (const item of arr) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            merged.push(item);
          }
        }
      }
      return merged;
    }

    return await fetchSingleVariant(variants[0] || null);
  };

  const countListings = async (params: {
    searchQuery?: string;
    userLat?: number;
    userLng?: number;
    radiusMeters?: number;
    categoryId?: string;
    status?: string;
    searchInDescription?: boolean;
    useMock?: boolean;
  } = {}) => {
    const rawQuery = params.searchQuery ? params.searchQuery.trim() : "";
    const variants = rawQuery && rawQuery.length >= 3 ? getSearchQueryVariants(rawQuery) : [rawQuery || null];

    // Якщо запит без мовних варіантів або без тексту (напр. просто вибір категорії/радіуса)
    if (variants.length <= 1) {
      const { data, error } = await client
        .rpc('search_listings', {
          p_search_query: variants[0] || null,
          p_user_lat: params.userLat ?? null,
          p_user_lng: params.userLng ?? null,
          p_radius_meters: params.radiusMeters ?? null,
          p_category_id: params.categoryId || null,
          p_status: params.status || 'all',
          p_search_in_desc: params.searchInDescription || false,
          p_use_mock: params.useMock || false,
          p_limit: 50000,
          p_offset: 0,
        })
        .select('count');

      if (error) {
        console.error('Помилка підрахунку оголошень (RPC search_listings count):', error);
        throw error;
      }

      const total = (data as any[])?.[0]?.count;
      return typeof total === 'number' ? total : 0;
    }

    // Для двомовних запитів (напр. "гипсокартон" і "гіпсокартон")
    // беремо тільки легкий select('id') і дедуплікуємо за ID
    const resultsArrays = await Promise.all(
      variants.map((v) =>
        client
          .rpc('search_listings', {
            p_search_query: v || null,
            p_user_lat: params.userLat ?? null,
            p_user_lng: params.userLng ?? null,
            p_radius_meters: params.radiusMeters ?? null,
            p_category_id: params.categoryId || null,
            p_status: params.status || 'all',
            p_search_in_desc: params.searchInDescription || false,
            p_use_mock: params.useMock || false,
            p_limit: 50000,
            p_offset: 0,
          })
          .select('id')
      )
    );

    const seenIds = new Set<string | number>();
    for (const res of resultsArrays) {
      if (Array.isArray(res.data)) {
        for (const item of res.data) {
          seenIds.add(item.id);
        }
      } else if (res.data && 'id' in res.data) {
        seenIds.add(res.data.id);
      }
    }
    return seenIds.size;
  };

  return {
    getLatestListings,
    getUserListings,
    getAllListings,
    getListingById,
    searchListings,
    countListings,
    updateListingState,
    deleteListing,
    updateListing,
    incrementViews
  }
}

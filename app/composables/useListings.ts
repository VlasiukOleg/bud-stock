import { getSearchQueryVariants } from "~/utils/smartSearch";
import { LISTING_DURATION_DAYS } from "~/constants/listing";

export const useListings = () => {
  const client = useSupabaseClient<any>()

  const getLatestListings = async (limitCount = 15) => {
    const now = new Date().toISOString()
    const { data, error } = await client
      .from('listings')
      .select('*')
      .or('listing_state.eq.active,listing_state.is.null') // Активні або старі (де ще немає статусу)
      .or(`expires_at.gt.${now},expires_at.is.null`) // Не протерміновані або старі
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
    const now = new Date().toISOString()
    const { data, error } = await client
      .from('listings')
      .select('*')
      .or('listing_state.eq.active,listing_state.is.null') // Активні або старі
      .or(`expires_at.gt.${now},expires_at.is.null`) // Не протерміновані або старі
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Помилка завантаження всіх оголошень:', error)
      throw error
    }
    
    return data || []
  }

  const updateListingState = async (
    listingId: string, 
    newState: 'active' | 'moderation' | 'rejected' | 'sold' | 'deactivated' | 'deleted',
    currentExpiresAt?: string | null
  ) => {
    const updates: Record<string, any> = { listing_state: newState }
    const now = Date.now()

    if (newState === 'active') {
      const isStillValid = currentExpiresAt && new Date(currentExpiresAt).getTime() > now
      if (!isStillValid) {
        // Лише якщо термін уже закінчився або його не було — даємо новий термін на 25 днів
        updates.expires_at = new Date(now + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
      }
      // Якщо термін ще діє (наприклад, залишалося 23 дні) — НЕ змінюємо expires_at, залишок зберігається!
    } else if (newState === 'deactivated' || newState === 'rejected') {
      // Фіксуємо момент неактивності, якщо попередній термін уже минув або був відсутній
      if (!currentExpiresAt || new Date(currentExpiresAt).getTime() <= now) {
        updates.expires_at = new Date().toISOString()
      }
    }

    const updatesWithUpdatedAt = { ...updates, updated_at: new Date().toISOString() }
    let { error } = await client
      .from('listings')
      .update(updatesWithUpdatedAt)
      .eq('id', listingId)

    if (error && error.message?.includes('updated_at')) {
      // Fallback якщо в базі ще не створено колонку updated_at
      const fallbackRes = await client
        .from('listings')
        .update(updates)
        .eq('id', listingId)
      error = fallbackRes.error
    }

    if (error) {
      console.error(`Помилка оновлення статусу (${newState}) оголошення:`, error)
      throw error
    }
    
    return true
  }

  const renewListing = async (listingId: string) => {
    const newExpiresAt = new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await client
      .from('listings')
      .update({
        listing_state: 'active',
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)

    if (error) {
      console.error('Помилка продовження оголошення:', error)
      throw error
    }
    return true
  }

  const getModerationListings = async () => {
    const { data, error } = await client
      .from('listings')
      .select('*')
      .eq('listing_state', 'moderation')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Помилка завантаження оголошень на модерації:', error)
      throw error
    }
    return data || []
  }

  const moderateListing = async (listingId: string, action: 'approve' | 'reject') => {
    // 1. Спочатку пробуємо через безпечну RPC функцію (SECURITY DEFINER), яка дозволяє адміністратору модерацію
    const { data: rpcSuccess, error: rpcError } = await client.rpc('moderate_listing', {
      p_listing_id: listingId,
      p_action: action,
      p_duration_days: LISTING_DURATION_DAYS
    })

    if (!rpcError) {
      return true
    }

    // 2. Якщо RPC ще не створено, пробуємо прямий update
    console.warn('RPC moderate_listing error, falling back to direct update:', rpcError)
    const updates: Record<string, any> = {
      listing_state: action === 'approve' ? 'active' : 'rejected',
      expires_at: action === 'approve'
        ? new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    const { data, error } = await client
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()

    if (error) {
      console.error(`Помилка модерації (${action}) оголошення:`, error)
      throw error
    }
    if (!data || data.length === 0) {
      throw new Error('Помилка доступу до зміни оголошення в Supabase (потрібно створити SQL функцію moderate_listing).')
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
    renewListing,
    getModerationListings,
    moderateListing,
    deleteListing,
    updateListing,
    incrementViews
  }
}

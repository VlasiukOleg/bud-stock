import type { Chat, Message, Product } from '~/types';

// Plain global variables to ensure only ONE instance of the subscription and watcher exists
let messageSubscription: any = null;
let fetchChatsPromise: Promise<void> | null = null;
let isAuthListenerRegistered = false;
let lastFetchedUserId: string | null = null;

export const useChat = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();
  const route = useRoute();
  const { t } = useI18n();

  const activeChats = useState<Chat[]>('active-chats', () => []);
  const currentChat = useState<Chat | null>('current-chat', () => null);
  const currentMessages = useState<Message[]>('current-messages', () => []);
  const isSlideoverOpen = useState('chat-slideover', () => false);
  const unreadCounts = useState<Record<string, number>>('unread-counts', () => ({}));
  const isLoadingChats = useState('is-loading-chats', () => true);

  const unreadCount = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0));

  const getUserId = () => user.value?.id || (user.value as any)?.sub;
  const { fetchProfile, profilesCache } = useProfile();

  // Отримати всі чати юзера
  const fetchChats = async () => {
    const userId = getUserId();
    if (!userId) {
      isLoadingChats.value = false;
      return;
    }
    
    isLoadingChats.value = true;
    const { data, error } = await supabase
      .from('chats')
      .select('*, product:listings(*)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      activeChats.value = data as any[];
      
      if (activeChats.value.length > 0) {
        // Отримуємо всі непрочитані повідомлення для цих чатів
        const { data: unreadData } = await supabase
          .from('messages')
          .select('chat_id')
          .eq('is_read', false)
          .neq('sender_id', userId)
          .in('chat_id', activeChats.value.map(c => c.id));
          
        const counts: Record<string, number> = {};
        if (unreadData) {
          for (const msg of unreadData as any[]) {
            counts[msg.chat_id] = (counts[msg.chat_id] || 0) + 1;
          }
        }
        unreadCounts.value = counts;
      } else {
        unreadCounts.value = {};
      }
    }
    isLoadingChats.value = false;
  };

  // Отримати повідомлення конкретного чату
  const fetchMessages = async (chatId: string) => {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      currentMessages.value = data as unknown as Message[];
      
      // Завжди очищаємо лічильник для цього конкретного чату, бо ми щойно його відкрили
      if (unreadCounts.value[chatId]) {
        unreadCounts.value[chatId] = 0;
      }
      
      // Помічаємо непрочитані повідомлення від іншого юзера як прочитані у базі
      if (userId) {
        const unreadMsgIds = (data as any[])
          .filter(m => m.is_read === false && m.sender_id !== userId)
          .map(m => m.id);

        if (unreadMsgIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMsgIds);
        }
      }
    }
  };

  // Почати новий чат або відкрити існуючий
  const openChat = async (sellerId: string, productId: string, productData?: any) => {
    const userId = getUserId();
    if (!userId) {
      toast.add({ title: t('chat.errors.error'), description: t('chat.errors.notLoggedIn'), color: 'error' });
      return;
    }

    if (productData && (productData.listing_state === 'sold' || productData.listing_state === 'deactivated' || productData.listing_state === 'deleted')) {
      toast.add({ 
        title: t('chat.errors.unavailableTitle'), 
        description: t('chat.errors.listingUnavailable'), 
        color: 'warning' 
      });
      return;
    }

    let existingChat = activeChats.value.find(
      (c) => c.product_id === productId && 
             (c.buyer_id === userId || c.seller_id === userId)
    );

    if (!existingChat) {
      const { data: dbChat } = await supabase
        .from('chats')
        .select('*, product:listings(*)')
        .eq('product_id', productId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .maybeSingle();
        
      if (dbChat) {
        existingChat = dbChat as any;
        if (!activeChats.value.find(c => c.id === existingChat!.id)) {
          activeChats.value.unshift(existingChat as any);
        }
      }
    }

    if (existingChat) {
      currentChat.value = existingChat;
      await Promise.all([
        fetchMessages(currentChat.value.id),
        fetchProfile(existingChat.buyer_id),
        fetchProfile(existingChat.seller_id)
      ]);
    } else {
      currentChat.value = {
        id: 'temp-' + Date.now(),
        buyer_id: userId,
        seller_id: sellerId,
        product_id: productId,
        product: productData,
        is_temp: true
      } as any;
      currentMessages.value = [];
      await fetchProfile(sellerId);
    }

    isSlideoverOpen.value = true;
  };

  // Відправити повідомлення
  const sendMessage = async (content: string) => {
    const userId = getUserId();
    const trimmedContent = content.trim();
    if (!userId || !currentChat.value || !trimmedContent) return;

    if (trimmedContent.startsWith('[SYSTEM_STATUS]:')) {
      toast.add({ title: t('chat.errors.error'), description: 'Ви не можете відправляти системні команди вручну.', color: 'error' });
      return;
    }

    let chatId = currentChat.value.id;

    if (chatId.startsWith('temp-')) {
      const { data: newDbChat, error: chatError } = (await supabase
        .from('chats')
        .insert({
          buyer_id: currentChat.value.buyer_id,
          seller_id: currentChat.value.seller_id,
          product_id: currentChat.value.product_id,
        })
        .select('*, product:listings(*)')
        .single()) as any;

      if (chatError || !newDbChat) {
        toast.add({ title: t('chat.errors.error'), description: t('chat.errors.createFailed'), color: 'error' });
        return;
      }
      
      chatId = newDbChat.id;
      currentChat.value = newDbChat as any;
      activeChats.value.unshift(newDbChat as any);
    }

    const { data: insertedMsg, error } = (await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        content: content.trim(),
        is_read: false
      })
      .select()
      .single()) as any;

    if (error) {
      toast.add({ title: t('chat.errors.sendFailed'), description: error.message, color: 'error' });
    } else {
      if (insertedMsg && currentChat.value && currentChat.value.id === chatId) {
        if (!currentMessages.value.find(m => m.id === insertedMsg.id)) {
          currentMessages.value.push(insertedMsg as any);
        }
      }
      
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
        
      const chatIdx = activeChats.value.findIndex(c => c.id === chatId);
      if (chatIdx !== -1) {
        const chat = activeChats.value[chatIdx];
        if (chat) {
          chat.updated_at = new Date().toISOString();
          activeChats.value.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          activeChats.value = [...activeChats.value];
        }
      }
    }
  };

  // Підписка на нові повідомлення
  const subscribeToMessages = () => {
    const userId = getUserId();
    if (!userId || messageSubscription) return;

    const uniqueChannelName = `messages-${Math.random().toString(36).substring(7)}`;

    messageSubscription = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          if (newMsg.content.startsWith('[SYSTEM_STATUS]:')) {
            const status = newMsg.content.replace('[SYSTEM_STATUS]:', '');
            activeChats.value.forEach(c => {
              if (c.id === newMsg.chat_id && c.product) {
                if (c.product.listing_state !== status) {
                  c.product.listing_state = status as any;
                  activeChats.value = [...activeChats.value];
                }
              }
            });
            if (currentChat.value && currentChat.value.id === newMsg.chat_id && currentChat.value.product) {
              currentChat.value.product.listing_state = status as any;
            }
          }
          
          // Оновлюємо дату останнього повідомлення в списку чатів та сортуємо
          const chatIdx = activeChats.value.findIndex(c => c.id === newMsg.chat_id);
          if (chatIdx !== -1) {
            const chatToUpdate = activeChats.value[chatIdx];
            if (chatToUpdate) {
              chatToUpdate.updated_at = newMsg.created_at || new Date().toISOString();
            }
            activeChats.value.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            activeChats.value = [...activeChats.value];
          }

          // Якщо це повідомлення для поточного відкритого чату
          if (currentChat.value && newMsg.chat_id === currentChat.value.id && isSlideoverOpen.value) {
            if (!currentMessages.value.find(m => m.id === newMsg.id)) {
              currentMessages.value.push(newMsg);
            }
            
            // Якщо повідомлення від іншого користувача, миттєво відмічаємо прочитаним
            if (newMsg.sender_id !== userId) {
              supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then();
            }
          } else {
            // Якщо ми не в цьому чаті
            let chatForMsg = activeChats.value.find(c => c.id === newMsg.chat_id);
            
            if (!chatForMsg) {
              const { data: newChat } = await supabase
                .from('chats')
                .select('*, product:listings(*)')
                .eq('id', newMsg.chat_id)
                .maybeSingle();
                
              if (newChat) {
                chatForMsg = newChat as any;
                activeChats.value.unshift(chatForMsg as any);
              }
            }

            if (chatForMsg && newMsg.sender_id !== userId) {
              if (!newMsg.content.startsWith('[SYSTEM_STATUS]:')) {
                unreadCounts.value[newMsg.chat_id] = (unreadCounts.value[newMsg.chat_id] || 0) + 1;
                toast.add({ 
                  title: 'Нове повідомлення', 
                  description: newMsg.content,
                  color: 'primary' 
                });
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Якщо повідомлення від іншого користувача і воно тепер прочитане (прочитали на іншому пристрої/вкладці)
          if (newMsg.sender_id !== userId && newMsg.is_read) {
            // Зменшуємо лічильник непрочитаних
            const currentCount = unreadCounts.value[newMsg.chat_id];
            if (currentCount && currentCount > 0) {
              unreadCounts.value[newMsg.chat_id] = currentCount - 1;
            }
            
            // Оновлюємо статус у відкритому чаті
            if (currentChat.value && currentChat.value.id === newMsg.chat_id) {
              const msgInChat = currentMessages.value.find(m => m.id === newMsg.id);
              if (msgInChat) {
                msgInChat.is_read = true;
              }
            }
          }
        }
      )
      .subscribe();
  };

  // Дедуплікація запитів, щоб кілька компонентів не робили однакові запити одночасно
  const fetchChatsDeduplicated = async () => {
    const userId = getUserId();
    // Якщо для цього юзера ми вже завантажили чати (або в процесі) – більше не завантажуємо,
    // оскільки у нас працюють ріал-тайм вебсокети (subscribeToMessages), які і так оновлюють дані!
    if (!userId || userId === lastFetchedUserId) return;

    if (fetchChatsPromise) return fetchChatsPromise;
    
    lastFetchedUserId = userId;
    fetchChatsPromise = fetchChats().finally(() => {
      fetchChatsPromise = null;
    });
    return fetchChatsPromise;
  };

  // Завжди перевіряємо при монтуванні (щоб оновлення сторінки працювало)
  onMounted(() => {
    if (user.value) {
      fetchChatsDeduplicated();
      subscribeToMessages();
    }
  });

  // Відслідковуємо подію логіну/розлогіну безпосередньо через Supabase клієнт,
  // що працює 100% надійно незалежно від того, які компоненти зараз на екрані.
  if (import.meta.client && !isAuthListenerRegistered) {
    isAuthListenerRegistered = true;
    
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Даємо системі трохи часу, щоб токен зберігся в локальний стейт
        setTimeout(() => {
          fetchChatsDeduplicated();
          subscribeToMessages();
        }, 300);
      } else if (event === 'SIGNED_OUT') {
        lastFetchedUserId = null;
        activeChats.value = [];
        currentChat.value = null;
        currentMessages.value = [];
        unreadCounts.value = {};
        
        if (messageSubscription) {
          supabase.removeChannel(messageSubscription);
          messageSubscription = null;
        }
      }
    });
  }

  // Закриваємо чат при зміні маршруту (щоб повідомлення не читалися у фоні)
  watch(() => route.path, () => {
    isSlideoverOpen.value = false;
    currentChat.value = null;
  });

  return {
    activeChats,
    currentChat,
    currentMessages,
    isSlideoverOpen,
    unreadCount,
    unreadCounts,
    chatUserProfiles: profilesCache,
    isLoadingChats,
    fetchChats,
    fetchMessages,
    openChat,
    sendMessage
  };
};

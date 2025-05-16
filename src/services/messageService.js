import { supabase } from '../config/supabaseClient';

export const messageService = {
  // Get conversation between two users
  async getConversation(userId1, userId2) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`(sender_id.eq.${userId1},receiver_id.eq.${userId1}),and(sender_id.eq.${userId2},receiver_id.eq.${userId2})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Send a message
  async sendMessage(senderId, receiverId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark messages as read
  async markAsRead(senderId, receiverId) {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data;
  },

  // Get unread messages count
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count;
  },

  // Get user's conversations
  async getUserConversations(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation
    const conversations = data.reduce((acc, message) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === userId ? message.receiver : message.sender;

      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        };
      }

      if (message.receiver_id === userId && !message.is_read) {
        acc[otherUserId].unreadCount++;
      }

      return acc;
    }, {});

    return Object.values(conversations);
  },

  // Delete conversation
  async deleteConversation(userId1, userId2) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`(sender_id.eq.${userId1},receiver_id.eq.${userId1}),and(sender_id.eq.${userId2},receiver_id.eq.${userId2})`);

    if (error) throw error;
  },

  // Subscribe to new messages
  subscribeToMessages(userId, callback) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  // Unsubscribe from messages
  unsubscribeFromMessages(subscription) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }
}; 
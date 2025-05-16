import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFriendRequests();
  }, [user]);

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:profiles!friend_requests_sender_id_fkey(*),
          receiver:profiles!friend_requests_receiver_id_fkey(*)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      
      // Remove the request from the list
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  if (loading) {
    return <div className="loading">Loading friend requests...</div>;
  }

  return (
    <div className="friend-requests">
      <h2>Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="no-requests">No pending friend requests</p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-user">
                <img 
                  src={request.sender.avatar_url || '/default-avatar.png'} 
                  alt={request.sender.username}
                  className="request-avatar"
                />
                <div className="request-info">
                  <h3>{request.sender.username}</h3>
                  <p>{request.sender.full_name}</p>
                </div>
              </div>
              <div className="request-actions">
                <button 
                  className="btn-accept"
                  onClick={() => handleRequest(request.id, 'accepted')}
                >
                  Accept
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => handleRequest(request.id, 'rejected')}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests; 
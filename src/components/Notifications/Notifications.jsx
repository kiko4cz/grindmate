import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaHeart, FaCrown, FaTrophy, FaUserPlus } from 'react-icons/fa';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulované notifikace - v reálné aplikaci by se načítaly z API
    const mockNotifications = [
      {
        id: 1,
        type: 'match',
        message: 'Máte nový match s Janou!',
        time: '5 minut',
        read: false,
        icon: <FaHeart className="text-red-500" />
      },
      {
        id: 2,
        type: 'subscription',
        message: 'Váš Premium předplatný plán byl aktivován',
        time: '1 hodina',
        read: false,
        icon: <FaCrown className="text-yellow-500" />
      },
      {
        id: 3,
        type: 'achievement',
        message: 'Gratulujeme! Dosáhl jste nového úspěchu: "10 tréninků v řadě"',
        time: '2 hodiny',
        read: true,
        icon: <FaTrophy className="text-blue-500" />
      },
      {
        id: 4,
        type: 'connection',
        message: 'Petr se připojil k vašemu tréninkovému plánu',
        time: '1 den',
        read: true,
        icon: <FaUserPlus className="text-green-500" />
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <div className="notifications-container">
      <button 
        className="notifications-button"
        onClick={toggleNotifications}
        aria-label="Notifikace"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-modal">
          <div className="notifications-header">
            <h3>Notifikace</h3>
            <div className="notifications-actions">
              <button 
                onClick={markAllAsRead}
                className="mark-all-read"
                disabled={unreadCount === 0}
              >
                Označit vše jako přečtené
              </button>
              <button 
                onClick={toggleNotifications}
                className="close-notifications"
                aria-label="Zavřít"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.icon}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>Žádné nové notifikace</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 
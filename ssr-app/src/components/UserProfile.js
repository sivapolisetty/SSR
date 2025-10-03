import React from 'react';

const UserProfile = ({ userId = 1 }) => {
  // Static server-side rendered data
  const user = {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    avatar: `https://picsum.photos/100/100?random=${userId + 100}`,
    bio: 'This is a server-side rendered user profile component',
    joinDate: '2024-01-15'
  };

  return (
    <div className="user-profile" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      display: 'flex',
      gap: '15px'
    }}>
      <img 
        src={user.avatar} 
        alt={`${user.name}'s avatar`}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{user.name}</h3>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
          {user.email}
        </p>
        <p style={{ color: '#888', fontSize: '13px', margin: '0 0 10px 0' }}>
          {user.bio}
        </p>
        <div style={{ fontSize: '12px', color: '#999' }}>
          <span>Joined: {user.joinDate}</span>
        </div>
        <small style={{ color: '#888', fontSize: '12px', marginTop: '10px', display: 'block' }}>
          🟢 SSR Component
        </small>
      </div>
    </div>
  );
};

export default UserProfile;
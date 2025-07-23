import React, { useState } from 'react';
import apiService from '../services/apiService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateUser = async (userData) => {
    try {
      const response = await apiService.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      });
      
      if (response.success) {
        setUsers([...users, response.user]);
        setShowCreateUserModal(false);
      }
    } catch (error) {
      setError(error.message || 'Failed to create user');
    }
  };

  return (
    <div>
      <h1>Users</h1>
      {error && <p className="error">{error}</p>}
      <button onClick={() => setShowCreateUserModal(true)}>Create User</button>
      {showCreateUserModal && (
        <CreateUserModal 
          onClose={() => setShowCreateUserModal(false)} 
          onCreateUser={handleCreateUser} 
        />
      )}
      <UserList users={users} />
    </div>
  );
};

export default UsersPage;
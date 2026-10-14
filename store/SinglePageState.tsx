import React, { useState } from 'react';
import { create } from 'zustand';

// 1. Types define karein
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  users: User[];
  addUser: (name: string, email: string) => void;
  updateUser: (id: number, name: string, email: string) => void;
  deleteUser: (id: number) => void;
}

// 2. Zustand Store create karein (Ek hi component file ke andar)
const useUserStore = create<UserState>((set) => ({
  users: [],
  
  // Create
  addUser: (name, email) => set((state) => ({
    users: [...state.users, { id: Date.now(), name, email }]
  })),
  
  // Update
  updateUser: (id, name, email) => set((state) => ({
    users: state.users.map((user) => 
      user.id === id ? { ...user, name, email } : user
    )
  })),
  
  // Delete
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((user) => user.id !== id)
  })),
}));

// 3. Main Single Component
export default function CrudComponent() {
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  // Form Submit Handler (Create ya Update ke liye)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editId !== null) {
      // Update action
      updateUser(editId, name, email);
      setEditId(null);
    } else {
      // Create action
      addUser(name, email);
    }

    // Form reset karein
    setName('');
    setEmail('');
  };

  // Edit button click karne par data form mein load karna
  const handleEdit = (user: User) => {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Zustand CRUD (Name & Email)</h2>

      {/* Form for Create/Update */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '8px' }}
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px', background: 'blue', color: 'white', border: 'none' }}>
          {editId !== null ? 'Update User' : 'Add User'}
        </button>
      </form>

      {/* Read (List of Users) */}
      <h3>User List</h3>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((user) => (
            <li key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '8px', border: '1px solid #ddd' }}>
              <div>
                <strong>{user.name}</strong> <br />
                <small>{user.email}</small>
              </div>
              <div>
                <button onClick={() => handleEdit(user)} style={{ marginRight: '5px' }}>Edit</button>
                <button onClick={() => deleteUser(user.id)} style={{ background: 'red', color: 'white', border: 'none' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
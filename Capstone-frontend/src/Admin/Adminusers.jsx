import React, { useState } from 'react';
import {
  EnvelopeIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Customer',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-08-15 14:30',
      orders: 12,
      totalSpent: '$1,234.56',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Customer',
      status: 'active',
      joinDate: '2024-02-20',
      lastLogin: '2024-08-16 09:15',
      orders: 8,
      totalSpent: '$876.43',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Vendor',
      status: 'suspended',
      joinDate: '2024-03-10',
      lastLogin: '2024-08-10 11:20',
      orders: 45,
      totalSpent: '$5,678.90',
    },
    {
      id: 4,
      name: 'Alice Williams',
      email: 'alice.w@example.com',
      role: 'Customer',
      status: 'inactive',
      joinDate: '2024-04-05',
      lastLogin: '2024-07-28 16:45',
      orders: 3,
      totalSpent: '$234.12',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      email: 'charlie.b@example.com',
      role: 'Customer',
      status: 'active',
      joinDate: '2024-05-12',
      lastLogin: '2024-08-16 10:05',
      orders: 6,
      totalSpent: '$567.89',
    },
    {
      id: 6,
      name: 'Diana Prince',
      email: 'diana.p@example.com',
      role: 'Vendor',
      status: 'active',
      joinDate: '2024-06-18',
      lastLogin: '2024-08-15 22:10',
      orders: 23,
      totalSpent: '$3,456.78',
    },
    {
      id: 7,
      name: 'Edward Nygma',
      email: 'e.nygma@example.com',
      role: 'Customer',
      status: 'suspended',
      joinDate: '2024-07-22',
      lastLogin: '2024-08-14 13:25',
      orders: 2,
      totalSpent: '$189.45',
    },
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAction = (action, user) => {
    setSelectedAction(action);
    setSelectedUser(user);
    setShowActionModal(true);
  };

  const executeAction = () => {
    // Update user status based on action
    if (selectedAction === 'deactivate') {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: 'inactive' }
          : user
      ));
    } else if (selectedAction === 'activate') {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: 'active' }
          : user
      ));
    } else if (selectedAction === 'suspend') {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, status: 'suspended' }
          : user
      ));
    }
    
    // Here you would also handle:
    // - Password reset emails
    // - Custom emails to users
    // - API calls to backend
    
    console.log(`Executed ${selectedAction} for user:`, selectedUser);
    setShowActionModal(false);
    setSelectedAction(null);
    setSelectedUser(null);
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for users:`, selectedUsers);
    // Implement bulk actions here
    alert(`${action} action will be applied to ${selectedUsers.length} users`);
    setSelectedUsers([]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Active
        </span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Inactive
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <NoSymbolIcon className="h-3 w-3 mr-1" />
          Suspended
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-500 mt-1">Manage and support your users</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedUsers.length} selected</span>
              <button
                onClick={() => handleBulkAction('email')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <EnvelopeIcon className="h-4 w-4" />
                Send Email
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <NoSymbolIcon className="h-4 w-4" />
                Deactivate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Join Date</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Last Login</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Orders</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Total Spent</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.role}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4 text-gray-600">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-gray-600">{user.orders}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{user.totalSpent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction('reset-password', user)}
                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction('send-email', user)}
                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleAction('deactivate', user)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate Account"
                        >
                          <NoSymbolIcon className="h-4 w-4" />
                        </button>
                      ) : user.status === 'inactive' ? (
                        <button
                          onClick={() => handleAction('activate', user)}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate Account"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction('activate', user)}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Reactivate Account"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedAction === 'reset-password' && 'Reset Password'}
              {selectedAction === 'send-email' && 'Send Email'}
              {selectedAction === 'deactivate' && 'Deactivate Account'}
              {selectedAction === 'activate' && 'Activate Account'}
              {selectedAction === 'suspend' && 'Suspend Account'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {selectedAction === 'reset-password' && `Are you sure you want to reset the password for ${selectedUser.name}? They will receive an email with instructions to set a new password.`}
              {selectedAction === 'send-email' && `Send an email to ${selectedUser.name} at ${selectedUser.email}?`}
              {selectedAction === 'deactivate' && `Are you sure you want to deactivate ${selectedUser.name}'s account? They will not be able to log in until the account is reactivated.`}
              {selectedAction === 'activate' && `Reactivate ${selectedUser.name}'s account? They will be able to log in again.`}
              {selectedAction === 'suspend' && `Suspend ${selectedUser.name}'s account? They will not be able to access the platform until the suspension is lifted.`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  selectedAction === 'deactivate' || selectedAction === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700' 
                    : selectedAction === 'activate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {selectedAction === 'reset-password' && 'Reset Password'}
                {selectedAction === 'send-email' && 'Send Email'}
                {selectedAction === 'deactivate' && 'Deactivate'}
                {selectedAction === 'activate' && 'Activate'}
                {selectedAction === 'suspend' && 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
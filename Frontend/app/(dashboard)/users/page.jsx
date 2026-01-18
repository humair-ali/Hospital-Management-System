'use client';
import { useState, useEffect } from 'react';
import { useUser, hasRole } from '@/context/UserContext';
import { getUsers, deleteUser } from '@/lib/api';
import { SPALink } from '@/components/SPALink';
import { toast } from 'react-toastify';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaUserMd, FaUserNurse, FaUserTie, FaUserShield, FaChevronRight } from 'react-icons/fa';
export default function UsersPage() {
  const { user, loading: authLoading } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (user && hasRole(user.role, ['admin'])) {
      fetchUsers();
    }
  }, [user, search]);
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getUsers({ search });
      const filteredUsers = (res.data || []).filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }
  async function handleDeleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  }
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield className="opacity-70" />;
      case 'doctor': return <FaUserMd className="opacity-70" />;
      case 'nurse': return <FaUserNurse className="opacity-70" />;
      case 'accountant': return <FaUserTie className="opacity-70" />;
      default: return null;
    }
  };
  if (authLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 animate-pulse">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Verifying Access Vector...</p>
      </div>
    );
  }

  if (!user || !hasRole(user.role, ['admin'])) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 card border-red-100 bg-red-50/30 animate-in fade-in duration-300">
        <h2 className="text-red-700 mb-2">Access Restricted</h2>
        <p className="text-red-600/80 mb-6 font-medium">You do not have the necessary permissions to view this administrative page.</p>
        <SPALink href="dashboard/admin" className="btn-primary">Return to Dashboard</SPALink>
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-200/60 transition-all">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Users</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage hospital staff roles, permissions and system access</p>
        </div>
        <SPALink href="users/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 px-6">
          <FaUserPlus size={16} /> Add New User
        </SPALink>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elevated p-6 bg-white border border-gray-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Doctors</p>
          <p className="text-3xl font-black text-gray-900">{users.filter(u => u.role === 'doctor').length}</p>
        </div>
        <div className="card-elevated p-6 bg-white border border-gray-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Nurses</p>
          <p className="text-3xl font-black text-gray-900">{users.filter(u => u.role === 'nurse').length}</p>
        </div>
        <div className="card-elevated p-6 bg-white border border-gray-100">
          <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Other Staff</p>
          <p className="text-3xl font-black text-gray-900">{users.filter(u => !['doctor', 'nurse'].includes(u.role)).length}</p>
        </div>
      </div>
      <div className="card-elevated p-5 bg-white border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="input-with-icon-wrapper flex-2 group">
          <div className="input-icon-container">
            <FaSearch className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email..."
            className="input-field input-field-with-icon h-12 bg-gray-50/50 focus:bg-white border-transparent focus:border-primary-500 text-base w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <select
            className="input-field h-12 bg-gray-50/50 focus:bg-white border-transparent focus:border-primary-500 text-sm font-bold w-full"
            onChange={(e) => setSearch(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="nurse">Nurses</option>
            <option value="accountant">Accountants</option>
            <option value="receptionist">Receptionists</option>
          </select>
        </div>
      </div>
      <div className="card-elevated overflow-hidden border ring-1 ring-gray-950/5">
        <div className="table-container border-none rounded-none overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80">
                <th className="py-5 pl-8 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="py-5 text-center text-xs font-extrabold text-gray-400 uppercase tracking-widest">System Role</th>
                <th className="py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="py-5 pr-8 text-right text-xs font-extrabold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="space-y-0.5">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-20 bg-gray-50/30 animate-pulse border-b border-gray-100/50"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                        <FaSearch size={32} />
                      </div>
                      <span className="text-lg font-bold text-gray-900">No Users Found</span>
                      <span className="text-sm">Try adjusting your search criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-all group cursor-default border-t border-gray-50">
                    <td className="table-cell py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center font-bold text-base shadow-md shadow-primary-500/20 ring-2 ring-white group-hover:scale-105 transition-transform">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors block text-base">{u.name}</span>
                          <span className="text-xs text-gray-400 font-medium">ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-700">{u.email}</span>
                        <span className="text-xs text-gray-400 font-medium">{u.phone || 'No phone recorded'}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        u.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          u.role === 'nurse' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm font-medium text-gray-500">
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="table-cell pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <SPALink href={`users/${u.id}/edit`} className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 w-fit">
                          <FaEdit size={12} /> Edit
                        </SPALink>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete User"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
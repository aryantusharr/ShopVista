import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/shopContext';
import AddressForm from '../components/AddressForm';

export default function Profile() {
  const { user, addresses, updateProfile, deleteAddress, logout } = useShop();
  const navigate = useNavigate();

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    newPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Address editing states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  function handleProfileChange(e) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdating(true);

    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        password: profileForm.password || undefined,
        newPassword: profileForm.newPassword || undefined,
      });
      setProfileSuccess('Profile updated successfully!');
      setProfileForm((prev) => ({ ...prev, password: '', newPassword: '' }));
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteAddress(id) {
    if (window.confirm('Delete this address?')) {
      await deleteAddress(id);
    }
  }

  function handleEditAddress(addr) {
    setEditingAddress(addr);
    setShowAddressForm(true);
  }

  function handleAddNewAddress() {
    setEditingAddress(null);
    setShowAddressForm(true);
  }

  if (!user) return null;

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>
          My Profile
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Profile settings */}
          <div>
            <div className="profile-card">
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Personal Info</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="label">Full Name</label>
                  <input
                    className="input"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Email Address</label>
                  <input
                    className="input"
                    value={user.email}
                    disabled
                    style={{ background: '#eee', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Phone Number</label>
                  <input
                    className="input"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Change Password</h3>
                  <div className="form-group">
                    <label className="label">Current Password</label>
                    <input
                      className="input"
                      type="password"
                      name="password"
                      value={profileForm.password}
                      onChange={handleProfileChange}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">New Password</label>
                    <input
                      className="input"
                      type="password"
                      name="newPassword"
                      value={profileForm.newPassword}
                      onChange={handleProfileChange}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                {profileError && <p className="error-msg">{profileError}</p>}
                {profileSuccess && <p className="success-msg">{profileSuccess}</p>}

                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '16px' }} disabled={updating}>
                  {updating ? 'Saving...' : 'Update Details'}
                </button>
              </form>

              <button
                className="btn btn-danger btn-full btn-outline"
                style={{ marginTop: '16px' }}
                onClick={() => { logout(); navigate('/login'); }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <div className="profile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: 0 }}>Saved Addresses</h2>
                {!showAddressForm && (
                  <button className="btn btn-primary btn-sm" onClick={handleAddNewAddress}>
                    + Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                    {editingAddress ? 'Edit Address' : 'New Address'}
                  </h3>
                  <AddressForm
                    existingAddress={editingAddress}
                    onSaved={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                  />
                </div>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', border: '1.5px dashed #ccc', borderRadius: '10px' }}>
                  <p style={{ color: '#888' }}>No saved addresses.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`address-card ${addr.isDefault ? 'default' : ''}`}
                    >
                      {addr.isDefault && <span className="address-default-tag">Default</span>}
                      <p style={{ fontWeight: '600' }}>{addr.street}</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p style={{ fontSize: '13px', color: '#666' }}>📞 {addr.phone}</p>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleEditAddress(addr)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDeleteAddress(addr._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

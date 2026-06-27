import { useEffect, useState } from 'react';

export default function Navbar() {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('shopvista_admin_user');
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <nav className="admin-navbar">
      <div className="admin-user">
        👤 {adminUser ? adminUser.name : 'Administrator'}
      </div>
    </nav>
  );
}

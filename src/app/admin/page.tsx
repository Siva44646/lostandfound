"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Package, Search, BarChart3, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Assuming any authenticated user can view for prototype demo purposes
      fetch("/api/admin/stats")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setIsLoading(false);
        })
        .catch(console.error);
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Admin Dashboard...</div>;
  }

  const { stats, recentItems } = data;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Platform Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor network activity and platform health.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Registered Users</div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger-100)', color: 'var(--danger-700)', borderRadius: 'var(--radius-md)' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.lostItems}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Lost Items</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--warning-100)', color: 'var(--warning-700)', borderRadius: 'var(--radius-md)' }}>
            <Search size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.foundItems}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Found Items</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--success-100)', color: 'var(--success-700)', borderRadius: 'var(--radius-md)' }}>
            <Package size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.recoveredItems}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Items Recovered</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            <Link href="/admin/claims" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-500)', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
              Manage Claims
            </Link>
            <Link href="/admin/items" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-500)', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
              Manage Items
            </Link>
            <Link href="/admin/locations" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-500)', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
              Campus Locations
            </Link>
            <Link href="/admin/users" style={{ padding: '0.5rem', backgroundColor: 'var(--primary-500)', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
              User Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={24} /> Recent Activity
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0' }}>Type</th>
                <th style={{ padding: '1rem 0' }}>Item</th>
                <th style={{ padding: '1rem 0' }}>Category</th>
                <th style={{ padding: '1rem 0' }}>Reported By</th>
                <th style={{ padding: '1rem 0' }}>Date</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: item.type === 'LOST' ? 'var(--danger-500)' : 'var(--success-500)', color: 'white' }}>
                      {item.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{item.title}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{item.category}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{item.user.name}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 0' }}>{item.status}</td>
                </tr>
              ))}
              {recentItems.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No items reported yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

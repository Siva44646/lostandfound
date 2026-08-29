"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export default function AdminClaims() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Allow access for prototype, usually check role === 'ADMIN'
      fetchClaims();
    }
  }, [status, router]);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (claimId: string, action: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchClaims();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Admin Claims...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Manage Claims</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review ownership proof for found items.</p>
        </div>
        <Link href="/admin" className="btn-secondary">Back to Admin</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {claims.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
            No claims to review.
          </div>
        ) : (
          claims.map(claim => (
            <div key={claim.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{claim.item.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Item ID: {claim.item.id}</div>
                </div>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, 
                  backgroundColor: claim.status === 'APPROVED' ? 'var(--success-100)' : claim.status === 'REJECTED' ? 'var(--danger-100)' : 'var(--warning-100)',
                  color: claim.status === 'APPROVED' ? 'var(--success-700)' : claim.status === 'REJECTED' ? 'var(--danger-700)' : 'var(--warning-700)' }}>
                  {claim.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>CLAIMANT</div>
                  <div>{claim.claimant.name} ({claim.claimant.email})</div>
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>PROOF PROVIDED</div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                    "{claim.proofText}"
                  </div>
                </div>
              </div>

              {claim.status === "PENDING" && (
                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button onClick={() => handleAction(claim.id, 'APPROVE')} className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success-500)' }}>
                    <CheckCircle size={18} /> Approve & Mark Recovered
                  </button>
                  <button onClick={() => handleAction(claim.id, 'REJECT')} className="btn-secondary" style={{ flex: 1, color: 'var(--danger-500)', borderColor: 'var(--danger-500)' }}>
                    <XCircle size={18} /> Reject Claim
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

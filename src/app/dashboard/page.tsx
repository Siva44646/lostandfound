"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, CheckCircle } from "lucide-react";
import styles from "./dashboard.module.css";

type Item = {
  id: string;
  type: string;
  title: string;
  status: string;
  locationName: string;
  date: string;
  college?: { name: string };
  campus?: { name: string };
  building?: { name: string };
  floor?: { name: string };
  area?: { name: string };
};

type Match = {
  id: string;
  score: number;
  reasons: string;
  status: string;
  lostItem: Item & { images: {url: string}[] };
  foundItem: Item & { images: {url: string}[] };
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"lost" | "found" | "matches" | "claims" | "recovered">("lost");
  
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, matchesRes, claimsRes] = await Promise.all([
        fetch("/api/items/me"),
        fetch("/api/matches"),
        fetch("/api/claims")
      ]);

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.items);
      }
      
      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data.matches);
      }

      if (claimsRes.ok) {
        const data = await claimsRes.json();
        setMyClaims(data.myClaims);
        setReceivedClaims(data.receivedClaims);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const lostItems = items.filter(i => i.type === "LOST" && i.status !== "RECOVERED");
  const foundItems = items.filter(i => i.type === "FOUND" && i.status !== "RECOVERED");
  const recoveredItems = items.filter(i => i.status === "RECOVERED");

  const getLocationString = (item: Item) => {
    return item.area?.name && item.building?.name 
      ? `${item.area.name}, ${item.building.name}`
      : item.locationName || "Unknown Location";
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage your reported items and claims.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/report/lost" className="btn-secondary">Report Lost</Link>
          <Link href="/report/found" className="btn-primary">Report Found</Link>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'lost' ? styles.active : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          My Lost Items ({lostItems.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'found' ? styles.active : ''}`}
          onClick={() => setActiveTab('found')}
        >
          My Found Items ({foundItems.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'matches' ? styles.active : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Possible Matches ({matches.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'claims' ? styles.active : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Claims ({myClaims.length + receivedClaims.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'recovered' ? styles.active : ''}`}
          onClick={() => setActiveTab('recovered')}
        >
          Recovered ({recoveredItems.length})
        </button>
      </div>

      <div className={styles.grid}>
        {activeTab === 'lost' && (
          lostItems.length === 0 ? (
            <div className={styles.emptyState}>You haven&apos;t reported any lost items.</div>
          ) : (
            lostItems.map(item => (
              <div key={item.id} className={`card ${styles.itemCard}`}>
                <div className={styles.cardHeader}>
                   <h3 className={styles.itemTitle}>{item.title}</h3>
                   <span className={`${styles.statusBadge} ${item.status === 'ACTIVE' ? styles.statusActive : styles.statusRecovered}`}>
                     {item.status}
                   </span>
                </div>
                <div className={styles.meta}><MapPin size={16} /> {getLocationString(item)}</div>
                <div className={styles.meta}><Calendar size={16} /> {new Date(item.date).toLocaleDateString()}</div>
                <Link href={`/items/${item.id}`} className="btn-secondary" style={{ marginTop: 'auto' }}>View Details</Link>
              </div>
            ))
          )
        )}

        {activeTab === 'found' && (
          foundItems.length === 0 ? (
            <div className={styles.emptyState}>You haven&apos;t reported any found items.</div>
          ) : (
            foundItems.map(item => (
              <div key={item.id} className={`card ${styles.itemCard}`}>
                <div className={styles.cardHeader}>
                   <h3 className={styles.itemTitle}>{item.title}</h3>
                   <span className={`${styles.statusBadge} ${item.status === 'ACTIVE' ? styles.statusActive : styles.statusRecovered}`}>
                     {item.status}
                   </span>
                </div>
                <div className={styles.meta}><MapPin size={16} /> {getLocationString(item)}</div>
                <div className={styles.meta}><Calendar size={16} /> {new Date(item.date).toLocaleDateString()}</div>
                <Link href={`/items/${item.id}`} className="btn-secondary" style={{ marginTop: 'auto' }}>View Details</Link>
              </div>
            ))
          )
        )}

        {activeTab === 'matches' && (
          matches.length === 0 ? (
            <div className={styles.emptyState}>No matches found yet. We will notify you when we find a possible match!</div>
          ) : (
            matches.map(match => (
              <div key={match.id} className={`card ${styles.itemCard} ${styles.matchCard}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.itemTitle}>Match: {match.score}%</h3>
                  <span className={`${styles.statusBadge} ${styles.statusMatch}`}>
                    {match.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>LOST ITEM</div>
                    <div style={{ fontWeight: 500 }}>{match.lostItem.title}</div>
                    <div className={styles.meta} style={{ marginTop: '0.25rem' }}><MapPin size={14}/> {getLocationString(match.lostItem)}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>FOUND ITEM</div>
                    <div style={{ fontWeight: 500 }}>{match.foundItem.title}</div>
                    <div className={styles.meta} style={{ marginTop: '0.25rem' }}><MapPin size={14}/> {getLocationString(match.foundItem)}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <strong>Reasons:</strong> {match.reasons}
                </div>
                <Link href={`/matches/${match.id}`} className="btn-primary" style={{ marginTop: 'auto' }}>
                  <CheckCircle size={18} /> Review Match
                </Link>
              </div>
            ))
          )
        )}

        {activeTab === 'claims' && (
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <div>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: 600 }}>Claims on My Found Items</h2>
              {receivedClaims.length === 0 ? (
                <div className={styles.emptyState}>No one has claimed items you found.</div>
              ) : (
                <div className={styles.grid}>
                  {receivedClaims.map(claim => (
                    <div key={claim.id} className={`card ${styles.itemCard}`}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.itemTitle}>{claim.item.title}</h3>
                        <span className={`${styles.statusBadge} ${claim.status === 'APPROVED' ? styles.statusRecovered : claim.status === 'REJECTED' ? styles.statusActive : ''}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                        <strong>Claimant:</strong> {claim.claimant.name}
                      </div>
                      <div style={{ padding: "0.75rem", backgroundColor: "var(--neutral-50)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", marginTop: "0.5rem", fontStyle: "italic" }}>
                        "{claim.proofText}"
                      </div>
                      {claim.status === "PENDING" && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                           <button onClick={async () => {
                             await fetch(`/api/claims/${claim.id}`, { method: 'PATCH', body: JSON.stringify({action: 'APPROVE'}) });
                             fetchData();
                           }} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}>Approve</button>
                           <button onClick={async () => {
                             await fetch(`/api/claims/${claim.id}`, { method: 'PATCH', body: JSON.stringify({action: 'REJECT'}) });
                             fetchData();
                           }} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: 600 }}>My Submitted Claims</h2>
              {myClaims.length === 0 ? (
                <div className={styles.emptyState}>You haven't submitted any claims.</div>
              ) : (
                <div className={styles.grid}>
                  {myClaims.map(claim => (
                    <div key={claim.id} className={`card ${styles.itemCard}`}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.itemTitle}>{claim.item.title}</h3>
                        <span className={`${styles.statusBadge} ${claim.status === 'APPROVED' ? styles.statusRecovered : claim.status === 'REJECTED' ? styles.statusActive : ''}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div style={{ padding: "0.75rem", backgroundColor: "var(--neutral-50)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem", marginTop: "0.5rem", fontStyle: "italic" }}>
                        Your Proof: "{claim.proofText}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'recovered' && (
          recoveredItems.length === 0 ? (
            <div className={styles.emptyState}>You have no recovered or resolved items.</div>
          ) : (
            recoveredItems.map(item => (
              <div key={item.id} className={`card ${styles.itemCard}`} style={{ opacity: 0.8 }}>
                <div className={styles.cardHeader}>
                   <h3 className={styles.itemTitle}>{item.title}</h3>
                   <span className={`${styles.statusBadge} ${styles.statusRecovered}`}>
                     {item.status}
                   </span>
                </div>
                <div className={styles.meta}><MapPin size={16} /> {getLocationString(item)}</div>
                <div className={styles.meta}><Calendar size={16} /> {new Date(item.date).toLocaleDateString()}</div>
                <Link href={`/items/${item.id}`} className="btn-secondary" style={{ marginTop: 'auto' }}>View Details</Link>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

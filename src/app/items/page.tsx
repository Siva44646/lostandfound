"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Map as MapIcon, List, Calendar, MapPin } from "lucide-react";
import styles from "./items.module.css";

const CATEGORIES = [
  "Electronics", "Wallets", "Documents", "Keys", "Bags", 
  "Jewelry", "Clothing", "Pets", "Vehicles", "Other"
];

type Item = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  locationName: string;
  date: string;
  images: { url: string }[];
  college?: { name: string };
  campus?: { name: string };
  building?: { name: string };
  floor?: { name: string };
  area?: { name: string };
};

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (typeFilter) params.append("type", typeFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const res = await fetch(`/api/items/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDesktop, setIsDesktop] = useState(true); // Default to true or false

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, typeFilter, categoryFilter]);

  // Handle window resize for SSR safety
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 900);
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <h1 className={styles.title}>Items</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary-700)', fontWeight: 500 }}>Not finding what you need?</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/report/lost" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Report Lost</Link>
              <Link href="/report/found" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Report Found</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search by keywords, location..." 
              className={`input-field ${styles.searchInput}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className={`input-field ${styles.filterSelect}`}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types (Lost & Found)</option>
            <option value="LOST">Lost Items</option>
            <option value="FOUND">Found Items</option>
          </select>

          <select 
            className={`input-field ${styles.filterSelect}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
            >
              <List size={18} /> List
            </button>
            <button 
              className={`${styles.toggleBtn} ${view === 'map' ? styles.active : ''}`}
              onClick={() => setView('map')}
            >
              <MapIcon size={18} /> Map
            </button>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        {view === 'list' || isDesktop ? (
          <div className={styles.listArea}>
            {isLoading ? (
              <div className={styles.emptyState}>Loading items...</div>
            ) : items.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No items found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className={`card ${styles.itemCard}`}>
                  <div 
                    className={styles.cardImage}
                    style={{ backgroundImage: item.images[0] ? `url(${item.images[0].url})` : 'none' }}
                  >
                    {!item.images[0] && (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        No Image
                      </div>
                    )}
                    <span className={`${styles.badge} ${item.type === 'LOST' ? styles.badgeLost : styles.badgeFound}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    
                    <div className={styles.itemMeta}>
                      <MapPin size={16} />
                      {item.area?.name && item.building?.name 
                        ? `${item.area.name}, ${item.building.name}`
                        : item.locationName || "Unknown Location"}
                    </div>
                    
                    <div className={styles.itemMeta}>
                      <Calendar size={16} />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    
                    <p className={styles.itemDesc}>{item.description}</p>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <Link href={`/items/${item.id}`} className={`btn-secondary ${styles.viewBtn}`}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {/* The map area is visible in map view OR when screen is wide enough (split view) */}
        {(view === 'map' || isDesktop) && (
          <div className={styles.mapArea}>
            {/* We will dynamically load the Leaflet map component here to avoid SSR issues */}
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-100)', color: 'var(--text-secondary)' }}>
              Map View (React-Leaflet Component Placeholder)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

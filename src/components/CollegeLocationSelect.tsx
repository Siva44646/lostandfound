"use client";

import { useState, useEffect } from "react";
import styles from "../app/report/report.module.css";

type Area = { id: string; name: string; type: string | null };
type Floor = { id: string; name: string; areas: Area[] };
type Building = { id: string; name: string; type: string | null; floors: Floor[] };
type Campus = { id: string; name: string; buildings: Building[] };

export default function CollegeLocationSelect() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setCampuses(data.campuses);
          if (data.campuses.length > 0) {
            setSelectedCampusId(data.campuses[0].id);
          }
        } else {
          setError("Failed to load college locations.");
        }
      } catch (e) {
        setError("Error loading locations.");
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  if (loading) return <div className={styles.formGroup}><label className={styles.label}>Loading campus locations...</label></div>;
  if (error) return <div className={styles.formGroup}><label className={styles.label} style={{color: 'red'}}>{error}</label></div>;
  if (campuses.length === 0) return <div className={styles.formGroup}><label className={styles.label}>No campus locations found for your college.</label></div>;

  const currentCampus = campuses.find(c => c.id === selectedCampusId);
  const buildings = currentCampus?.buildings || [];
  const currentBuilding = buildings.find(b => b.id === selectedBuildingId);
  const floors = currentBuilding?.floors || [];
  const currentFloor = floors.find(f => f.id === selectedFloorId);
  const areas = currentFloor?.areas || [];

  return (
    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Campus Location</h3>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="campusId" className={styles.label}>Campus</label>
          <select id="campusId" name="campusId" required className="input-field" value={selectedCampusId} onChange={e => {
            setSelectedCampusId(e.target.value);
            setSelectedBuildingId("");
            setSelectedFloorId("");
          }}>
            <option value="">Select Campus</option>
            {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="buildingId" className={styles.label}>Building / Block</label>
          <select id="buildingId" name="buildingId" required className="input-field" value={selectedBuildingId} onChange={e => {
            setSelectedBuildingId(e.target.value);
            setSelectedFloorId("");
          }}>
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name} {b.type ? `(${b.type})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="floorId" className={styles.label}>Floor</label>
          <select id="floorId" name="floorId" required className="input-field" value={selectedFloorId} onChange={e => setSelectedFloorId(e.target.value)}>
            <option value="">Select Floor</option>
            {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="areaId" className={styles.label}>Area / Room</label>
          <select id="areaId" name="areaId" required className="input-field">
            <option value="">Select Area</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name} {a.type ? `(${a.type})` : ''}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
        <label htmlFor="locationName" className={styles.label}>Additional Location Details (Optional)</label>
        <input id="locationName" name="locationName" type="text" className="input-field" placeholder="e.g., Near the entrance door, under the last bench" />
      </div>
    </div>
  );
}

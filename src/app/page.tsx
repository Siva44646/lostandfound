import Link from "next/link";
import { Search, ShieldCheck, MapPin } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Campus Lost & Found, <span className="text-gradient">Modernized.</span><br />
            </h1>
            <p className={styles.subtitle}>
              The centralized platform for colleges and universities to report, discover, and safely return lost items. Let&apos;s reunite students and faculty with their belongings.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/report/lost" className="btn-primary">
                Report a Lost Item
              </Link>
              <Link href="/report/found" className="btn-secondary">
                I Found an Item
              </Link>
            </div>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Search for keys, wallet, phone..." className="input-field" />
              <button className={`btn-primary ${styles.searchBtn}`}>
                <Search size={18} /> Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.grid}>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.iconWrapper}>
                <MapPin size={24} />
              </div>
              <h3>1. Report & Locate</h3>
              <p>Post the details of the item you lost or found. Add images and approximate locations to help the matching process.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.iconWrapper}>
                <Search size={24} />
              </div>
              <h3>2. Smart Matching</h3>
              <p>Our system compares lost and found reports to automatically suggest potential matches based on time, location, and description.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.iconWrapper}>
                <ShieldCheck size={24} />
              </div>
              <h3>3. Secure Claim</h3>
              <p>Communicate privately to verify ownership. Answer security questions to ensure the item is returned to its rightful owner.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={`glass-panel ${styles.trustPanel}`}>
            <div className={styles.trustContent}>
              <h2>Safe & Secure Returns</h2>
              <p>We prioritize your privacy and campus safety. Exact locations and personal information are kept hidden until a claim is verified by the campus community or security personnel.</p>
              <ul className={styles.trustList}>
                <li>Private messaging system for students</li>
                <li>Verification questions</li>
                <li>Campus-scoped item discovery</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

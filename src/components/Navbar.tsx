"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { List, PlusCircle, LogOut, User } from "lucide-react";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className="text-gradient">FoundIt</span>
        </Link>
        
        <nav className={styles.navLinks}>
          <Link href="/items" className={styles.link}>
            <List size={18} />
            <span>Items</span>
          </Link>
          <Link href="/report/lost" className={styles.link}>
            <PlusCircle size={18} />
            <span>Report Lost</span>
          </Link>
          <Link href="/report/found" className={styles.link}>
            <PlusCircle size={18} />
            <span>Report Found</span>
          </Link>
        </nav>

        <div className={styles.authSection}>
          {session ? (
            <div className={styles.userMenu}>
              <Link href="/dashboard" className={styles.link}>
                <User size={18} />
                <span>Dashboard</span>
              </Link>
              <button onClick={() => signOut()} className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className={styles.guestLinks}>
              <Link href="/login" className={styles.link}>Login</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

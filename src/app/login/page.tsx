"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import { LogIn } from "lucide-react";

import { useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  // Force redirect to dashboard regardless of where they came from
  const callbackUrl = "/dashboard";

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card glass-panel ${styles.authCard}`}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Log in to manage your items and claims</p>

        {error && <div className={styles.globalError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="input-field" 
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isLoading} className={`btn-primary ${styles.submitBtn}`}>
            <LogIn size={18} />
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account? 
          <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

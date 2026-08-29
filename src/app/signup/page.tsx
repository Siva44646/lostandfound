"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import styles from "../auth.module.css";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  // Force redirect to dashboard regardless of where they came from
  const callbackUrl = "/dashboard";

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  
  useEffect(() => {
    fetch("/api/colleges")
      .then(res => res.json())
      .then(data => {
        if (data.colleges) {
          setColleges(data.colleges);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!selectedCollege) {
      setError("Please select a college");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rollNumber = formData.get("rollNumber") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, collegeId: selectedCollege, rollNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to sign up");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but automatic login failed. Please try logging in.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card glass-panel ${styles.authCard}`}>
        <h1 className={styles.title}>Join the Community</h1>
        <p className={styles.subtitle}>Create an account to report and claim items</p>

        {error && <div className={styles.globalError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="college" className={styles.label}>Select Your College</label>
            <select 
              id="college" 
              className="input-field" 
              required
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="">-- Choose College --</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              required 
              className="input-field" 
              placeholder="John Doe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rollNumber" className={styles.label}>Roll No. / ID Card No.</label>
            <input 
              id="rollNumber" 
              name="rollNumber" 
              type="text" 
              required 
              className="input-field" 
              placeholder="e.g. 21B81A0512"
            />
          </div>

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
              minLength={6}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isLoading} className={`btn-primary ${styles.submitBtn}`}>
            <UserPlus size={18} />
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? 
          <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import styles from "../../report/report.module.css";

function ClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemId) {
      setError("No item specified");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const proofText = formData.get("proofText") as string;

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, proofText }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to submit claim");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={`card glass-panel ${styles.reportCard}`}>
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary-500)' }}>
            <ShieldCheck size={48} />
          </div>
          <h1 className={styles.title}>Claim This Item</h1>
          <p className={styles.subtitle}>
            Please provide specific details that only the true owner would know. The person who reported this item will review your claim.
          </p>
        </div>

        {error && (
          <div className="globalError" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="proofText" className={styles.label}>Verification Details</label>
            <textarea 
              id="proofText" 
              name="proofText" 
              required 
              className={`input-field ${styles.textarea}`} 
              placeholder="E.g., It has a small scratch on the bottom left corner. The wallpaper is a picture of a golden retriever..."
            ></textarea>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Do not include highly sensitive personal information like full SSN or credit card numbers.
            </p>
          </div>

          <button type="submit" disabled={isLoading} className={`btn-primary ${styles.submitBtn}`}>
            {isLoading ? "Submitting Claim..." : "Submit Claim for Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewClaim() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>}>
      <ClaimForm />
    </Suspense>
  );
}

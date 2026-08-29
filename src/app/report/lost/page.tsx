"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UploadCloud, AlertCircle } from "lucide-react";
import styles from "../report.module.css";
import CollegeLocationSelect from "@/components/CollegeLocationSelect";

const CATEGORIES = [
  "Electronics", "Wallets", "Documents", "Keys", "Bags", 
  "Jewelry", "Clothing", "Pets", "Vehicles", "Other"
];

export default function ReportLost() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/report/lost");
    }
  }, [status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("type", "LOST");

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        body: formData, // Sending as multipart/form-data
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to submit report");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard?status=reported");
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
          <h1 className={styles.title}>Report a <span className="text-gradient">Lost</span> Item</h1>
          <p className={styles.subtitle}>Provide as many details as possible to help the community find your item.</p>
        </div>

        {error && (
          <div className="globalError" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>Item Name (What is it?)</label>
              <input id="title" name="title" type="text" required className="input-field" placeholder="e.g., iPhone 13 Pro Max" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>Category</label>
              <select id="category" name="category" required className="input-field">
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Detailed Description</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              className={`input-field ${styles.textarea}`} 
              placeholder="Describe the item. What color is it? Are there any identifying marks or serial numbers? What was inside it?"
            ></textarea>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="idCardImage" className={styles.label}>College ID Card Photo (Required for Security)</label>
              <label className={styles.fileInputContainer}>
                <input id="idCardImage" name="idCardImage" type="file" accept="image/*" required className={styles.fileInput} />
                <div className={styles.uploadIcon}><UploadCloud size={32} /></div>
                <div>Upload your student/staff ID</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Kept secure and private.</div>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.label}>Photo of Lost Item (Optional)</label>
              <label className={styles.fileInputContainer}>
                <input id="image" name="image" type="file" accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
                <div className={styles.uploadIcon}><UploadCloud size={32} /></div>
                <div>{fileName ? <strong>{fileName}</strong> : "Click or drag to upload"}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>PNG, JPG up to 5MB</div>
              </label>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.label}>Date Lost</label>
              <input id="date" name="date" type="date" required className="input-field" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="time" className={styles.label}>Approximate Time (Optional)</label>
              <input id="time" name="time" type="time" className="input-field" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="locationName" className={styles.label}>Location Details</label>
            <input id="locationName" name="locationName" type="text" required className="input-field" placeholder="e.g., Near the entrance of Lab 204" />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="reward" className={styles.label}>Reward (Optional)</label>
              <input id="reward" name="reward" type="text" className="input-field" placeholder="e.g., $50" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contactPref" className={styles.label}>Contact Preference</label>
              <select id="contactPref" name="contactPref" className="input-field">
                <option value="in-app">In-app Messaging Only (Recommended)</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={`btn-primary ${styles.submitBtn}`}>
            {isLoading ? "Submitting Report..." : "Submit Lost Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

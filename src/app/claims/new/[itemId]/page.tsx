"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert, AlertCircle } from "lucide-react";

export default function NewClaim({ params }: { params: { itemId: string } }) {
  const router = useRouter();
  const { status } = useSession();
  const [item, setItem] = useState<any>(null);
  const [proofText, setProofText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/claims/new/${params.itemId}`);
    }
  }, [status, router, params.itemId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/items/${params.itemId}`)
        .then(res => res.json())
        .then(data => {
          if (data.item) {
            setItem(data.item);
          } else {
            setError("Item not found");
          }
        })
        .catch(() => setError("Failed to load item details"))
        .finally(() => setIsFetching(false));
    }
  }, [params.itemId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: params.itemId, proofText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to submit claim");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (status === "loading" || isFetching) {
    return <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading...</div>;
  }

  if (error && !item) {
    return <div className="container" style={{ padding: "4rem 0", textAlign: "center", color: "var(--danger-500)" }}>{error}</div>;
  }

  return (
    <div className="container" style={{ padding: "3rem 1rem", maxWidth: "600px" }}>
      <div className="card glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger-500)", padding: "1rem", borderRadius: "50%" }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem" }}>Claim Verification</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Provide proof of ownership for: <strong>{item?.title}</strong>
            </p>
          </div>
        </div>

        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Important Security Notice</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            To prevent fraud, you must provide verifiable proof that this item belongs to you. Do not simply say "this is mine."
          </p>
          <ul style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
            <li>What exactly was inside the bag/wallet?</li>
            <li>What is the lock screen wallpaper or device passcode?</li>
            <li>Are there any specific scratches, marks, or stickers?</li>
          </ul>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="proof" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Your Proof of Ownership
            </label>
            <textarea
              id="proof"
              required
              rows={5}
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              className="input-field"
              placeholder="E.g., Inside the black wallet, there is my student ID card (ID: 123456) and a picture of a dog."
              style={{ resize: "vertical" }}
            ></textarea>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !proofText.trim()}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {isLoading ? "Submitting..." : "Submit Claim Securely"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

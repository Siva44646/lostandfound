"use client";

import { useState, useEffect, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft } from "lucide-react";
import styles from "../messages.module.css";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function ChatView({ params }: { params: Promise<{ id: string }> }) {
  const { id: otherUserId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = session?.user ? (session.user as any).id : null;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && otherUserId) {
      fetchMessages();
      
      // Simple polling for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [status, otherUserId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherUserId, content }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading chat...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Mobile only back button overlay */}
      <div className={styles.chatArea} style={{ display: 'flex' }}>
        <div className={styles.chatHeader}>
          <Link href="/messages" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} className="md-hidden">
            <ArrowLeft size={20} />
          </Link>
          <div className={styles.avatar}>U</div>
          <div>
            <div style={{ fontWeight: 600 }}>User</div>
          </div>
        </div>

        <div className={styles.messageList}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'auto', marginBottom: 'auto' }}>
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.message} ${msg.senderId === userId ? styles.messageSent : styles.messageReceived}`}
              >
                {msg.content}
                <div className={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className={`input-field ${styles.messageInput}`}
            required
          />
          <button type="submit" className={`btn-primary ${styles.sendBtn}`}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

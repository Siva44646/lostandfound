"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import styles from "./messages.module.css";

type Conversation = {
  user: { id: string; name: string };
  latestMessage: { content: string; createdAt: string };
  unreadCount: number;
};

export default function MessagesList() {
  const { status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/messages")
        .then(res => res.json())
        .then(data => {
          if (data.conversations) {
            setConversations(data.conversations);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading messages...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar: Conversation List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
        </div>
        
        <div className={styles.conversationList}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No messages yet
            </div>
          ) : (
            conversations.map(convo => (
              <Link key={convo.user.id} href={`/messages/${convo.user.id}`} className={styles.conversationItem}>
                <div className={styles.avatar}>
                  {convo.user.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.convoDetails}>
                  <div className={styles.convoName}>
                    {convo.user.name}
                    {convo.unreadCount > 0 && <span className={styles.unreadBadge}>{convo.unreadCount}</span>}
                  </div>
                  <div className={styles.convoPreview}>
                    {convo.latestMessage.content}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat Area (Empty State on Root /messages) */}
      <div className={styles.chatArea}>
        <div className={styles.emptyChat}>
          <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>Select a conversation</h3>
          <p>Choose a user from the list to start messaging.</p>
        </div>
      </div>
    </div>
  );
}

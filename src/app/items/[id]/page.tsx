import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, CheckCircle, MessageCircle, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const item = await prisma.item.findUnique({
    where: { id },
    include: { 
      images: true, 
      user: { select: { name: true, id: true } },
      college: true,
      campus: true,
      building: true,
      floor: true,
      area: true
    }
  });

  if (!item) {
    notFound();
  }

  const isOwner = session?.user && (session.user as any).id === item.userId;
  
  const locationString = item.area?.name && item.building?.name 
    ? `${item.area.name}, ${item.floor?.name ? item.floor.name + ', ' : ''}${item.building.name}, ${item.campus?.name}`
    : item.locationName || "Unknown Location";

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }}>
        
        {/* Left Side: Image */}
        <div style={{ flex: 1, backgroundColor: 'var(--neutral-100)', minHeight: '300px', backgroundImage: item.images[0] ? `url(${item.images[0].url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          {!item.images[0] && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No image provided
            </div>
          )}
          <span style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, color: 'white', backgroundColor: item.type === 'LOST' ? 'var(--danger-500)' : 'var(--success-500)' }}>
            {item.type}
          </span>
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              {item.category}
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6 }}>{item.description}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <MapPin size={20} className="text-gradient" />
              <strong>Location:</strong> {locationString}
              {item.locationName && item.area && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>({item.locationName})</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <Calendar size={20} className="text-gradient" />
              <strong>Date:</strong> {item.date.toLocaleDateString()} {item.time ? `at ${item.time}` : ''}
            </div>
            {item.reward && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={20} className="text-gradient" />
                <strong>Reward:</strong> {item.reward}
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            {isOwner ? (
              <div style={{ padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> You reported this item.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                {item.type === 'FOUND' && (
                  <Link href={`/claims/new/${item.id}`} className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle size={18} /> Claim This Item
                  </Link>
                )}
                {item.type === 'LOST' && (
                  <Link href={`/report/found`} className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle size={18} /> I Found This
                  </Link>
                )}
                <Link href={`/messages/${item.userId}?itemId=${item.id}`} className="btn-secondary" style={{ flex: 1 }}>
                  <MessageCircle size={18} /> Message User
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

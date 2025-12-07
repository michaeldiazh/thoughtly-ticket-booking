/**
 * Event Card Component
 * Displays a single event in a card format
 */

import type { EventListItem } from '../types/event';
import './EventCard.css';

interface EventCardProps {
  event: EventListItem;
}

export function EventCard({ event }: EventCardProps) {
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-date-badge">
          <div className="date-month">{formatDateShort(event.startTime)}</div>
          <div className="date-time">{formatTime(event.startTime)}</div>
        </div>
        <div className="event-title-section">
          <h2>{event.name}</h2>
          <div className="event-location">
            <span className="location-icon">📍</span>
            <span>{event.venueCity}, {event.venueCountryCode}</span>
          </div>
        </div>
      </div>
      
      {event.description && (
        <p className="event-description">{event.description}</p>
      )}
      
      <div className="event-footer">
        <div className="event-venue">
          <span className="venue-icon">🏛️</span>
          <span>{event.venueName}</span>
        </div>
        <div className="event-duration">
          <span className="duration-icon">🕐</span>
          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
        </div>
      </div>
    </div>
  );
}

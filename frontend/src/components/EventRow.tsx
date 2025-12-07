/**
 * Event Row Component
 * Displays a single event as a table row
 */

import type { EventListItem } from '../types/event';
import './EventRow.css';

interface EventRowProps {
  event: EventListItem;
  onViewDetails: (eventId: number) => void;
}

export function EventRow({ event, onViewDetails }: EventRowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
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
    <tr>
      <td className="event-name">{event.name}</td>
      <td className="event-description">{event.description || '-'}</td>
      <td className="venue-name">{event.venueName}</td>
      <td className="location">{event.venueCity}, {event.venueCountryCode}</td>
      <td className="date">{formatDate(event.startTime)}</td>
      <td className="start-time">{formatTime(event.startTime)}</td>
      <td className="end-time">{formatTime(event.endTime)}</td>
      <td className="action-cell">
        <button 
          className="view-button"
          onClick={() => onViewDetails(event.id)}
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

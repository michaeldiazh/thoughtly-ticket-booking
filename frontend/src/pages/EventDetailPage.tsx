/**
 * Event Detail Page
 * Shows complete event information with venue and ticket tiers
 */

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getEventById, bookTicket, type UserTicket } from '../services/api';
import type { Event } from '../types/event';
import './EventDetailPage.css';

interface EventDetailPageProps {
  eventId: number;
  onBack: () => void;
  onBookingSuccess: (ticket: UserTicket) => void;
}

export function EventDetailPage({ eventId, onBack, onBookingSuccess }: EventDetailPageProps) {
  const { selectedUser } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTierCode, setSelectedTierCode] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEventById(eventId);
        
        if (response.status === 'OK' && response.data) {
          setEvent(response.data);
        } else {
          setError(response.error?.message || 'Event not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  };

  const handleBuyTickets = async () => {
    if (!selectedTierCode || !event?.tiers || !selectedUser) return;
    
    const tier = event.tiers[selectedTierCode];
    const qty = Number(quantity);
    
    if (qty <= 0 || qty > tier.remaining) {
      setBookingError(`Invalid quantity. Available: ${tier.remaining}`);
      return;
    }

    try {
      setBooking(true);
      setBookingError(null);
      
      const response = await bookTicket({
        ticketId: tier.ticketId,
        userId: selectedUser.id,
        quantity: qty,
      });

      if (response.status === 'OK' && response.data) {
        onBookingSuccess(response.data);
      } else {
        setBookingError(response.error?.message || 'Failed to book tickets');
      }
    } catch (err) {
      console.error('Error booking tickets:', err);
      setBookingError(err instanceof Error ? err.message : 'Failed to book tickets');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="loading-message">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <button onClick={onBack} className="back-button">
          ← Back to Events
        </button>
        <div className="error-message">Error: {error || 'Event not found'}</div>
      </div>
    );
  }

  const tiers = event.tiers ? Object.entries(event.tiers) : [];
  const selectedTier = selectedTierCode && event.tiers ? event.tiers[selectedTierCode] : null;
  const maxQuantity = selectedTier ? selectedTier.remaining : 0;
  const unitPrice = selectedTier ? (typeof selectedTier.price === 'string' ? parseFloat(selectedTier.price) : selectedTier.price) : 0;
  const totalPrice = unitPrice * Number(quantity || 0);

  return (
    <div className="event-detail-page">
      <button onClick={onBack} className="back-button">
        ← Back to Events
      </button>

      <div className="event-detail-box">
        <div className="event-left">
          <h1>{event.name}</h1>
          
          {event.description && (
            <div className="description-section">
              <h2>Description</h2>
              <p>{event.description}</p>
            </div>
          )}

          <div className="date-time-section">
            <h2>Date & Time</h2>
            <div className="info-item">
              <strong>Date:</strong> {formatDate(event.startTime)}
            </div>
            <div className="info-item">
              <strong>Start Time:</strong> {formatTime(event.startTime)}
            </div>
            <div className="info-item">
              <strong>End Time:</strong> {formatTime(event.endTime)}
            </div>
          </div>

          <div className="venue-section">
            <h2>Venue Details</h2>
            <div className="info-item">
              <strong>Name:</strong> {event.venue.name}
            </div>
            <div className="info-item">
              <strong>Address:</strong> {event.venue.address}
            </div>
            <div className="info-item">
              <strong>City:</strong> {event.venue.city}
            </div>
            {event.venue.region && (
              <div className="info-item">
                <strong>Region:</strong> {event.venue.region}
              </div>
            )}
            <div className="info-item">
              <strong>Country:</strong> {event.venue.countryCode}
            </div>
            <div className="info-item">
              <strong>Timezone:</strong> {event.venue.timezone}
            </div>
          </div>
        </div>

        <div className="event-right">
          <h2>Book Tickets</h2>
          
          {tiers.length === 0 ? (
            <p className="no-tiers">No tickets available for this event.</p>
          ) : (
            <div className="booking-form">
              <div className="form-group">
                <label htmlFor="tier-select">Select Tier:</label>
                  <select
                    id="tier-select"
                    value={selectedTierCode}
                    onChange={(e) => {
                      setSelectedTierCode(e.target.value);
                      setQuantity('1');
                    }}
                  >
                    <option value="">-- Choose a tier --</option>
                    {tiers.map(([tierCode, tier]) => (
                      <option 
                        key={tierCode} 
                        value={tierCode}
                        disabled={tier.remaining === 0}
                      >
                        {tier.tierDisplayName} - ${formatPrice(tier.price)} 
                        {tier.remaining === 0 ? ' (Sold Out)' : ` (${tier.remaining} available)`}
                      </option>
                    ))}
                  </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={selectedTier ? quantity : ''}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={!selectedTier}
                  placeholder={selectedTier ? undefined : '-'}
                />
                {selectedTier ? (
                  <small>Maximum {maxQuantity} ticket{maxQuantity !== 1 ? 's' : ''} available</small>
                ) : (
                  <small>Select a tier to enter quantity</small>
                )}
              </div>

              <div className="price-summary">
                <div className="price-row">
                  <span>Price per ticket:</span>
                  <span>{selectedTier ? `$${formatPrice(selectedTier.price)}` : '-'}</span>
                </div>
                <div className="price-row">
                  <span>Quantity:</span>
                  <span>{selectedTier ? (quantity || 0) : '-'}</span>
                </div>
                <div className="price-row total">
                  <span>Total:</span>
                  <span>{selectedTier ? `$${totalPrice.toFixed(2)}` : '-'}</span>
                </div>
              </div>

              {bookingError && (
                <div className="booking-error">
                  Error: {bookingError}
                </div>
              )}
              <button
                className="buy-button"
                onClick={handleBuyTickets}
                disabled={!selectedTier || !quantity || Number(quantity) < 1 || Number(quantity) > maxQuantity || booking || !selectedUser}
              >
                {booking ? 'Processing...' : 'Buy Tickets'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation Page
 * Shows booking confirmation after successful ticket purchase
 */

import type { UserTicket } from '../services/api';
import './ConfirmationPage.css';

interface ConfirmationPageProps {
  userTicket: UserTicket;
  onBackToHome: () => void;
}

export function ConfirmationPage({ userTicket, onBackToHome }: ConfirmationPageProps) {
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

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-box">
        <div className="confirmation-header">
          <h1>✓ Booking Confirmed!</h1>
          <p className="success-message">Your tickets have been successfully purchased.</p>
        </div>

        <div className="confirmation-details">
          <div className="detail-section">
            <h2>Event Information</h2>
            <div className="info-item">
              <strong>Event:</strong> {userTicket.eventName}
            </div>
            <div className="info-item">
              <strong>Venue:</strong> {userTicket.venueName}
            </div>
            <div className="info-item">
              <strong>Date:</strong> {formatDate(userTicket.startTime)}
            </div>
            <div className="info-item">
              <strong>Start Time:</strong> {formatTime(userTicket.startTime)}
            </div>
            <div className="info-item">
              <strong>End Time:</strong> {formatTime(userTicket.endTime)}
            </div>
          </div>

          <div className="detail-section">
            <h2>Booking Details</h2>
            <div className="info-item">
              <strong>Booking ID:</strong> {userTicket.id}
            </div>
            <div className="info-item">
              <strong>Number of Tickets:</strong> {userTicket.ticketAmount}
            </div>
            <div className="info-item">
              <strong>Price per Ticket:</strong> ${formatPrice(userTicket.unitPrice)}
            </div>
            <div className="info-item total">
              <strong>Total Price:</strong> ${formatPrice(userTicket.totalPrice)}
            </div>
            <div className="info-item">
              <strong>Purchase Date:</strong> {formatDate(userTicket.datePurchased)} at {formatTime(userTicket.datePurchased)}
            </div>
          </div>
        </div>

        <button className="home-button" onClick={onBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

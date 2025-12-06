-- Thoughtly Ticket Booking System
-- Test Data Insert Queries
--
-- This file contains INSERT statements for populating the database with test data.
-- Execute these queries in order to set up test data for development and testing.

-- ============================================================================
-- Price Tiers (must be inserted first - no dependencies)
-- ============================================================================

INSERT INTO price_tier (code, display_name, default_price) VALUES
                                                               ('GA', 'General Admission', 10.00),
                                                               ('FRONT_ROW', 'Front Row', 50.00),
                                                               ('VIP', 'VIP', 100.00);

-- ============================================================================
-- Venues (no dependencies)
-- ============================================================================

INSERT INTO venue (name, address, city, region, country_code, timezone) VALUES
                                                                            ('Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 'NY', 'US', 'America/New_York'),
                                                                            ('The O2 Arena', 'Peninsula Square', 'London', NULL, 'GB', 'Europe/London'),
                                                                            ('Tokyo Dome', '1-3-61 Koraku, Bunkyo', 'Tokyo', NULL, 'JP', 'Asia/Tokyo'),
                                                                            ('Accor Arena', '8 Boulevard de Bercy', 'Paris', 'Île-de-France', 'FR', 'Europe/Paris'),
                                                                            ('Rod Laver Arena', 'Olympic Boulevard', 'Melbourne', 'VIC', 'AU', 'Australia/Melbourne');

-- ============================================================================
-- Users (no dependencies)
-- ============================================================================

INSERT INTO user (first_name, last_name, address, city, region, country_code, timezone) VALUES
                                                                                            ('John', 'Doe', '123 Main Street', 'New York', 'NY', 'US', 'America/New_York'),
                                                                                            ('Jane', 'Smith', '456 Oak Avenue', 'Los Angeles', 'CA', 'US', 'America/Los_Angeles'),
                                                                                            ('Michael', 'Johnson', '789 Park Lane', 'London', NULL, 'GB', 'Europe/London'),
                                                                                            ('Sarah', 'Williams', '321 Elm Street', 'Toronto', 'ON', 'CA', 'America/Toronto'),
                                                                                            ('David', 'Brown', '654 Maple Drive', 'Sydney', 'NSW', 'AU', 'Australia/Sydney'),
                                                                                            ('Emily', 'Davis', '987 Cherry Road', 'Paris', 'Île-de-France', 'FR', 'Europe/Paris'),
                                                                                            ('James', 'Wilson', '147 Pine Street', 'Tokyo', NULL, 'JP', 'Asia/Tokyo');

-- ============================================================================
-- Events (depends on venues)
-- ============================================================================

INSERT INTO event (name, description, venue_id, start_time, end_time) VALUES
                                                                          ('Summer Concert 2024', 'An amazing summer concert experience featuring top artists', 1, '2024-07-15 19:00:00', '2024-07-15 22:00:00'),
                                                                          ('Rock Festival', 'Three-day rock music festival with multiple stages', 1, '2024-08-10 14:00:00', '2024-08-12 23:00:00'),
                                                                          ('Jazz Night', 'Intimate jazz performance in the heart of London', 2, '2024-06-20 20:00:00', '2024-06-20 23:30:00'),
                                                                          ('Electronic Music Show', 'High-energy electronic music event', 2, '2024-09-05 21:00:00', '2024-09-06 02:00:00'),
                                                                          ('Classical Symphony', 'Orchestral performance featuring Beethoven and Mozart', 3, '2024-07-25 19:30:00', '2024-07-25 22:00:00'),
                                                                          ('Pop Star Tour', 'International pop star world tour stop', 3, '2024-10-12 18:00:00', '2024-10-12 21:30:00'),
                                                                          ('Indie Music Festival', 'Multi-day indie music festival', 4, '2024-08-25 15:00:00', '2024-08-27 23:00:00'),
                                                                          ('Country Music Night', 'Country music showcase with line dancing', 5, '2024-09-15 19:00:00', '2024-09-15 23:00:00');

-- ============================================================================
-- Tickets (depends on events and price_tier)
-- ============================================================================

-- Event 1: Summer Concert 2024 (Madison Square Garden)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (1, 'VIP', 100, 45, 100.00),
                                                                         (1, 'FRONT_ROW', 50, 20, 50.00),
                                                                         (1, 'GA', 500, 200, 10.00);

-- Event 2: Rock Festival (Madison Square Garden)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (2, 'VIP', 200, 150, 120.00),
                                                                         (2, 'FRONT_ROW', 100, 75, 60.00),
                                                                         (2, 'GA', 1000, 800, 15.00);

-- Event 3: Jazz Night (The O2 Arena)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (3, 'VIP', 50, 30, 150.00),
                                                                         (3, 'FRONT_ROW', 30, 15, 75.00),
                                                                         (3, 'GA', 300, 250, 25.00);

-- Event 4: Electronic Music Show (The O2 Arena)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (4, 'VIP', 150, 100, 110.00),
                                                                         (4, 'FRONT_ROW', 80, 50, 55.00),
                                                                         (4, 'GA', 800, 600, 20.00);

-- Event 5: Classical Symphony (Tokyo Dome)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (5, 'VIP', 80, 40, 130.00),
                                                                         (5, 'FRONT_ROW', 40, 20, 65.00),
                                                                         (5, 'GA', 400, 350, 30.00);

-- Event 6: Pop Star Tour (Tokyo Dome)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (6, 'VIP', 300, 50, 200.00),
                                                                         (6, 'FRONT_ROW', 150, 100, 100.00),
                                                                         (6, 'GA', 2000, 1500, 40.00);

-- Event 7: Indie Music Festival (Accor Arena)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (7, 'VIP', 120, 80, 95.00),
                                                                         (7, 'FRONT_ROW', 60, 40, 48.00),
                                                                         (7, 'GA', 600, 500, 18.00);

-- Event 8: Country Music Night (Rod Laver Arena)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
                                                                         (8, 'VIP', 90, 60, 105.00),
                                                                         (8, 'FRONT_ROW', 45, 30, 52.50),
                                                                         (8, 'GA', 450, 400, 22.00);

-- ============================================================================
-- User Tickets / Bookings (depends on tickets and users)
-- ============================================================================

-- John Doe's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (1, 1, 100.00, 2),  -- 2 VIP tickets for Summer Concert
                                                                            (4, 1, 50.00, 1);   -- 1 Front Row ticket for Summer Concert

-- Jane Smith's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (3, 2, 10.00, 5),   -- 5 GA tickets for Summer Concert
                                                                            (10, 2, 150.00, 1); -- 1 VIP ticket for Jazz Night

-- Michael Johnson's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (10, 3, 150.00, 2), -- 2 VIP tickets for Jazz Night
                                                                            (11, 3, 75.00, 3);  -- 3 Front Row tickets for Jazz Night

-- Sarah Williams's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (13, 4, 110.00, 1), -- 1 VIP ticket for Electronic Music Show
                                                                            (15, 4, 20.00, 4);  -- 4 GA tickets for Electronic Music Show

-- David Brown's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (19, 5, 200.00, 1), -- 1 VIP ticket for Pop Star Tour
                                                                            (20, 5, 100.00, 2); -- 2 Front Row tickets for Pop Star Tour

-- Emily Davis's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (22, 6, 95.00, 2),  -- 2 VIP tickets for Indie Music Festival
                                                                            (24, 6, 18.00, 6);  -- 6 GA tickets for Indie Music Festival

-- James Wilson's bookings
INSERT INTO user_ticket (ticket_id, user_id, unit_price, ticket_amount) VALUES
                                                                            (22, 7, 105.00, 1), -- 1 VIP ticket for Country Music Night
                                                                            (23, 7, 52.50, 2);  -- 2 Front Row tickets for Country Music Night

-- ============================================================================
-- Summary
-- ============================================================================
--
-- This test data includes:
-- - 3 price tiers (GA, FRONT_ROW, VIP)
-- - 5 venues across different countries
-- - 7 users from different countries
-- - 8 events at various venues
-- - 24 tickets (3 tiers × 8 events)
-- - 20 user bookings across different events and tiers
--
-- You can use this data to test:
-- - GET /api/v1/ticket endpoint with various filters
-- - GET /api/v1/ticket/:id endpoint
-- - GET /api/v1/event endpoint with various filters
-- - GET /api/v1/event/:id endpoint (with JSON aggregation)
-- - POST /api/v1/user/ticket endpoint (booking tickets)
-- - Concurrency control (multiple users booking same ticket)

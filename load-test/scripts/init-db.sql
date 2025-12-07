-- Database Initialization Script for Load Testing
-- 
-- This script runs automatically when MySQL container starts
-- Docker Compose mounts this file to /docker-entrypoint-initdb.d/
-- MySQL runs all .sql files in that directory on first startup
--
-- Uses the schema from docs/schema.sql

-- ============================================================================
-- Schema from docs/schema.sql
-- ============================================================================

-- Venue table
create table venue
(
    id           INT          not null auto_increment primary key,
    name         varchar(100) not null,
    address      varchar(255) not null,
    city         varchar(60)  not null,
    region       varchar(120) null,
    country_code char(4)      not null,
    timezone     varchar(64)  not null,
    constraint unique_venue_identity
        unique (name, address, city, country_code)
);

create index idx_venue_country_code
    ON venue (country_code);

-- User Table
create table user
(
    id           INT          not null auto_increment primary key,
    first_name   varchar(50)  not null,
    last_name    varchar(50)  not null,
    address      varchar(255) not null,
    city         varchar(60)  not null,
    region       varchar(120) null,
    country_code char(4)      not null,
    timezone     varchar(64)  not null,
    constraint unique_user_identity unique (first_name, last_name, address, city, country_code)
);

create index idx_user_country_code on user (country_code);

-- Event Table
create table event
(
    id          int          not null auto_increment primary key,
    name        varchar(100) not null,
    description text         null,
    venue_id    int          not null,
    foreign key (venue_id) references venue (id),
    start_time  timestamp    not null,
    end_time    timestamp    not null,
    constraint unique_event_venue_name
        unique (venue_id, name, start_time)
);

create index idx_event_venue_id on event (venue_id);

-- Price Tier Table
create table price_tier
(
    code          varchar(32)    not null primary key, -- 'GA', 'FRONT_ROW', 'VIP'
    display_name  varchar(64)    not null,             -- 'General Admission' , 'Front Row', 'VIP'
    default_price decimal(10, 2) not null
);

-- Ticket table
create table ticket
(
    id           int            not null auto_increment primary key,
    event_id     int            not null,
    tier_code    varchar(32)    not null,
    capacity     int            not null,
    remaining    int            not null,
    price        decimal(10, 2) not null,
    created_at   datetime(3)    not null default current_timestamp(3),
    last_updated datetime(3)    not null default current_timestamp(3) on update current_timestamp(3),
    foreign key (event_id) references event (id),
    foreign key (tier_code) references price_tier (code),
    constraint unique_ticket_event_tier unique (event_id, tier_code),
    check (capacity >= 0 AND remaining >= 0 AND remaining <= capacity)
);

-- User Ticket Table (Bookings)
create table user_ticket
(
    id             int            not null auto_increment primary key,
    ticket_id      int            not null,
    user_id        int            not null,
    unit_price     decimal(10, 2) not null,
    ticket_amount  int            not null,
    date_purchased datetime(3)    not null default current_timestamp(3),
    foreign key (ticket_id) references ticket (id),
    foreign key (user_id) references user (id)
);

-- ============================================================================
-- Test Data for Load Testing
-- ============================================================================

-- Price Tiers
INSERT INTO price_tier (code, display_name, default_price) VALUES
    ('GA', 'General Admission', 10.00),
    ('FRONT_ROW', 'Front Row', 50.00),
    ('VIP', 'VIP', 100.00);

-- Venues
INSERT INTO venue (name, address, city, region, country_code, timezone) VALUES
    ('Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 'NY', 'US', 'America/New_York');

-- Users (for load testing)
INSERT INTO user (first_name, last_name, address, city, region, country_code, timezone) VALUES
    ('Load', 'Tester1', '123 Test St', 'Test City', 'TS', 'US', 'America/New_York'),
    ('Load', 'Tester2', '456 Test Ave', 'Test City', 'TS', 'US', 'America/New_York'),
    ('Load', 'Tester3', '789 Test Blvd', 'Test City', 'TS', 'US', 'America/New_York'),
    ('Load', 'Tester4', '321 Test Rd', 'Test City', 'TS', 'US', 'America/New_York'),
    ('Load', 'Tester5', '654 Test Ln', 'Test City', 'TS', 'US', 'America/New_York');

-- Events
INSERT INTO event (name, description, venue_id, start_time, end_time) VALUES
    ('Load Test Concert', 'Concert for load testing double-booking prevention', 1, '2024-12-31 19:00:00', '2024-12-31 22:00:00');

-- Tickets for Load Testing (with plenty of availability)
INSERT INTO ticket (event_id, tier_code, capacity, remaining, price) VALUES
    (1, 'VIP', 100, 100, 100.00),        -- Ticket ID 1: 100 available
    (1, 'FRONT_ROW', 50, 50, 50.00),     -- Ticket ID 2: 50 available
    (1, 'GA', 500, 500, 10.00);           -- Ticket ID 3: 500 available


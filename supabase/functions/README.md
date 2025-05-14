# Masader HR Notification System

This directory contains the Supabase Edge Functions used to send notifications for the Masader HR application.

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Deploy the Edge Functions

```bash
supabase functions deploy send-notification --project-ref vxqvwfhzodknwmpnekzu
```

### 4. Set Secrets

```bash
supabase secrets set EMAIL_API_KEY=your_email_service_api_key --project-ref vxqvwfhzodknwmpnekzu
```

## Available Functions

### `send-notification`

This function handles sending email notifications for:
- Time-off requests
- Room bookings
- Status updates (approved/rejected)

## Email Templates

The function includes HTML templates for different types of notifications:
- New time-off request notification
- New room booking notification
- Request status update notification

## Configuration

To change the email service provider, modify the commented-out section in `send-notification/index.ts` that contains the API call to your email service (SendGrid, Mailgun, etc.).

## Default Recipients

By default, all notifications are sent to:
- beshara@be-masader.com
- hania.sameh@be-masader.com

Plus any department-specific admin emails when applicable.

## Database Tracking

All sent notifications are stored in the `notifications` table for tracking purposes. 
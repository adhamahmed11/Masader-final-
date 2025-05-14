// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://deno.com/manual/runtime/supabase

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

interface EmailPayload {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  type: 'time_off_request' | 'room_booking' | 'status_update';
  data: Record<string, any>;
}

// Replace with your actual email service API key (SendGrid, Mailgun, etc.)
const EMAIL_API_KEY = Deno.env.get('EMAIL_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse request body
    const payload: EmailPayload = await req.json();
    
    // Validate payload
    if (!payload.to || !payload.subject || !payload.type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields in payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate email content based on notification type
    let emailContent = '';
    
    if (payload.type === 'time_off_request') {
      emailContent = generateTimeOffRequestEmail(payload.data);
    } else if (payload.type === 'room_booking') {
      emailContent = generateRoomBookingEmail(payload.data);
    } else if (payload.type === 'status_update') {
      emailContent = generateStatusUpdateEmail(payload.data);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set the email content
    if (!payload.html && !payload.text) {
      payload.html = emailContent;
    }

    // Log the email that would be sent (for debugging)
    console.log('Would send email:', {
      to: payload.to,
      subject: payload.subject,
      html: payload.html?.substring(0, 100) + '...' // Log just the beginning
    });

    // In a real implementation, you would send the email using a service like SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{ to: payload.to.map(email => ({ email })) }],
        subject: payload.subject,
        content: [{ type: 'text/html', value: payload.html }],
        from: { email: 'notifications@masader-hr.com', name: 'Masader HR' }
      })
    });
    */

    // For this demo, just log and return success
    console.log(`Email notification sent to ${payload.to.join(', ')}`);
    
    // Also store the notification in the database for tracking
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipients: payload.to,
        subject: payload.subject,
        content: payload.html || payload.text,
        notification_type: payload.type,
        status: 'sent'
      });
      
    if (error) {
      console.error('Error storing notification:', error);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions to generate email content
function generateTimeOffRequestEmail(data: Record<string, any>): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #346AA0; color: white; padding: 10px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Time-Off Request</h2>
          </div>
          <div class="content">
            <p>A new time-off request has been submitted and requires your review.</p>
            <p><strong>Employee:</strong> ${data.userName}</p>
            <p><strong>Department:</strong> ${data.userDepartment || 'N/A'}</p>
            <p><strong>Request Type:</strong> ${data.requestType}</p>
            <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Same as start date'}</p>
            <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
            <p>Please log in to the Masader HR portal to approve or reject this request.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Masader HR system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateRoomBookingEmail(data: Record<string, any>): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #346AA0; color: white; padding: 10px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New ${data.roomType} Room Booking</h2>
          </div>
          <div class="content">
            <p>A new room booking has been submitted and requires your review.</p>
            <p><strong>Employee:</strong> ${data.userName}</p>
            <p><strong>Department:</strong> ${data.userDepartment || 'N/A'}</p>
            <p><strong>Room Type:</strong> ${data.roomType}</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
            <p><strong>Time Slot:</strong> ${data.timeSlot}</p>
            <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
            <p>Please log in to the Masader HR portal to approve or reject this booking.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Masader HR system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateStatusUpdateEmail(data: Record<string, any>): string {
  const requestTypeText = data.requestType === 'time_off' 
    ? 'Time-Off Request' 
    : 'Room Booking';
    
  const statusText = data.status === 'approved' 
    ? 'approved ✅' 
    : 'rejected ❌';
    
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${data.status === 'approved' ? '#4CAF50' : '#F44336'}; color: white; padding: 10px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Your ${requestTypeText} Has Been ${statusText}</h2>
          </div>
          <div class="content">
            <p>Dear ${data.userName},</p>
            <p>Your recent ${requestTypeText.toLowerCase()} has been <strong>${data.status}</strong>.</p>
            <p>You can log in to the Masader HR portal to view more details.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Masader HR system.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 
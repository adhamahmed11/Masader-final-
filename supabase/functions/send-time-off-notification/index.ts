import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

// Default admin to always notify
const DEFAULT_ADMIN_EMAIL = 'hania.sameh@be-masader.com';

serve(async (req) => {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse the request body
    const { 
      requestId, 
      userEmail, 
      userName, 
      userDepartment,
      requestType, 
      startDate, 
      endDate,
      adminEmails = []
    } = await req.json();

    if (!requestId || !userEmail || !userName || !requestType || !startDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Ensure we have at least the default admin in the list
    const emailRecipients = [...new Set([DEFAULT_ADMIN_EMAIL, ...adminEmails])];

    // Format date range for email
    const dateRange = endDate 
      ? `from ${formatDate(startDate)} to ${formatDate(endDate)}` 
      : `on ${formatDate(startDate)}`;

    // Email content
    const subject = `New Time Off Request from ${userName}`;
    const body = `
      <h2>New Time Off Request</h2>
      <p>A new time off request has been submitted.</p>
      <p><strong>Employee:</strong> ${userName} (${userEmail})</p>
      <p><strong>Department:</strong> ${userDepartment || 'Not specified'}</p>
      <p><strong>Request Type:</strong> ${requestType}</p>
      <p><strong>Date(s):</strong> ${dateRange}</p>
      <p>Please log in to the Masader HR portal to approve or reject this request.</p>
      <p>Request ID: ${requestId}</p>
    `;

    // Initialize SMTP client
    const client = new SmtpClient();

    // Configure connection - replace with your actual SMTP settings
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.example.com',
      port: Number(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USERNAME') || 'your-username',
      password: Deno.env.get('SMTP_PASSWORD') || 'your-password',
    });

    // Send emails to all admins
    const from = Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@masader-hr.com';
    
    for (const adminEmail of emailRecipients) {
      await client.send({
        from: from,
        to: adminEmail,
        subject: subject,
        html: body,
      });
    }

    // Close the connection
    await client.close();

    return new Response(JSON.stringify({ 
      success: true,
      recipients: emailRecipients
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// Helper function to format dates
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
} 
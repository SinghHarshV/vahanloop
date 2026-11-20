/**
 * Branded VahanLoop Transactional Email Templates
 * Responsive, dark-navy and emerald styling matching VahanLoop's design system.
 */

function emailWrapper(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f8fa; margin: 0; padding: 20px; color: #17212b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e7eaee; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #10243a; padding: 30px; text-align: center; }
    .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #15966b; }
    .content { padding: 32px 30px; }
    h1 { font-size: 22px; font-weight: 700; color: #10243a; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 16px; }
    .highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #10243a; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 9999px; margin-top: 10px; }
    .btn-emerald { background: #15966b; }
    .footer { background: #f7f8fa; border-top: 1px solid #e7eaee; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ddf5e9; color: #0d6849; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://vahanloop.com" class="logo">Vahan<span>Loop</span></a>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} VahanLoop Mobility Inc. Verified Peer-to-Peer & Fleet Marketplace.</p>
      <p style="margin: 6px 0 0;">This is an automated operational notification. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to VahanLoop – Move Freely. Rent Smarter.',
    html: emailWrapper(
      'Welcome to VahanLoop',
      `<span class="badge">Registration Confirmed</span>
      <h1>Welcome to VahanLoop, ${name}!</h1>
      <p>Thank you for joining India's modern peer-to-peer and commercial fleet mobility platform. You can now browse verified vehicles, compare self-drive and chauffeur rentals, or list your own car or bike to earn.</p>
      <div class="highlight-card">
        <strong style="display:block; margin-bottom: 8px; color: #10243a;">Quick Next Steps:</strong>
        <p style="margin: 4px 0;">• Complete digital KYC in your profile for fast checkout.</p>
        <p style="margin: 4px 0;">• Explore curated cars, cruisers, and city scooters with zero hidden fees.</p>
        <p style="margin: 4px 0;">• Have a vehicle? Switch to Host mode to start earning up to ₹35,000/month.</p>
      </div>
      <a href="https://vahanloop.com/explore" class="btn btn-emerald">Explore Available Fleet</a>`
    ),
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset Your VahanLoop Password',
    html: emailWrapper(
      'Password Reset Request',
      `<span class="badge">Security Alert</span>
      <h1>Password Reset Request</h1>
      <p>Hello ${name},</p>
      <p>We received a request to reset your VahanLoop account password. Click the secure button below to choose a new password. This link will expire in <strong>15 minutes</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>`
    ),
  }),

  bookingRequestedHost: (hostName: string, vehicleTitle: string, guestName: string, startDate: string, totalAmount: string, actionUrl: string) => ({
    subject: `New Rental Request: ${vehicleTitle} on VahanLoop`,
    html: emailWrapper(
      'New Rental Request',
      `<span class="badge">Action Required</span>
      <h1>New Booking Request for ${vehicleTitle}</h1>
      <p>Hello ${hostName},</p>
      <p><strong>${guestName}</strong> has requested to rent your vehicle. Please review and accept or decline this request promptly.</p>
      <div class="highlight-card">
        <p style="margin: 4px 0;"><strong>Vehicle:</strong> ${vehicleTitle}</p>
        <p style="margin: 4px 0;"><strong>Pickup Date:</strong> ${startDate}</p>
        <p style="margin: 4px 0;"><strong>Estimated Earnings:</strong> ₹${totalAmount}</p>
      </div>
      <a href="${actionUrl}" class="btn btn-emerald">Review Request in Host Portal</a>`
    ),
  }),

  bookingConfirmed: (guestName: string, vehicleTitle: string, bookingId: string, startDate: string, endDate: string, location: string) => ({
    subject: `Booking Confirmed: ${vehicleTitle} (Ref: ${bookingId})`,
    html: emailWrapper(
      'Booking Confirmed',
      `<span class="badge" style="background:#ddf5e9; color:#0d6849;">Confirmed Reservation</span>
      <h1>Your Ride is Ready, ${guestName}!</h1>
      <p>Your booking for <strong>${vehicleTitle}</strong> has been successfully confirmed. Handover and inspection checklist instructions are available in your trips dashboard.</p>
      <div class="highlight-card">
        <p style="margin: 4px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin: 4px 0;"><strong>Pickup Window:</strong> ${startDate}</p>
        <p style="margin: 4px 0;"><strong>Return Window:</strong> ${endDate}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${location}</p>
      </div>
      <a href="https://vahanloop.com/bookings" class="btn">View Booking Details</a>`
    ),
  }),

  paymentReceipt: (customerName: string, bookingId: string, amount: string, transactionRef: string) => ({
    subject: `Payment Receipt: ₹${amount} for Booking ${bookingId}`,
    html: emailWrapper(
      'Payment Receipt',
      `<span class="badge">Payment Processed</span>
      <h1>Payment Confirmation</h1>
      <p>Hello ${customerName},</p>
      <p>Your payment of <strong>₹${amount}</strong> has been recorded successfully in test mode.</p>
      <div class="highlight-card">
        <p style="margin: 4px 0;"><strong>Transaction Ref:</strong> ${transactionRef}</p>
        <p style="margin: 4px 0;"><strong>Booking Reference:</strong> ${bookingId}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> COMPLETED (Test Mode)</p>
      </div>
      <p style="font-size: 12px; color: #64748b;">Notice: Prototype environment. No actual banking transaction occurred.</p>`
    ),
  }),

  documentExpiryAlert: (ownerName: string, vehicleTitle: string, docType: string, expiryDate: string, daysRemaining: number) => ({
    subject: `URGENT: ${docType} for ${vehicleTitle} expires in ${daysRemaining} days`,
    html: emailWrapper(
      'Document Expiry Notice',
      `<span class="badge" style="background:#fef3c7; color:#92400e;">Compliance Notice</span>
      <h1>Action Required: Document Expiring Soon</h1>
      <p>Hello ${ownerName},</p>
      <p>Our automated compliance monitor detected that the <strong>${docType}</strong> for your registered vehicle <strong>${vehicleTitle}</strong> will expire on <strong>${expiryDate}</strong> (${daysRemaining} days remaining).</p>
      <div class="highlight-card">
        <p style="margin: 0; color: #b45309; font-weight: 600;">To avoid listing suspension under the Indian Motor Vehicles Act, please upload the renewed document in your Document Safe.</p>
      </div>
      <a href="https://vahanloop.com/owner/documents" class="btn">Upload Renewed Document</a>`
    ),
  }),
};

interface TrialWelcomeEmailOptions {
  email: string;
  name: string;
  expiresAt: string;
}

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export async function sendTrialWelcomeEmail({ email, name, expiresAt }: TrialWelcomeEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');

  const recipient = email.trim();
  if (!recipient) throw new Error('A recipient email address is required to send the trial welcome email.');

  const displayName = (typeof name === 'string' ? name.trim() : '') || 'there';
  const expirationTimestamp = Date.parse(expiresAt);
  if (!Number.isFinite(expirationTimestamp)) {
    throw new Error('A valid trial expiration date is required to send the trial welcome email.');
  }
  const expirationDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(expirationTimestamp);
  const contactPhone = '+93 70 526 9096';
  const supportEmail = 'digitalazizi10@gmail.com';
  const subject = 'Your 7-day DigitalAzizi free trial has started';
  const text = [
    `Hello ${displayName},`,
    '',
    'Your 7-day DigitalAzizi free trial has started.',
    `Your trial is scheduled to end on ${expirationDate}.`,
    'During your trial, you can create up to 5 businesses and add unlimited customers.',
    `After your trial ends, contact ${contactPhone} to subscribe.`,
    `For support, reply to this email or contact ${supportEmail}.`,
    '',
    'Thank you,',
    'DigitalAzizi',
  ].join('\n');
  const html = `
    <p>Hello ${escapeHtml(displayName)},</p>
    <p>Your 7-day DigitalAzizi free trial has started.</p>
    <p>Your trial is scheduled to end on <strong>${escapeHtml(expirationDate)}</strong>.</p>
    <p>During your trial, you can create up to <strong>5 businesses</strong> and add <strong>unlimited customers</strong>.</p>
    <p>After your trial ends, contact <a href="tel:${contactPhone.replaceAll(' ', '')}">${contactPhone}</a> to subscribe.</p>
    <p>For support, reply to this email or contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    <p>Thank you,<br />DigitalAzizi</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'DigitalAzizi <support@digitalazizi.com>',
      to: [recipient],
      reply_to: supportEmail,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    let reason = responseBody;
    try {
      const parsedBody = JSON.parse(responseBody) as { message?: unknown; name?: unknown };
      if (typeof parsedBody.message === 'string') reason = parsedBody.message;
      else if (typeof parsedBody.name === 'string') reason = parsedBody.name;
    } catch {
      // Resend may return a non-JSON error response.
    }
    const detail = reason.trim().slice(0, 500);
    const guidance = response.status === 403
      ? ' Check that the sender domain is verified in Resend and that the API key is allowed to send from that domain.'
      : '';
    throw new Error(
      `Resend rejected the welcome email with status ${response.status}${detail ? `: ${detail}` : '.'}${guidance}`
    );
  }
}

/**
 * Email sending stub. Configure RESEND_API_KEY or SENDGRID_API_KEY and implement.
 * Used for: welcome, payment confirmation, low credits, subscription ending.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? 'Gutenform <noreply@gutenform.de>',
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, error: err };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown' };
    }
  }
  return { ok: false, error: 'No email provider configured' };
}

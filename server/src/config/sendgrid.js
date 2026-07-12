const sgMail = require('@sendgrid/mail');

let enabled = false;
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  enabled = true;
} else {
  console.warn('[sendgrid] SENDGRID_API_KEY not set — emails will be logged, not sent.');
}

const FROM = process.env.SENDGRID_FROM_EMAIL || 'no-reply@reciperight.app';

function welcomeTemplate(name) {
  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #17151f;">
    <div style="background: linear-gradient(135deg, #5b4be0, #8a6bff); padding: 40px 32px; border-radius: 20px 20px 0 0; text-align:center;">
      <h1 style="color:#fff; font-size: 28px; margin: 0;">Welcome to RecipeRight</h1>
    </div>
    <div style="background:#faf9fd; padding: 32px; border-radius: 0 0 20px 20px;">
      <p style="font-size:16px;">Hi ${name || 'there'},</p>
      <p style="font-size:16px; line-height:1.6; color:#64607a;">
        We're thrilled to have you. Share your favourite recipes, discover new dishes from the
        community, and save the ones you love.
      </p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}"
         style="display:inline-block; margin-top:16px; background:#5b4be0; color:#fff; text-decoration:none; padding:12px 28px; border-radius:9999px; font-weight:600;">
        Start exploring
      </a>
      <p style="margin-top:32px; font-size:13px; color:#9a95ad;">Happy cooking, the RecipeRight team.</p>
    </div>
  </div>`;
}

/** Send a welcome email. Never throws — email failures must not break signup. */
async function sendWelcomeEmail(to, name) {
  const msg = {
    to,
    from: FROM,
    subject: 'Welcome to RecipeRight!',
    html: welcomeTemplate(name),
  };

  if (!enabled) {
    console.log(`[sendgrid] (disabled) would send welcome email to ${to}`);
    return;
  }

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error('[sendgrid] failed to send welcome email:', err.message);
  }
}

module.exports = { sendWelcomeEmail, FROM };

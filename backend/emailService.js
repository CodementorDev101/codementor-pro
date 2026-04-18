const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Welcome email after registration
const sendWelcomeEmail = async (toEmail, name) => {
  await sgMail.send({
    from: { email: 'codementorpluspro@gmail.com', name: 'CodeMentor+ Pro' },
    to: toEmail,
    subject: 'Welcome to CodeMentor+ Pro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #f59e0b;">Welcome to CodeMentor+ Pro! 🎉</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been successfully created. You can now log in and start your programming journey.</p>
        <a href="https://codementorpro.codes/login" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#f59e0b; color:#0f172a; border-radius:8px; text-decoration:none; font-weight:bold;">Go to Login</a>
        <p style="margin-top:30px; font-size:12px; color:#94a3b8;">CodeMentor+ Pro</p>
      </div>
    `,
  });
};

// Instructor approval email
const sendApprovalEmail = async (toEmail, name) => {
  await sgMail.send({
    from: { email: 'codementorpluspro@gmail.com', name: 'CodeMentor+ Pro' },
    to: toEmail,
    subject: 'Your Instructor Account Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #f59e0b;">You're Approved! ✅</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your instructor account on CodeMentor+ Pro has been reviewed and <strong style="color:#4ade80;">approved</strong> by the admin.</p>
        <p>You can now log in and start creating exercises for your students.</p>
        <a href="https://codementorpro.codes/login" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#f59e0b; color:#0f172a; border-radius:8px; text-decoration:none; font-weight:bold;">Go to Login</a>
        <p style="margin-top:30px; font-size:12px; color:#94a3b8;">CodeMentor+ Pro</p>
      </div>
    `,
  });
};

// Forgot password email
const sendPasswordResetEmail = async (toEmail, name, resetToken) => {
  const resetLink = `https://codementorpro.codes/reset-password?token=${resetToken}`;
  await sgMail.send({
    from: { email: 'codementorpluspro@gmail.com', name: 'CodeMentor+ Pro' },
    to: toEmail,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #f59e0b;">Password Reset 🔐</h1>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to set a new one:</p>
        <a href="${resetLink}" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#f59e0b; color:#0f172a; border-radius:8px; text-decoration:none; font-weight:bold;">Reset My Password</a>
        <p style="margin-top:20px; color:#94a3b8;">This link expires in <strong style="color:#ffffff;">1 hour</strong>. If you did not request this, ignore this email.</p>
        <p style="margin-top:30px; font-size:12px; color:#94a3b8;">CodeMentor+ Pro</p>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendApprovalEmail, sendPasswordResetEmail };
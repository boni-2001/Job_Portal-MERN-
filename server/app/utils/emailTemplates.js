

const BRAND = {
  name: 'HireNest',
  website: process.env.CLIENT_URL || 'http://localhost:5173',
  logo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/logo192.png`,
  primary: '#5b8def',
  text: '#111827',
  muted: '#6b7280',
  bg: '#f7f9fc',
  border: '#e5e7eb',
};

function layout({ title, intro, buttonText, buttonLink, footerNote }) {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<title>${title} • ${BRAND.name}</title>
<style>
  /* Dark mode friendly base */
  @media (prefers-color-scheme: dark) {
    body { background: #0b0f1a !important; }
    .card { background: #111827 !important; }
    .text { color: #e5e7eb !important; }
    .muted { color: #9ca3af !important; }
    .btn { color: #fff !important; }
    .bordered { border-color: #1f2937 !important; }
  }
  a { color: ${BRAND.primary}; text-decoration: none; }
</style>
</head>
<body style="margin:0;padding:24px;background:${BRAND.bg};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center">
        <table width="560" class="card bordered" style="width:560px;max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <table width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <div style="width:32px;height:32px;border-radius:8px;background:${BRAND.primary};display:inline-block;"></div>
                      <div class="text" style="font-size:18px;font-weight:800;color:${BRAND.text};">${BRAND.name}</div>
                    </div>
                  </td>
                  <td align="right" class="muted" style="color:${BRAND.muted};font-size:12px;">${year}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;">
              <h1 class="text" style="margin:0 0 8px 0;font-size:22px;line-height:1.3;color:${BRAND.text};">${title}</h1>
              <p class="muted" style="margin:0 0 20px 0;color:${BRAND.muted};font-size:14px;line-height:1.6;">
                ${intro}
              </p>

              ${buttonLink ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0 6px 0;">
                <tr>
                  <td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;">
                    <a href="${buttonLink}"
                      class="btn"
                      style="display:inline-block;padding:12px 22px;border-radius:10px;background:${BRAND.primary};color:#ffffff;font-weight:700;font-size:14px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <p class="muted" style="margin:12px 0 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                Or copy & paste this URL in your browser:
                <br />
                <span style="word-break:break-all;"><a href="${buttonLink}">${buttonLink}</a></span>
              </p>
              ` : ''}

              ${footerNote ? `
              <div style="margin-top:18px;padding:12px;border:1px dashed ${BRAND.border};border-radius:10px;">
                <p class="muted" style="margin:0;color:${BRAND.muted};font-size:12px;line-height:1.6;">
                  ${footerNote}
                </p>
              </div>` : ''}

              <p class="muted" style="margin:18px 0 0 0;color:${BRAND.muted};font-size:12px;">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px;background:#fafbff;border-top:1px solid ${BRAND.border};">
              <p class="muted" style="margin:0;color:${BRAND.muted};font-size:12px;">
                © ${year} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        <p class="muted" style="color:${BRAND.muted};font-size:12px;margin:16px 0 0 0;">
          This message was sent by ${BRAND.name}. Please don’t reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ===== Specific templates =====

function verifyEmailTemplate({ name = '', link }) {
  return layout({
    title: 'Verify your email',
    intro: `Hi ${name || 'there'},<br/>Welcome to <b>${BRAND.name}</b>! Please verify your email to activate your account.`,
    buttonText: 'Click here to verify',
    buttonLink: link,
    footerNote: 'This verification link will expire in 1 hour.'
  });
}

function resetPasswordTemplate({ name = '', link }) {
  return layout({
    title: 'Reset your password',
    intro: `Hi ${name || 'there'},<br/>We received a request to reset your password. Click the button below to set a new one.`,
    buttonText: 'Click here to reset password',
    buttonLink: link,
    footerNote: 'This reset link will expire in 1 hour. For your security, it can be used once.'
  });
}

function applicationAcceptedTemplate({ name = '', jobTitle, company }) {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Application Accepted • ${BRAND.name}</title>
  </head>

  <body style="margin:0;padding:24px;background:${BRAND.bg};
    font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
      <tr>
        <td align="center">

          <table width="560" style="
            width:560px;
            max-width:560px;
            background:#ffffff;
            border:1px solid ${BRAND.border};
            border-radius:14px;
            overflow:hidden;
            padding:24px;
          ">

            <tr>
              <td style="padding-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:32px;height:32px;border-radius:8px;
                    background:${BRAND.primary};display:inline-block;"></div>
                  <div style="font-size:18px;font-weight:800;color:${BRAND.text};">
                    ${BRAND.name}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <h2 style="font-size:22px;margin:0 0 12px 0;color:${BRAND.text};">
                  Your Application Was Accepted 🎉
                </h2>

                <p style="font-size:15px;line-height:1.6;color:${BRAND.text};margin:0 0 16px;">
                  Hi ${name || 'there'},<br/><br/>
                  Great news! Your application for 
                  <b>${jobTitle}</b> at <b>${company}</b> has been 
                  <b>accepted</b> by the recruiter.
                </p>

                <p style="font-size:13px;margin:16px 0;color:${BRAND.muted};line-height:1.6;">
                  You will hear from the recruiter soon regarding the next steps.  
                  No action is required from your side right now.
                </p>

                <p style="font-size:12px;color:${BRAND.muted};margin-top:32px;">
                  If you did not apply for this job, you may safely ignore this email.
                </p>
              </td>
            </tr>

          </table>

          <p style="color:${BRAND.muted};font-size:12px;margin-top:12px;">
            © ${year} ${BRAND.name}. All rights reserved.
          </p>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}

// ===== NEW: Seeker application receipt (sent to applicant after they apply) =====
function applicationReceivedTemplate({ name = '', jobTitle, company, nextSteps = '' }) {
  return layout({
    title: 'Application received',
    intro: `Hi ${name || 'there'},<br/>Thanks for applying to <strong>${jobTitle}</strong> at <strong>${company}</strong>. We have received your application and the recruiter will review it shortly.`,
    buttonText: 'View your applications',
    // buttonLink: provide a safe client-side link (if you want to send to a dashboard). Keep optional.
    buttonLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/seeker`,
    footerNote: nextSteps || 'You will be notified by email if the recruiter shortlists or accepts your application.'
  });
}

// ===== NEW: Notification to recruiter/admin when someone applies =====
function newApplicationForRecruiterTemplate({ recruiterName = '', applicantName = '', jobTitle, company, linkToApplication = '' }) {
  const intro = `<strong>${applicantName}</strong> has applied to your job <strong>${jobTitle}</strong> at <strong>${company}</strong>.`;
  const footer = linkToApplication ? 'Open the recruiter dashboard to view the full application and resume.' : 'Open the recruiter dashboard to view the full application and resume.';
  return layout({
    title: 'New application received',
    intro: `Hi ${recruiterName || 'there'},<br/>${intro}`,
    buttonText: 'View application',
    buttonLink: linkToApplication || `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/recruiter`,
    footerNote: footer
  });
}

module.exports = {
  verifyEmailTemplate,
  resetPasswordTemplate,
  applicationAcceptedTemplate,
  // newly exported templates:
  applicationReceivedTemplate,
  newApplicationForRecruiterTemplate,
};

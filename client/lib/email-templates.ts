const SITE_URL = 'https://kasomaibrahim.dev'
const LOGO_CID = 'cid:portfolio-logo'
const BRAND_NAME = 'Kasoma Ibrahim'

export const EMAIL_LOGO_CID = 'portfolio-logo'

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? ''

const wrap = (preheader: string, body: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escape(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;max-width:560px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr><td style="padding:28px 32px 0 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-right:14px;">
                <img src="${LOGO_CID}" width="48" height="48" alt="${BRAND_NAME}" style="display:block;border-radius:50%;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:14px;font-weight:600;color:#1c1917;line-height:1.2;">${BRAND_NAME}</div>
                <div style="font-size:13px;color:#78716c;line-height:1.2;margin-top:2px;">kasomaibrahim.dev</div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px;">${body}</td></tr>
        <tr><td style="padding:16px 32px 28px 32px;">
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:0 0 14px 0;" />
          <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.5;">
            Sent from <a href="${SITE_URL}" style="color:#a8a29e;text-decoration:underline;">kasomaibrahim.dev</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

export type Email = { subject: string; html: string; text: string }

export function notificationEmail(args: { name: string; email: string; message: string }): Email {
  const { name, email, message } = args
  const subject = `New portfolio message from ${name}`
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:600;color:#1c1917;line-height:1.3;">New message from your portfolio</h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:#78716c;line-height:1.5;">Reply to this email to respond directly to ${escape(name)}.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#fafaf9;border-radius:10px;margin:0 0 18px 0;">
      <tr><td style="padding:14px 16px;">
        <div style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">From</div>
        <div style="font-size:15px;color:#1c1917;">${escape(name)} &lt;<a href="mailto:${escape(email)}" style="color:#1c1917;">${escape(email)}</a>&gt;</div>
      </td></tr>
    </table>
    <div style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Message</div>
    <div style="font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap;">${escape(message)}</div>
  `
  const text = `New message from your portfolio\n\nFrom: ${name} <${email}>\n\n${message}`
  return { subject, html: wrap(`From ${name}: ${message.slice(0, 80)}`, body), text }
}

export function acknowledgementEmail(args: { name: string; message: string }): Email {
  const { name, message } = args
  const fname = firstName(name)
  const greeting = fname ? `Thanks for reaching out, ${fname}` : 'Thanks for reaching out'
  const subject = greeting
  const body = `
    <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#1c1917;line-height:1.3;">${escape(greeting)}.</h1>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#1c1917;">I got your message and will get back to you within a couple of days. Replying to this email lands straight in my inbox if you need to add anything.</p>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#1c1917;">— Ibrahim</p>
    <div style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Your message</div>
    <div style="font-size:14px;line-height:1.6;color:#57534e;white-space:pre-wrap;background:#fafaf9;border-radius:10px;padding:14px 16px;">${escape(message)}</div>
  `
  const text = `${greeting}.\n\nI got your message and will get back to you within a couple of days. Replying to this email lands straight in my inbox if you need to add anything.\n\n— Ibrahim\n\n---\n\nYour message:\n${message}`
  return { subject, html: wrap(`I got your message — replying soon.`, body), text }
}

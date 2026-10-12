// Owner notifications. Uses SMTP when SMTP_HOST is set; otherwise writes each email to
// data/outbox/*.eml so nothing is lost during development.
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');
const { DATA_DIR } = require('./db');

const env = process.env;
const OUTBOX = path.join(DATA_DIR, 'outbox');

const transport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: env.SMTP_SECURE === 'true',
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function table(rows) {
  return `<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">${rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `<tr><td style="color:#6a6a6a;vertical-align:top">${esc(k)}</td><td style="color:#222"><b>${esc(v)}</b></td></tr>`)
    .join('')}</table>`;
}

async function send({ subject, text, html, replyTo }) {
  const msg = {
    from: env.MAIL_FROM || `${config.brand} Website <no-reply@${new URL(config.siteUrl).hostname}>`,
    to: config.ownerEmail,
    replyTo,
    subject,
    text,
    html,
  };
  try {
    const info = await transport.sendMail(msg);
    if (!env.SMTP_HOST) {
      fs.mkdirSync(OUTBOX, { recursive: true });
      const file = path.join(OUTBOX, `${Date.now()}-${subject.replace(/[^a-z0-9]+/gi, '-').slice(0, 60)}.eml`);
      fs.writeFileSync(file, info.message);
      console.log(`[mail] SMTP not configured — saved "${subject}" to ${path.relative(process.cwd(), file)}`);
    }
  } catch (err) {
    console.error('[mail] failed to send:', err.message);
  }
}

function money(n) {
  return '₹' + Math.round(n || 0).toLocaleString('en-IN');
}

function quoteEmail(q) {
  const lines = (q.items || []).map((i) => `${i.qty} × ${i.unit} — ${i.name} (${i.sizeLabel}${i.flavour ? ', ' + i.flavour : ''}) @ ${money(i.unitPrice)} = ${money(i.lineTotal)}`);
  const c = q.customer;
  const details = [
    ['Reference', q.ref], ['Source', q.source], ['Business', c.company], ['Contact', c.name], ['Phone', c.phone], ['Email', c.email],
    ['GSTIN', c.gstin], ['Event type', q.eventType], ['Delivery date', q.deliveryDate], ['Time slot', q.timeSlot],
    ['Area', q.area], ['Address', q.address], ['Guests', q.guests], ['Notes', q.notes],
    ['Estimated total', q.estimate ? money(q.estimate) + ' + GST & delivery' : ''], ['Logo file', q.logo ? q.logo.originalName : ''],
    ['Sample requested', q.sampleRequested ? 'Yes' : ''],
  ];
  const text = [`New ${q.source} enquiry ${q.ref}`, '', ...details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), '', 'Items:', ...lines, '', `Open in admin: ${config.siteUrl}/admin/quotes/${q.id}`].join('\n');
  const html = `<h2 style="font:600 20px Arial">New ${esc(q.source)} enquiry ${esc(q.ref)}</h2>${table(details)}
    ${lines.length ? `<h3 style="font:600 16px Arial">Items</h3><ul style="font:14px Arial">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    <p><a href="${config.siteUrl}/admin/quotes/${q.id}" style="background:#c0331a;color:#fff;padding:10px 18px;text-decoration:none;font:600 14px Arial">Open in admin</a></p>`;
  return send({ subject: `[${config.brand}] New quote ${q.ref} — ${c.company || c.name}${q.estimate ? ' — ' + money(q.estimate) : ''}`, text, html, replyTo: c.email });
}

function simpleEmail(subject, rows, replyTo) {
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  return send({ subject: `[${config.brand}] ${subject}`, text, html: `<h2 style="font:600 20px Arial">${esc(subject)}</h2>${table(rows)}`, replyTo });
}

module.exports = { quoteEmail, simpleEmail };

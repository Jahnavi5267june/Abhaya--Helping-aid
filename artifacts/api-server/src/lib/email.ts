import { Resend } from "resend";
import { logger } from "./logger.js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim()).filter(Boolean);
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "Abhaya Platform <notifications@abhaya.org>";
const SITE_URL = process.env.SITE_URL || "";

function getResend() {
  return new Resend(RESEND_API_KEY);
}

function isConfigured(): boolean {
  return Boolean(RESEND_API_KEY && ADMIN_EMAILS.length > 0);
}

export async function notifyNewDonation(data: {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorCity: string | null;
  donationType: string;
  amount: number | null;
  description: string | null;
  organizationName: string;
  paymentReference?: string | null;
}) {
  if (!isConfigured()) {
    logger.info("Email not configured — skipping donation notification");
    return;
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `New Donation Registered — ${data.donationType} from ${data.donorName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #b45309; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">💛 New Donation on Abhaya</h1>
          </div>
          <div style="background: #fef3c7; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #d97706;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold; width: 40%;">Donor Name</td><td style="padding: 8px 0;">${data.donorName}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Email</td><td style="padding: 8px 0;">${data.donorEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${data.donorPhone}</td></tr>
              ${data.donorCity ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">City</td><td style="padding: 8px 0;">${data.donorCity}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Donation Type</td><td style="padding: 8px 0; text-transform: capitalize;">${data.donationType}</td></tr>
              ${data.amount ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Amount</td><td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #065f46;">₹${data.amount.toLocaleString("en-IN")}</td></tr>` : ""}
              ${data.paymentReference ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">UPI Ref No.</td><td style="padding: 8px 0; font-family: monospace;">${data.paymentReference}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Organization</td><td style="padding: 8px 0;">${data.organizationName}</td></tr>
              ${data.description ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Note</td><td style="padding: 8px 0;">${data.description}</td></tr>` : ""}
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #d97706;">
              <a href="${SITE_URL}/admin" style="background: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">Abhaya — For the people of Andhra Pradesh</p>
        </div>
      `,
    });
    logger.info({ donorName: data.donorName }, "Donation notification sent to admins");
  } catch (err) {
    logger.error({ err }, "Failed to send donation notification email");
  }
}

export async function notifyNewHelpRequest(data: {
  name: string;
  phone: string;
  email: string | null;
  location: string;
  district: string | null;
  category: string;
  description: string;
  urgency: string;
}) {
  if (!isConfigured()) {
    logger.info("Email not configured — skipping help request notification");
    return;
  }

  const urgencyColor = data.urgency === "critical" || data.urgency === "high" ? "#dc2626" : data.urgency === "medium" ? "#d97706" : "#16a34a";
  const urgencyBg = data.urgency === "critical" || data.urgency === "high" ? "#fef2f2" : data.urgency === "medium" ? "#fef3c7" : "#f0fdf4";
  const urgencyBorder = data.urgency === "critical" || data.urgency === "high" ? "#ef4444" : data.urgency === "medium" ? "#f59e0b" : "#22c55e";
  const urgencyEmoji = data.urgency === "critical" ? "🚨" : data.urgency === "high" ? "⚠️" : "📋";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `${urgencyEmoji} Help Request — ${data.category.replace(/_/g, " ")} in ${data.district || data.location}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${urgencyColor}; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">${urgencyEmoji} Help Request on Abhaya</h1>
          </div>
          <div style="background: ${urgencyBg}; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid ${urgencyBorder};">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold; width: 40%;">Name</td><td style="padding: 8px 0;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${data.phone}</td></tr>
              ${data.email ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Location</td><td style="padding: 8px 0;">${data.location}</td></tr>
              ${data.district ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">District</td><td style="padding: 8px 0;">${data.district}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Category</td><td style="padding: 8px 0; text-transform: capitalize;">${data.category.replace(/_/g, " ")}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Urgency</td><td style="padding: 8px 0;"><span style="background: ${urgencyColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px; text-transform: capitalize;">${data.urgency}</span></td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Description</td><td style="padding: 8px 0;">${data.description}</td></tr>
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid ${urgencyBorder};">
              <a href="${SITE_URL}/admin" style="background: ${urgencyColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">Abhaya — For the people of Andhra Pradesh</p>
        </div>
      `,
    });
    logger.info({ name: data.name, urgency: data.urgency }, "Help request notification sent to admins");
  } catch (err) {
    logger.error({ err }, "Failed to send help request notification email");
  }
}

export async function notifyNewCommunityAlert(data: {
  title: string;
  description: string;
  category: string;
  location: string;
  district: string;
  urgency: string;
  reporterName: string;
  reporterPhone: string;
}) {
  if (!isConfigured()) {
    logger.info("Email not configured — skipping community alert notification");
    return;
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `🆘 Community Alert: ${data.title} — ${data.district}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">🆘 Community Alert on Abhaya</h1>
          </div>
          <div style="background: #f5f3ff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #8b5cf6;">
            <h2 style="margin: 0 0 16px; color: #5b21b6;">${data.title}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold; width: 40%;">Category</td><td style="padding: 8px 0; text-transform: capitalize;">${data.category.replace(/_/g, " ")}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Location</td><td style="padding: 8px 0;">${data.location}, ${data.district}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Urgency</td><td style="padding: 8px 0; text-transform: capitalize;">${data.urgency}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Description</td><td style="padding: 8px 0;">${data.description}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Reported By</td><td style="padding: 8px 0;">${data.reporterName} — ${data.reporterPhone}</td></tr>
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #8b5cf6;">
              <a href="${SITE_URL}/admin" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">Abhaya — For the people of Andhra Pradesh</p>
        </div>
      `,
    });
    logger.info({ title: data.title }, "Community alert notification sent to admins");
  } catch (err) {
    logger.error({ err }, "Failed to send community alert notification email");
  }
}

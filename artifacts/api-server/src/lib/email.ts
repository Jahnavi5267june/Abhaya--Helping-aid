import { Resend } from "resend";
import { logger } from "./logger.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "Abhaya Platform <notifications@abhaya.org>";

function getResend() {
  return new Resend(RESEND_API_KEY);
}

function isConfigured(): boolean {
  return Boolean(RESEND_API_KEY && ADMIN_EMAIL);
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
}) {
  if (!isConfigured()) {
    logger.info("Email not configured — skipping donation notification");
    return;
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Donation Registered — ${data.donationType} from ${data.donorName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #b45309; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">New Donation on Abhaya</h1>
          </div>
          <div style="background: #fef3c7; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #d97706;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold; width: 40%;">Donor Name</td><td style="padding: 8px 0;">${data.donorName}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Email</td><td style="padding: 8px 0;">${data.donorEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${data.donorPhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">City</td><td style="padding: 8px 0;">${data.donorCity}</td></tr>
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Donation Type</td><td style="padding: 8px 0; text-transform: capitalize;">${data.donationType}</td></tr>
              ${data.amount ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Amount</td><td style="padding: 8px 0;">₹${data.amount.toLocaleString("en-IN")}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Organization</td><td style="padding: 8px 0;">${data.organizationName}</td></tr>
              ${data.description ? `<tr><td style="padding: 8px 0; color: #78350f; font-weight: bold;">Description</td><td style="padding: 8px 0;">${data.description}</td></tr>` : ""}
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #d97706;">
              <a href="${process.env.SITE_URL || ""}/admin" style="background: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">Abhaya — For the people of Andhra Pradesh</p>
        </div>
      `,
    });
    logger.info({ donorName: data.donorName }, "Donation notification email sent");
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

  const urgencyColor = data.urgency === "high" ? "#dc2626" : data.urgency === "medium" ? "#d97706" : "#16a34a";
  const urgencyBg = data.urgency === "high" ? "#fef2f2" : data.urgency === "medium" ? "#fef3c7" : "#f0fdf4";
  const urgencyBorder = data.urgency === "high" ? "#ef4444" : data.urgency === "medium" ? "#f59e0b" : "#22c55e";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `${data.urgency === "high" ? "🚨 URGENT" : "New"} Help Request — ${data.category} in ${data.district}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${urgencyColor}; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">${data.urgency === "high" ? "🚨 Urgent " : ""}Help Request on Abhaya</h1>
          </div>
          <div style="background: ${urgencyBg}; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid ${urgencyBorder};">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold; width: 40%;">Name</td><td style="padding: 8px 0;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${data.phone}</td></tr>
              ${data.email ? `<tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Location</td><td style="padding: 8px 0;">${data.location}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">District</td><td style="padding: 8px 0;">${data.district}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Category</td><td style="padding: 8px 0; text-transform: capitalize;">${data.category.replace(/_/g, " ")}</td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Urgency</td><td style="padding: 8px 0;"><span style="background: ${urgencyColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px; text-transform: capitalize;">${data.urgency}</span></td></tr>
              <tr><td style="padding: 8px 0; color: #374151; font-weight: bold;">Description</td><td style="padding: 8px 0;">${data.description}</td></tr>
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid ${urgencyBorder};">
              <a href="${process.env.SITE_URL || ""}/admin" style="background: ${urgencyColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin Panel</a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">Abhaya — For the people of Andhra Pradesh</p>
        </div>
      `,
    });
    logger.info({ name: data.name, urgency: data.urgency }, "Help request notification email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send help request notification email");
  }
}

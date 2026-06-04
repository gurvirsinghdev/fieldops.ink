import "server-only";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN;

  if (!accountId || !apiToken) {
    return false;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: input.to,
        from: { address: "invites@fieldops.ink", name: "FieldOps" },
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

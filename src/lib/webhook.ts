export const sendWebhook = async (options: {
  content?: string;
  embeds?: Embed[];
}) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK;
  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });
  } catch (error) {
    console.error("Failed to send embed:", error);
  }
};

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { alertChannels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Bell, Mail, Webhook } from "lucide-react";
import { DiscordIcon } from "@/components/icons";
import { EmailAlertSettings } from "@/components/email-alert-settings";
import { DiscordAlertSettings } from "@/components/discord-alert-settings";
import { WebhookAlertSettings } from "@/components/webhook-alert-settings";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const channels = await db
    .select()
    .from(alertChannels)
    .where(eq(alertChannels.userId, session.user.id));

  const emailChannels = channels
    .filter((ch) => ch.type === "email")
    .map((ch) => ({
      id: ch.id,
      email: (ch.config as { email: string }).email,
      enabled: ch.enabled,
    }));

  const discordChannels = channels
    .filter((ch) => ch.type === "discord")
    .map((ch) => ({
      id: ch.id,
      webhookUrl: (ch.config as { webhookUrl: string }).webhookUrl,
      enabled: ch.enabled,
    }));

  const webhookChannels = channels
    .filter((ch) => ch.type === "webhook")
    .map((ch) => {
      const config = ch.config as { url: string; label?: string };
      return {
        id: ch.id,
        url: config.url,
        label: config.label,
        enabled: ch.enabled,
      };
    });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Notifications section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notifications
          </h2>
        </div>

        {/* Email */}
        <ChannelCard
          icon={<Mail className="h-4 w-4" />}
          name="Email"
          description="Receive reminder notifications in your inbox."
          count={emailChannels.length}
        >
          <EmailAlertSettings
            initialChannels={emailChannels}
          />
        </ChannelCard>

        {/* Discord */}
        <ChannelCard
          icon={<DiscordIcon className="h-4 w-4" />}
          name="Discord"
          description="Send reminder notifications to Discord via webhook."
          hint="Channel Settings &rarr; Integrations &rarr; Create Webhook."
          count={discordChannels.length}
        >
          <DiscordAlertSettings
            initialChannels={discordChannels}
          />
        </ChannelCard>

        {/* Custom Webhook */}
        <ChannelCard
          icon={<Webhook className="h-4 w-4" />}
          name="Custom Webhook"
          description="POST a JSON payload to any HTTP endpoint when reminders run."
          count={webhookChannels.length}
        >
          <WebhookAlertSettings
            initialChannels={webhookChannels}
          />
        </ChannelCard>
      </section>
    </div>
  );
}

function ChannelCard({
  icon,
  name,
  description,
  hint,
  count,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  hint?: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-none ring-border">
      <CardHeader className="flex flex-row items-start gap-3.5">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground"
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{name}</h3>
            {count > 0 && (
              <Badge variant="secondary">
                {count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
            {hint && (
              <span> {hint}</span>
            )}
          </p>
        </div>
      </CardHeader>

      {/* Divider */}
      <div className="mx-5 border-t border-border" />

      {/* Content */}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

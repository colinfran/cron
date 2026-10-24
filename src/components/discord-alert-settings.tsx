"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface DiscordChannel {
  id: string;
  webhookUrl: string;
  enabled: boolean;
}

export function DiscordAlertSettings({
  initialChannels,
}: {
  initialChannels: DiscordChannel[];
}) {
  const [channels, setChannels] = useState<DiscordChannel[]>(initialChannels);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!webhookUrl.trim()) return;

    setAdding(true);
    try {
      const res = await fetch("/api/alert-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "discord", webhookUrl: webhookUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add Discord webhook");
      }
      const channel = await res.json();
      setChannels((prev) => [
        ...prev,
        {
          id: channel.id,
          webhookUrl: (channel.config as { webhookUrl: string }).webhookUrl,
          enabled: channel.enabled,
        },
      ]);
      setWebhookUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string, currentEnabled: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/alert-channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === id ? { ...ch, enabled: !currentEnabled } : ch,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update alert channel");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/alert-channels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setChannels((prev) => prev.filter((ch) => ch.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update alert channel");
    } finally {
      setDeletingId(null);
    }
  }

  function maskUrl(url: string) {
    try {
      const parts = url.split("/");
      return `discord.com/.../.../${parts[parts.length - 1].slice(0, 6)}`;
    } catch {
      return "***";
    }
  }

  return (
    <div className="space-y-3">
      {channels.length > 0 && (
        <div className="divide-y divide-border/30">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-sm font-mono text-muted-foreground truncate">
                {maskUrl(channel.webhookUrl)}
              </span>
              <div className="flex items-center gap-2 shrink-0 pl-4">
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={() => handleToggle(channel.id, channel.enabled)}
                  disabled={togglingId === channel.id}
                  aria-label="Enable alert channel"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete alert channel"
                  onClick={() => handleDelete(channel.id)}
                  disabled={deletingId === channel.id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {deletingId === channel.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          aria-label="Discord webhook URL"
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
          value={webhookUrl}
          onChange={(e) => {
            setWebhookUrl(e.target.value);
            setError(null);
          }}
          className="flex-1 font-mono text-sm"
        />
        <Button type="submit" size="sm" disabled={adding || !webhookUrl.trim()}>
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus data-icon="inline-start" className="h-4 w-4" />
          )}
          {adding ? "Adding..." : "Add"}
        </Button>
      </form>

      {error && <p className="text-xs text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}

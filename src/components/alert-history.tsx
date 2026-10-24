"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Loader2,
} from "lucide-react";

interface Alert {
  id: string;
  status: "failed" | "timeout";
  jobName: string;
  errorMessage: string | null;
  responseCode: number | null;
  startedAt: string;
}

interface AlertHistoryProps {
  initialData: {
    alerts: Alert[];
    total: number;
    hasMore: boolean;
  };
}

export function AlertHistory({ initialData }: AlertHistoryProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialData.alerts);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/alerts?page=${nextPage}`);
      if (!res.ok) throw new Error("Failed to load alerts");

      const data = await res.json();
      setAlerts((prev) => [...prev, ...data.alerts]);
      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load alerts");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Failed runs
        </p>
        <p className="text-xs text-muted-foreground">{total} total</p>
      </div>

      <div className="divide-y divide-border/30 rounded-xl border border-border bg-card">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={loading}
            className="text-muted-foreground"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const timedOut = alert.status === "timeout";
  const StatusIcon = timedOut ? Clock : AlertTriangle;
  const label = timedOut ? "Timed out" : "Failed";
  const color = timedOut
    ? "text-amber-700 dark:text-amber-400"
    : "text-red-700 dark:text-red-400";
  const background = timedOut ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${background}`}
      >
        <StatusIcon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{alert.jobName}</p>
          <span className={`rounded-full px-1.5 py-px text-[10px] font-medium ${background} ${color}`}>
            {label}
          </span>
          {alert.responseCode !== null && (
            <span className="text-xs text-muted-foreground">
              HTTP {alert.responseCode}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {alert.errorMessage && (
            <p className="truncate text-xs text-muted-foreground">
              {alert.errorMessage}
            </p>
          )}
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTimestamp(alert.startedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

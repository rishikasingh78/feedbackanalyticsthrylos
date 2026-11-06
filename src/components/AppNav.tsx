import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import thrylosLogo from "@/assets/thrylos-logo-mark.png.asset.json";

const linkCls =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function AppNav() {
  const customerPage = useLocation({ select: (location) => location.pathname === "/feedback" });
  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/feedback" className="flex items-center gap-2.5">
          <img src={thrylosLogo.url} alt="Thrylos logo" className="h-9 w-9 rounded-lg object-cover" />
          <span className="leading-tight">
            <span className="block font-display text-base font-bold tracking-tight">Thrylos</span>
            <span className="hidden text-xs text-muted-foreground sm:block">Feedback & Review Analytics</span>
          </span>
        </Link>
        {customerPage && <Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/">Open Dashboard</Link></Button>}
        {!customerPage && <nav className="flex items-center gap-1">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-foreground" }}>
            <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/feedback" className={linkCls} activeProps={{ className: "bg-secondary text-foreground" }}>
            <MessageSquarePlus className="h-4 w-4" /> <span className="hidden sm:inline">Submit Feedback</span>
          </Link>
        </nav>}
      </div>
    </header>
  );
}

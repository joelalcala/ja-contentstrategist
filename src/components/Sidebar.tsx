import Link from "next/link";
import { Package2, Home, ShoppingCart, Package, Users2, LineChart, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Content Strategist</span>
        </Link>
        <NavItem href="/dashboard" icon={Home} label="Dashboard" />
        <NavItem href="/crawl" icon={ShoppingCart} label="Crawl" />
        <NavItem href="/audit" icon={Package} label="Audit" />
        <NavItem href="/sitemap" icon={Users2} label="Sitemap" />
        <NavItem href="/taxonomy" icon={LineChart} label="Taxonomy" />
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </nav>
    </aside>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}
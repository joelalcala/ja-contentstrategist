"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Nav() {
  const pathname = usePathname()

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-2 p-4">
        <Link href="/dashboard">
          <Button variant="ghost" className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === "/dashboard" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}>
            Dashboard
          </Button>
        </Link>
        <Link href="/projects">
          <Button variant="ghost" className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === "/projects" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}>
            Projects
          </Button>
        </Link>
        <Link href="/crawls">
          <Button variant="ghost" className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === "/crawls" ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}>
            Crawls
          </Button>
        </Link>
      </div>
    </ScrollArea>
  )
}


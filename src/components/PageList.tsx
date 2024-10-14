import { CrawlPage } from "@/lib/api/supabase/types"
import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface PageListProps {
  pages: CrawlPage[]
  selectedPage: CrawlPage | null
  onSelectPage: (page: CrawlPage) => void
}

export function PageList({ pages, selectedPage, onSelectPage }: PageListProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {pages.map((page) => (
        <PageListItem
          key={page.page_id}
          page={page}
          isSelected={selectedPage?.page_id === page.page_id}
          onClick={() => onSelectPage(page)}
        />
      ))}
    </div>
  )
}

interface PageListItemProps extends ComponentProps<"div"> {
  page: CrawlPage
  isSelected?: boolean
}

function PageListItem({ page, isSelected, ...props }: PageListItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
        isSelected && "bg-muted"
      )}
      {...props}
    >
      <div className="flex items-center">
        <div className="flex-1 truncate">
          <div className="font-semibold">{page.title || 'Untitled'}</div>
          <div className="text-xs text-muted-foreground">{page.url}</div>
        </div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {page.description || 'No description available'}
      </div>
    </div>
  )
}

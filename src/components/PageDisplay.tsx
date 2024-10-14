import { CrawlPage } from "@/lib/api/supabase/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PageDisplayProps {
  page: CrawlPage | null
}

export function PageDisplay({ page }: PageDisplayProps) {
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a page to view its details</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-8">
        <div>
          <h2 className="text-2xl font-bold">{page.title || 'Untitled'}</h2>
          <p className="text-sm text-muted-foreground">{page.url}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Content</h3>
          <div className="whitespace-pre-wrap text-sm">{page.body || 'No content available'}</div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Metadata</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="font-medium">Content Type:</dt>
            <dd>{page.content_type || 'N/A'}</dd>
            <dt className="font-medium">Language:</dt>
            <dd>{page.lang || 'N/A'}</dd>
            <dt className="font-medium">Description:</dt>
            <dd>{page.description || 'N/A'}</dd>
            <dt className="font-medium">Author:</dt>
            <dd>{page.author || 'N/A'}</dd>
            <dt className="font-medium">Publication Date:</dt>
            <dd>{page.publication_date || 'N/A'}</dd>
          </dl>
        </div>
      </div>
    </ScrollArea>
  )
}


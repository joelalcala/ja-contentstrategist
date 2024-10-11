'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApifyDatasetItem } from '@/lib/apifyClient';
import { CrawlResult } from '@/lib/types';

export default function PageDetailPage({ params }: { params: { domain: string; runId: string; pageId: string } }) {
  const [pageData, setPageData] = useState<CrawlResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const decodedPageUrl = decodeURIComponent(params.pageId);
        const data = await getApifyDatasetItem(params.runId, decodedPageUrl);
        if (data) {
          setPageData(data);
        } else {
          throw new Error('Page data not found');
        }
      } catch (err: any) {
        setError('Error fetching page data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [params.runId, params.pageId]);

  // ... (rest of the component)
}
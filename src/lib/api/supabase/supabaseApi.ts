import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CrawlRun, CrawlPage, Project } from '../../types';
import { ApiResponse } from '../types';

export class SupabaseApi {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  // Project-related methods
  async createProject(name: string): Promise<ApiResponse<Project>> {
    const { data, error } = await this.client
      .from('Project')
      .insert({ name })
      .single();

    return { data: data as Project | null, error: error?.message };
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    const { data, error } = await this.client
      .from('Project')
      .select('*')
      .eq('project_id', projectId)
      .single();

    return { data: data as Project | null, error: error?.message };
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    const { data, error } = await this.client
      .from('Project')
      .update(updates)
      .eq('project_id', projectId)
      .single();

    return { data: data as Project | null, error: error?.message };
  }

  async deleteProject(projectId: string): Promise<ApiResponse<null>> {
    const { error } = await this.client
      .from('Project')
      .delete()
      .eq('project_id', projectId);

    return { data: null, error: error?.message };
  }

  // Update existing methods to include project_id
  async createCrawlRun(crawlRun: CrawlRun): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .insert(crawlRun)
      .single();

    return { data: data as CrawlRun | null, error: error?.message };
  }

  async getCrawlRun(runId: string): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .select('*')
      .eq('run_id', runId)
      .single();

    return { data: data as CrawlRun | null, error: error?.message };
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .update(updates)
      .eq('run_id', runId)
      .single();

    return { data: data as CrawlRun | null, error: error?.message };
  }

  async insertCrawlPages(pages: CrawlPage[]): Promise<ApiResponse<CrawlPage[]>> {
    console.log("Received pages for insertion:", pages);

    const validPages = pages.map(page => ({
      ...page,
      publication_date: page.publication_date ? new Date(page.publication_date) : null,
      jsonLd: page.jsonLd || null,
      content_type: page.content_type || 'page',
    })).filter(page => page.url != null);

    console.log("Valid pages after filtering:", validPages);

    if (validPages.length === 0) {
      console.log("No valid pages to insert");
      return { data: [], error: null };
    }

    const { data, error } = await this.client
      .from('Crawl-Pages')
      .insert(validPages)
      .select();

    if (error) {
      console.error("Error inserting pages:", error);
    } else {
      console.log("Successfully inserted pages:", data);
    }

    return { data: data as CrawlPage[] | null, error: error?.message };
  }

  async getCrawlPages(runId: string, options?: {
    limit?: number;
    offset?: number;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<CrawlPage[]>> {
    let query = this.client
      .from('Crawl-Pages')
      .select('*')
      .eq('run_id', runId);

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (typeof value === 'string') {
          query = query.ilike(key, `%${value}%`);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 0) - 1);
    }

    const { data, error } = await query;

    return { data: data as CrawlPage[] | null, error: error?.message };
  }

  async getFilteredCrawlPages(filters: Record<string, any>): Promise<ApiResponse<CrawlPage[]>> {
    let query = this.client.from('Crawl-Pages').select('*');

    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'object' && value !== null) {
        const [operator, operand] = Object.entries(value)[0];
        switch (operator) {
          case 'eq': query = query.eq(key, operand as string); break;
          case 'neq': query = query.neq(key, operand as string); break;
          case 'gt': query = query.gt(key, operand as string); break;
          case 'gte': query = query.gte(key, operand as string); break;
          case 'lt': query = query.lt(key, operand as string); break;
          case 'lte': query = query.lte(key, operand as string); break;
          case 'like': query = query.like(key, operand as string); break;
          case 'ilike': query = query.ilike(key, operand as string); break;
          case 'is': query = query.is(key, operand as boolean | null); break;
          case 'in': query = query.in(key, operand as any[]); break;
          case 'contains': query = query.contains(key, operand as any); break;
          case 'containedBy': query = query.containedBy(key, operand as any); break;
        }
      } else {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;

    return { data: data as CrawlPage[] | null, error: error?.message };
  }

  async getProjects(): Promise<ApiResponse<Project[]>> {
    console.log('SupabaseApi: Fetching projects...');
    const { data, error } = await this.client
      .from('Project')
      .select('*')

    console.log('SupabaseApi: Raw response:', { data, error });
    console.log('SupabaseApi: Fetched data:', data);
    console.log('SupabaseApi: Error:', error);

    if (error) {
      console.error('SupabaseApi: Error fetching projects:', error);
    } else if (!data || data.length === 0) {
      console.warn('SupabaseApi: No projects found in the database');
    }

    return { data: data as Project[] | null, error: error?.message };
  }
}

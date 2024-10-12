# Project Overview

The goal of this project is to develop a web-based tool that allows users to crawl, audit, and categorize websites effectively. The tool will enable users to extract key information from websites, organize the data, and create sitemaps and taxonomies for better content management.

The project will use NextJS 14.2, shadcn, Tailwind CSS, Lucide Icons.

### Objectives:

- Facilitate the crawling and auditing of website content.
- Improve content discoverability and user engagement.
- Streamline the process for managing website structure and categorization.

# Core Functionalities

## 1. Crawl Screen
The crawl screen allows the user to enter the domain to crawl.
Path: /crawl
- There is a field for domain (textbox), scope (dropdown: subdomain or entire domain) and max number of pages to crawl (dropdown: 10,50,100,500, entire site).
- When the user submits the form, the page enters a loading state while the domain is submitted to Apify.
- We are using the Cheerio Scraper from Apify (apify/cheerio-scraper). The crawler extracts the page's: page path, title, description, OG metadata, JSON-LD, body.
- When the input is submitted to Apify, a run Id is returned and a dataset.
- Immediately upon receiving the run Id, we direct the user to the audit screen: "/audit/[domain]/[runId]"

#### Cheerio Scraper API documentation
```
import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: '<YOUR_API_TOKEN>',
});

// Prepare Actor input
const input = {
    "startUrls": [
        {
            "url": "https://crawlee.dev"
        }
    ],
    "keepUrlFragments": false,
    "globs": [
        {
            "glob": "https://crawlee.dev/*/*"
        }
    ],
    "pseudoUrls": [],
    "excludes": [
        {
            "glob": "/**/*.{png,jpg,jpeg,pdf}"
        }
    ],
    "linkSelector": "a[href]",
    "pageFunction": async function pageFunction(context) {
        const { $, request, log } = context;
    
        // The "$" property contains the Cheerio object which is useful
        // for querying DOM elements and extracting data from them.
        const pageTitle = $('title').first().text();
    
        // The "request" property contains various information about the web page loaded. 
        const url = request.url;
        
        // Use "log" object to print information to actor log.
        log.info('Page scraped', { url, pageTitle });
    
        // Return an object with the data extracted from the page.
        // It will be stored to the resulting dataset.
        return {
            url,
            pageTitle
        };
    },
    "proxyConfiguration": {
        "useApifyProxy": true
    },
    "proxyRotation": "RECOMMENDED",
    "initialCookies": [],
    "additionalMimeTypes": [],
    "forceResponseEncoding": false,
    "ignoreSslErrors": false,
    "preNavigationHooks": `// We need to return array of (possibly async) functions here.
        // The functions accept two arguments: the "crawlingContext" object
        // and "requestAsBrowserOptions" which are passed to the `requestAsBrowser()`
        // function the crawler calls to navigate..
        [
            async (crawlingContext, requestAsBrowserOptions) => {
                // ...
            }
        ]`,
    "postNavigationHooks": `// We need to return array of (possibly async) functions here.
        // The functions accept a single argument: the "crawlingContext" object.
        [
            async (crawlingContext) => {
                // ...
            },
        ]`,
    "maxRequestRetries": 3,
    "maxPagesPerCrawl": 0,
    "maxResultsPerCrawl": 0,
    "maxCrawlingDepth": 0,
    "maxConcurrency": 50,
    "pageLoadTimeoutSecs": 60,
    "pageFunctionTimeoutSecs": 60,
    "debugLog": false,
    "customData": {}
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("YrQuEkowkNCLdk4j2").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item);
    });
})();
```


## 2. Audit Screen
The audit screen displays the crawl status (total pages crawled vs to be crawled), lists the pages crawled with key information, allows the user to filter pages crawled, allows user to tag pages and allows the user to click into a page detail.
Path: /audit/[domain]/[runId]
- As the user is directed to the audit page the run Id, domain, dataset and other information is synced with the Crawl-Run Supabase table. 
- The crawl screen has three areas:
  - **Aside panel containing:**:
    - Site tree that represents paths on the site crawled. Each path has the number of pages under that particular path. When the user clicks on a path it filters the page table.
    - Crawl information in a progress bar that shows the number of pages crawled vs pages in the queue. It also shows the status of the crawl. If SUCCEEDED, then the status disappears. If the crawl FAILED, then the user has the option of resurrecting the crawl. Additional metadata about the crawl is also shown here.
  - **Main panel containing**
    - Breadcrumbs showing "Audit > [Domain] > [Run Id]".
    - Search box allowing the user to search for pages by typing keywords. There is a delay before the search results are shown in the data table.
    - Filtering functionality that allows users to filter by title, path, content type, status and custom fields. Setting a filter shows filter chips that the users can use to remove filters. The filters narrow down the results in the data table.
    - Content type tabs that allow users to toggle between content types. Content types represent the OG metadata or JSON-LD @type information. Clicking on one of the options filters the data table.
    - Data table that shows the results from the Apify run. The table includes rows for Title, URL, Page type and Status. 
      - The user has the option of adding, removing and rearranging columns on the data table. 
      - The data table supports pagination. 
      - The data table allows users to select all or individual page rows. Upon selection, the options to bulk update pages is shown. The user can bulk update the status of a page and apply custom fields.
      - When a user clicks on a page row, they are directed to the page detail screen: /audit/[domain]/[runId]/[pageId]

**Supabase insert multiple rows:**
``
const { data, error } = await supabase
  .from('Crawl-Pages')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
``
**Supabase update rows:**
``
const { data, error } = await supabase
  .from('Crawl-Pages')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
``        
**Supabase filtering:**
``

let { data: Crawl-Pages, error } = await supabase
  .from('Crawl-Pages')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])
``

**Supabase Crawl-Pages schema**
```
create table
  public."Crawl-Pages" (
    url text not null,
    created_at timestamp with time zone not null default now(),
    title text null,
    content_type text null,
    body text null,
    custom_fields json null,
    page_id uuid not null default gen_random_uuid (),
    run_id text not null default gen_random_uuid (),
    constraint Crawl - Pages_pkey primary key (page_id)
  ) tablespace pg_default;
```
**Supabase Crawl-Run schema**
```
create table
  public."Crawl-Run" (
    created_at timestamp with time zone not null default now(),
    domain text null,
    type text null,
    max_page_count smallint null default '100'::smallint,
    run_id text not null,
    dataset_id text null,
    status text null,
    constraint Crawl - Run_pkey primary key (run_id),
    constraint Crawl - Run_apify_key unique (run_id),
    constraint Crawl - Run_dataset_id_key unique (dataset_id)
  ) tablespace pg_default;
  ```

**Supabase Documentation:**
https://supabase.com/docs/reference/javascript/installing

**Apify Dataset Documentation**
dataset.getData([options])
Returns DatasetContent object holding the items in the dataset based on the provided parameters.

If you need to get data in an unparsed format, use the Apify.newClient() function to get a new apify-client instance and call datasetClient.downloadItems()

Parameters:

[options]: Object - All getData() parameters are passed via an options object with the following keys:
[offset]: number = 0 - Number of array elements that should be skipped at the start.
[limit]: number = 250000 - Maximum number of array elements to return.
[desc]: boolean = false - If true then the objects are sorted by createdAt in descending order. Otherwise they are sorted in ascending order.
[fields]: Array<string> - An array of field names that will be included in the result. If omitted, all fields are included in the results.
[unwind]: string - Specifies a name of the field in the result objects that will be used to unwind the resulting objects. By default, the results are returned as they are.
[clean]: boolean = false - If true then the function returns only non-empty items and skips hidden fields (i.e. fields starting with # character). Note that the clean parameter is a shortcut for skipHidden: true and skipEmpty: true options.
[skipHidden]: boolean = false - If true then the function doesn't return hidden fields (fields starting with "#" character).
[skipEmpty]: boolean = false - If true then the function doesn't return empty items. Note that in this case the returned number of items might be lower than limit parameter and pagination must be done using the limit value.
Returns:

Promise<DatasetContent>

## 3. Page detail
Path: /audit/[domain]/[runId]/[pageId]
- The page detail screen shows information captured from the page.
- The screen has a commen section where user's can leave comment on a particular page. When comments are posted, they are listed with a time stamp.
- The user is able to make selections on the page detail screen, like the status field. 
- The user is able to also add new fields. When a new field is added, it is added globally to the "project" so it appears on all other page detail screens on the run.
- The page has breadcrumbs that allows the user to go back the the audit screen.
- The user can also assign a page to an item in the Site Map screen.

## 4. Site Map Screen
Path: /map/[mapId]
- Create a new sitemap or select an existing one 
- The sitemap is a sortable, hierarchical tree that allows users to drag each item around to create the site hierarchy.
- The user is able to select a page type for the sitemap.
- Some items in the sitemap represent groups of pages (like sets of articles).
- The user is able to add more detail to a Site Map item by clicking on the sitemap tree item.

``
/* eslint-disable react/no-multi-comp */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DndProvider, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SortableTreeWithoutDndContext as SortableTree } from '../src';
// In your own app, you would need to use import styles once in the app
// import 'react-sortable-tree/styles.css';

// -------------------------
// Create an drop target component that can receive the nodes
// https://react-dnd.github.io/react-dnd/docs-drop-target.html
// -------------------------
// This type must be assigned to the tree via the `dndType` prop as well
const trashAreaType = 'yourNodeType';
const trashAreaSpec = {
  // The endDrag handler on the tree source will use some of the properties of
  // the source, like node, treeIndex, and path to determine where it was before.
  // The treeId must be changed, or it interprets it as dropping within itself.
  drop: (props, monitor) => ({ ...monitor.getItem(), treeId: 'trash' }),
};
const trashAreaCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

// The component will sit around the tree component and catch
// nodes dragged out
class trashAreaBaseComponent extends Component {
  render() {
    const { connectDropTarget, children, isOver } = this.props;

    return connectDropTarget(
      <div
        style={{
          height: '100vh',
          padding: 50,
          background: isOver ? 'pink' : 'transparent',
        }}
      >
        {children}
      </div>
    );
  }
}
trashAreaBaseComponent.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  isOver: PropTypes.bool.isRequired,
};
const TrashAreaComponent = DropTarget(
  trashAreaType,
  trashAreaSpec,
  trashAreaCollect
)(trashAreaBaseComponent);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [
        { title: '1' },
        { title: '2' },
        { title: '3' },
        { title: '4', expanded: true, children: [{ title: '5' }] },
      ],
    };
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <TrashAreaComponent>
            <div style={{ height: 250 }}>
              <SortableTree
                treeData={this.state.treeData}
                onChange={treeData => this.setState({ treeData })}
                dndType={trashAreaType}
              />
            </div>
          </TrashAreaComponent>
        </div>
      </DndProvider>
    );
  }
}

export default App;

``

## 5. Site Map Item
Path: /map/[mapId]/[mapItemId] 
- The Site map item contains the name of the sitemap item.
- The user can add more details to the sitemap item, like a description.
- The user can also comment on the sitemap item.

## 6. Taxonomy Screen

- Displays all keywords (taxonomy terms).
- Group terms and view associated pages.

## 7. User Account Management

- Log in, manage multiple sites, request crawls, manage team members.
- Notifications for tagged comments.


## 8. Data Export and Import

- Export data in the table.
- Import XLSX or CSV files with key metrics.



# Project Folder Structure

``
project-root/
├── .env.local                 # Environment variables (API keys, database URLs)
├── .gitignore                 # Specifies files to be ignored by Git
├── package.json               # Project dependencies and scripts
├── next.config.js             # NextJS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration for Tailwind
├── tsconfig.json              # TypeScript configuration
├── public/                    # Static assets served directly by NextJS
│   └── ...                    
├── src/
│   ├── app/                   # NextJS 14 app router structure
│   │   ├── layout.tsx         # Root layout component for the entire app
│   │   ├── page.tsx           # Home page component
│   │   ├── crawl/
│   │   │   └── page.tsx       # Crawl screen component
│   │   ├── audit/
│   │   │   ├── [domain]/
│   │   │   │   ├── [runId]/
│   │   │   │   │   ├── page.tsx           # Audit screen component
│   │   │   │   │   └── [pageId]/
│   │   │   │   │       └── page.tsx       # Page detail screen component
│   │   ├── map/
│   │   │   ├── [mapId]/
│   │   │   │   ├── page.tsx               # Site Map screen component
│   │   │   │   └── [mapItemId]/
│   │   │   │       └── page.tsx           # Site Map Item screen component
│   │   ├── taxonomy/
│   │   │   └── page.tsx       # Taxonomy screen component
│   │   ├── account/
│   │   │   └── page.tsx       # User Account Management component
│   │   └── export-import/
│   │       └── page.tsx       # Data Export and Import component
│   ├── components/
│   │   ├── ui/                # shadcn components (reusable UI components)
│   │   │   ├── button.tsx     # Custom button component
│   │   │   ├── input.tsx      # Custom input component
│   │   │   └── ...
│   │   ├── crawl/
│   │   │   ├── CrawlForm.tsx  # Form component for initiating a crawl
│   │   │   └── ...
│   │   ├── audit/
│   │   │   ├── AuditTable.tsx # Table component for displaying audit results
│   │   │   ├── SiteTree.tsx   # Tree component for site structure
│   │   │   └── ...
│   │   ├── sitemap/
│   │   │   ├── SiteMapTree.tsx # Tree component for sitemap
│   │   │   └── ...
│   │   └── ...
│   ├── lib/
│   │   ├── api/
│   │   │   ├── types.ts       # Common API types
│   │   │   ├── apify/
│   │   │   │   ├── types.ts   # Apify-specific types
│   │   │   │   └── apifyApi.ts # Apify API integration class
│   │   │   ├── supabase/
│   │   │   │   ├── types.ts   # Supabase-specific types
│   │   │   │   └── supabaseApi.ts # Supabase API integration class
│   │   │   └── index.ts       # API module exports
│   │   └── utils.ts           # General utility functions
│   ├── hooks/
│   │   ├── useApifyCrawl.ts   # Custom hook for managing Apify crawls
│   │   ├── useSupabase.ts     # Custom hook for Supabase operations
│   │   └── ...
│   ├── types/
│   │   ├── crawl.ts           # TypeScript types for crawl-related data
│   │   ├── audit.ts           # TypeScript types for audit-related data
│   │   └── ...
│   └── styles/
│       └── globals.css        # Global styles and Tailwind directives
└── README.md                  # Project documentation and setup instructions
``




**API Integration approach:**
``
// src/lib/api/types.ts
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

// src/lib/api/apify/types.ts
import { ActorRunInput } from 'apify-client';

export interface ApifyCrawlInput extends ActorRunInput {
  startUrls: { url: string }[];
  keepUrlFragments: boolean;
  globs: { glob: string }[];
  pseudoUrls: any[];
  excludes: { glob: string }[];
  linkSelector: string;
  pageFunction: string;
  proxyConfiguration: { useApifyProxy: boolean };
  proxyRotation: string;
  initialCookies: any[];
  additionalMimeTypes: any[];
  forceResponseEncoding: boolean;
  ignoreSslErrors: boolean;
  preNavigationHooks: string;
  postNavigationHooks: string;
  maxRequestRetries: number;
  maxPagesPerCrawl: number;
  maxResultsPerCrawl: number;
  maxCrawlingDepth: number;
  maxConcurrency: number;
  pageLoadTimeoutSecs: number;
  pageFunctionTimeoutSecs: number;
  debugLog: boolean;
  customData: any;
}

export interface ApifyCrawlResult {
  id: string;
  actId: string;
  actorId: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  statusMessage: string | null;
  progress: {
    isDone: boolean;
    // Add other progress properties as needed
  };
  // Add other properties as needed
}

// src/lib/api/apify/apifyApi.ts
import { ApifyClient } from 'apify-client';
import { ApifyCrawlInput, ApifyCrawlResult } from './types';
import { ApiResponse } from '../types';

export class ApifyApi {
  private client: ApifyClient;

  constructor() {
    this.client = new ApifyClient({
      token: process.env.APIFY_API_KEY,
    });
  }

  async startCrawl(input: ApifyCrawlInput): Promise<ApiResponse<ApifyCrawlResult>> {
    try {
      const run = await this.client.actor("YrQuEkowkNCLdk4j2").call(input);
      return { data: run };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  async getCrawlStatus(runId: string): Promise<ApiResponse<ApifyCrawlResult>> {
    try {
      const run = await this.client.run(runId).get();
      return { data: run };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  async getCrawlResults(datasetId: string): Promise<ApiResponse<any[]>> {
    try {
      const { items } = await this.client.dataset(datasetId).listItems();
      return { data: items };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

// src/lib/api/supabase/types.ts
export interface CrawlRun {
  created_at?: string;
  domain: string;
  type?: string;
  max_page_count?: number;
  run_id: string;
  dataset_id?: string;
  status?: string;
}

export interface CrawlPage {
  url: string;
  created_at?: string;
  title?: string;
  content_type?: string;
  body?: string;
  custom_fields?: Record<string, any>;
  page_id?: string;
  run_id: string;
}

// src/lib/api/supabase/supabaseApi.ts
import { createClient, SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js';
import { CrawlRun, CrawlPage } from './types';
import { ApiResponse } from '../types';

export class SupabaseApi {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Crawl-Run operations
  async createCrawlRun(crawlRun: CrawlRun): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .insert(crawlRun)
      .single();

    return { data, error: error?.message };
  }

  async getCrawlRun(runId: string): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .select('*')
      .eq('run_id', runId)
      .single();

    return { data, error: error?.message };
  }

  async updateCrawlRun(runId: string, updates: Partial<CrawlRun>): Promise<ApiResponse<CrawlRun>> {
    const { data, error } = await this.client
      .from('Crawl-Run')
      .update(updates)
      .eq('run_id', runId)
      .single();

    return { data, error: error?.message };
  }

  // Crawl-Pages operations
  async insertCrawlPages(pages: CrawlPage[]): Promise<ApiResponse<CrawlPage[]>> {
    const { data, error } = await this.client
      .from('Crawl-Pages')
      .insert(pages)
      .select();

    return { data, error: error?.message };
  }

  async updateCrawlPages(runId: string, updates: Partial<CrawlPage>): Promise<ApiResponse<CrawlPage[]>> {
    const { data, error } = await this.client
      .from('Crawl-Pages')
      .update(updates)
      .eq('run_id', runId)
      .select();

    return { data, error: error?.message };
  }

  async getCrawlPages(runId: string, options?: {
    limit?: number;
    offset?: number;
    filters?: Record<string, any>;
  }): Promise<ApiResponse<CrawlPage[]>> {
    let query: PostgrestFilterBuilder<any, any, any> = this.client
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

    return { data, error: error?.message };
  }

  // Advanced filtering example
  async getFilteredCrawlPages(filters: Record<string, any>): Promise<ApiResponse<CrawlPage[]>> {
    let query = this.client.from('Crawl-Pages').select('*');

    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'object' && value !== null) {
        const [operator, operand] = Object.entries(value)[0];
        switch (operator) {
          case 'eq': query = query.eq(key, operand); break;
          case 'neq': query = query.neq(key, operand); break;
          case 'gt': query = query.gt(key, operand); break;
          case 'gte': query = query.gte(key, operand); break;
          case 'lt': query = query.lt(key, operand); break;
          case 'lte': query = query.lte(key, operand); break;
          case 'like': query = query.like(key, operand); break;
          case 'ilike': query = query.ilike(key, operand); break;
          case 'is': query = query.is(key, operand); break;
          case 'in': query = query.in(key, operand); break;
          case 'contains': query = query.contains(key, operand); break;
          case 'containedBy': query = query.containedBy(key, operand); break;
        }
      } else {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;

    return { data, error: error?.message };
  }
}

// src/lib/api/index.ts
export { ApifyApi } from './apify/apifyApi';
export { SupabaseApi } from './supabase/supabaseApi';

// Usage example
import { ApifyApi, SupabaseApi } from '@/lib/api';

const apifyApi = new ApifyApi();
const supabaseApi = new SupabaseApi();

(async () => {
  // Start a crawl with Apify
  const crawlInput: ApifyCrawlInput = {
    startUrls: [{ url: "https://example.com" }],
    keepUrlFragments: false,
    globs: [{ glob: "https://example.com/*" }],
    pseudoUrls: [],
    excludes: [{ glob: "/**/*.{png,jpg,jpeg,pdf}" }],
    linkSelector: "a[href]",
    pageFunction: `async function pageFunction(context) {
      const { $, request, log } = context;
      const pageTitle = $('title').first().text();
      const url = request.url;
      log.info('Page scraped', { url, pageTitle });
      return { url, pageTitle };
    }`,
    proxyConfiguration: { useApifyProxy: true },
    proxyRotation: "RECOMMENDED",
    maxRequestRetries: 3,
    maxPagesPerCrawl: 100,
    maxConcurrency: 10,
  };

  const { data: crawlResult, error: crawlError } = await apifyApi.startCrawl(crawlInput);

  if (crawlError) {
    console.error('Crawl error:', crawlError);
  } else if (crawlResult) {
    // Create a Crawl-Run entry in Supabase
    const { data: crawlRun, error: dbError } = await supabaseApi.createCrawlRun({
      run_id: crawlResult.id,
      domain: "example.com",
      status: crawlResult.status,
      dataset_id: crawlResult.defaultDatasetId,
    });

    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      console.log('Crawl run created:', crawlRun);

      // Get crawl results from Apify
      const { data: crawlPages, error: resultsError } = await apifyApi.getCrawlResults(crawlResult.defaultDatasetId);

      if (resultsError) {
        console.error('Error fetching crawl results:', resultsError);
      } else if (crawlPages) {
        // Insert crawl pages into Supabase
        const { data: insertedPages, error: insertError } = await supabaseApi.insertCrawlPages(
          crawlPages.map(page => ({
            url: page.url,
            title: page.pageTitle,
            run_id: crawlResult.id,
          }))
        );

        if (insertError) {
          console.error('Error inserting pages:', insertError);
        } else {
          console.log('Inserted pages:', insertedPages);

          // Example of filtering pages
          const { data: filteredPages, error: filterError } = await supabaseApi.getFilteredCrawlPages({
            run_id: crawlResult.id,
            title: { ilike: '%example%' },
          });

          if (filterError) {
            console.error('Error filtering pages:', filterError);
          } else {
            console.log('Filtered pages:', filteredPages);
          }
        }
      }
    }
  }
})();
``
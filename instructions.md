# Project Overview

The goal of this project is to develop a web-based tool that allows users to crawl, audit, and categorize websites effectively. The tool will enable users to extract key information from websites, organize the data, and create sitemaps and taxonomies for better content management.

The project will use NextJS 14.2, shadcn, Tailwind CSS, Lucide Icons.

### Objectives:

- Facilitate the crawling and auditing of website content.
- Improve content discoverability and user engagement.
- Streamline the process for managing website structure and categorization.

# Core Functionalities

### 1. Crawl Screen

- Users provide a domain to crawl (entire domain/subdomain, set page limit: 100, 500, Entire site).
- Extracts key info: page path, title, description, OG metadata, JSON-LD, body content (using Readability).
- Uses OpenAI API to suggest taxonomy terms.
- Displays crawl progress.

*User Story:* As a content manager, I want to crawl a website and extract key information, so I can categorize and audit the content.

### 2. Audit Screen

- Lists all pages, allowing filtering by content type, path, and custom filters.
- Three panels:
  - **Left**: Crawl progress, site settings, file tree (section paths only).
  - **Center**: Data table (sortable, filterable, add/remove/drag columns, bulk updates, search).
  - **Right**: Detailed page info (customizable fields, comments, tags, iframe preview).

```
```

### 3. Site Map Screen

- Create a new sitemap and map pages using drag-and-drop.
- Group pages, assign sections, set slugs, auto-generate sitemap.
- AI suggests new sitemap structures.

*User Story:* As a content manager, I want to create a new sitemap and map pages to it, so I can organize the website structure.

### 4. Taxonomy Screen

- Displays all keywords (taxonomy terms).
- Group terms and view associated pages.

*User Story:* As a digital marketer, I want to see and manage the taxonomy terms on the site, so I can improve content categorization.

### 5. User Account Management

- Log in, manage multiple sites, request crawls, manage team members.
- Notifications for tagged comments.

*User Story:* As a user, I want to manage multiple sites and team members, so I can collaborate effectively.

### 6. Data Export and Import

- Export data in the table.
- Import XLSX or CSV files with key metrics.

*User Story:* As a website administrator, I want to import and export data, so I can analyze and share website metrics.

# Documentation

#### Crawlee

**Library**: `@crawlee/playwright`

**Installation**:

```
npm install @crawlee/playwright
```

**Basic Example**:

```javascript
import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ page, request, enqueueLinks }) => {
    console.log(`Processing: ${request.url}`);
    await page.waitForSelector('.collection-block-item');
    await enqueueLinks({ selector: '.collection-block-item', label: 'CATEGORY' });
  },
});

await crawler.run(['https://example.com']);
```

#### Readability

**Library**: `@mozilla/readability`

**Installation**:

```
npm install @mozilla/readability
```

**Basic Example**:

```javascript
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<body>Example content</body>`, { url: 'https://www.example.com' });
const reader = new Readability(dom.window.document);
const article = reader.parse();
console.log(article.title);
```

#### React Sortable Tree

**Library**: `react-sortable-tree`

**Installation**:

```
npm install react-sortable-tree
```

**Basic Example**:

```javascript
import React, { Component } from 'react';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

export default class Tree extends Component {
  state = { treeData: [ { title: 'Chicken', children: [{ title: 'Egg' }] }, { title: 'Fish', children: [{ title: 'Fingerline' }] } ] };
  render() {
    return (
      <div style={{ height: 400 }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={(treeData) => this.setState({ treeData })}
        />
      </div>
    );
  }
}
```

# File Structure

```
   project-root/
   ├── src/
   │   ├── app/                     # New Next.js app directory
   │   │   ├── page.tsx             # Entry point for the homepage
   │   │   ├── layout.tsx           # Layout component for consistent styling
   │   │   ├── crawl/               # Crawl screen and related components
   │   │   │   └── page.tsx         # Crawl screen page
   │   │   ├── audit/               # Audit screen and related components
   │   │   │   └── page.tsx         # Audit screen page
   │   │   ├── sitemap/             # Sitemap screen and related components
   │   │   │   └── page.tsx         # Sitemap screen page
   │   │   ├── taxonomy/            # Taxonomy screen and related components
   │   │   │   └── page.tsx         # Taxonomy screen page
   │   ├── components/              # Reusable UI components
   │   │   ├── Crawl/
   │   │   │   └── CrawlScreen.js   # Crawl screen component
   │   │   ├── Audit/
   │   │   ├── Sitemap/
   │   │   ├── Taxonomy/
   │   ├── styles/                  # Global and component-specific styles
   │   ├── utils/                   # Utility functions and helpers
   │   ├── hooks/                   # Custom React hooks
   │   ├── services/                # API service calls and integrations
   ├── public/                      # Static files (images, fonts, etc.)
   ├── .gitignore                   # Git ignore file
   ├── instructions.md              # Project instructions and documentation
   ├── package.json                 # Project metadata and dependencies
   └── (other config files) 
```
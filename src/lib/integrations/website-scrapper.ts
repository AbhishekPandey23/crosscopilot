import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebsiteScraperService {
  async scrapeWebsite(url: string): Promise<FetchedDocument> {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header').remove();

    // Extract main content
    const mainContent = $(
      'main, article, .content, #content, .main, #main',
    ).first();
    const content =
      mainContent.length > 0 ? mainContent.text() : $('body').text();

    // Clean up whitespace
    const cleanedContent = content.replace(/\s+/g, ' ').trim();

    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';

    return {
      title,
      content: cleanedContent,
      fileName: title,
      fileType: 'website',
      url,
    };
  }

  async scrapeMultiplePages(urls: string[]): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];

    for (const url of urls) {
      try {
        const doc = await this.scrapeWebsite(url);
        documents.push(doc);
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return documents;
  }
}

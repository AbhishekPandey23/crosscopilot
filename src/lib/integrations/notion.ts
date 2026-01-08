import { Client } from '@notionhq/client';

interface NotionCredentials {
  accessToken: string;
}

export class NotionService {
  private notion: Client;

  constructor(credentials: NotionCredentials) {
    this.notion = new Client({
      auth: credentials.accessToken,
    });
  }

  async fetchPages(): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];

    // Search for all pages
    const response = await this.notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
    });

    for (const page of response.results) {
      if (page.object !== 'page') continue;

      try {
        const content = await this.getPageContent(page.id);
        const title = this.getPageTitle(page);

        documents.push({
          title,
          content,
          fileName: title,
          fileType: 'notion-page',
          url: (page as any).url || '',
        });
      } catch (error) {
        console.error(`Error fetching Notion page ${page.id}:`, error);
      }
    }

    return documents;
  }

  private async getPageContent(pageId: string): Promise<string> {
    const blocks = await this.notion.blocks.children.list({
      block_id: pageId,
    });

    let content = '';

    for (const block of blocks.results) {
      content += this.extractTextFromBlock(block as any) + '\n';
    }

    return content;
  }

  private extractTextFromBlock(block: any): string {
    let text = '';

    switch (block.type) {
      case 'paragraph':
        text = this.extractRichText(block.paragraph.rich_text);
        break;
      case 'heading_1':
        text = '# ' + this.extractRichText(block.heading_1.rich_text);
        break;
      case 'heading_2':
        text = '## ' + this.extractRichText(block.heading_2.rich_text);
        break;
      case 'heading_3':
        text = '### ' + this.extractRichText(block.heading_3.rich_text);
        break;
      case 'bulleted_list_item':
        text = '• ' + this.extractRichText(block.bulleted_list_item.rich_text);
        break;
      case 'numbered_list_item':
        text = '1. ' + this.extractRichText(block.numbered_list_item.rich_text);
        break;
      case 'code':
        text = '```\n' + this.extractRichText(block.code.rich_text) + '\n```';
        break;
      case 'quote':
        text = '> ' + this.extractRichText(block.quote.rich_text);
        break;
      default:
        if (block[block.type]?.rich_text) {
          text = this.extractRichText(block[block.type].rich_text);
        }
    }

    return text;
  }

  private extractRichText(richText: any[]): string {
    return richText.map((t) => t.plain_text).join('');
  }

  private getPageTitle(page: any): string {
    try {
      if (page.properties?.title?.title) {
        return page.properties.title.title
          .map((t: any) => t.plain_text)
          .join('');
      }
      if (page.properties?.Name?.title) {
        return page.properties.Name.title
          .map((t: any) => t.plain_text)
          .join('');
      }
    } catch (error) {
      // Fallback to page ID
    }
    return page.id;
  }
}

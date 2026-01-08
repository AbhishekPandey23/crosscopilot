import { google } from 'googleapis';

interface GoogleDriveCredentials {
  accessToken: string;
  refreshToken: string;
  expiryDate?: number;
}

export interface FetchedDocument {
  title: string;
  content: string;
  fileName: string;
  fileType: string;
  url: string;
}

export class GoogleDriveService {
  private drive: any;
  private docs: any;

  constructor(credentials: GoogleDriveCredentials) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiryDate,
    });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    this.docs = google.docs({ version: 'v1', auth: oauth2Client });
  }

  async fetchDocuments(): Promise<FetchedDocument[]> {
    const documents: FetchedDocument[] = [];

    // List all files (with filters for documents)
    const response = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' or mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      fields: 'files(id, name, mimeType, webViewLink)',
      pageSize: 100,
    });

    const files = response.data.files || [];

    for (const file of files) {
      try {
        let content = '';

        if (file.mimeType === 'application/vnd.google-apps.document') {
          // Fetch Google Doc content
          const doc = await this.docs.documents.get({
            documentId: file.id,
          });

          content = this.extractTextFromGoogleDoc(doc.data);
        } else {
          // Export other file types as text
          const exportResponse = await this.drive.files.export({
            fileId: file.id,
            mimeType: 'text/plain',
          });

          content = exportResponse.data;
        }

        documents.push({
          title: file.name || 'Untitled',
          content,
          fileName: file.name || 'untitled',
          fileType: file.mimeType || 'unknown',
          url: file.webViewLink || '',
        });
      } catch (error) {
        console.error(`Error fetching document ${file.name}:`, error);
      }
    }

    return documents;
  }

  private extractTextFromGoogleDoc(doc: any): string {
    const content = doc.body?.content || [];
    let text = '';

    const processElement = (element: any) => {
      if (element.paragraph) {
        const paragraph = element.paragraph;
        if (paragraph.elements) {
          paragraph.elements.forEach((elem: any) => {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          });
        }
      } else if (element.table) {
        element.table.tableRows?.forEach((row: any) => {
          row.tableCells?.forEach((cell: any) => {
            cell.content?.forEach((cellElement: any) => {
              processElement(cellElement);
            });
          });
        });
      }
    };

    content.forEach((element: any) => processElement(element));
    return text;
  }
}

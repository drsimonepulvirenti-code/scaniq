export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }

  static async scrapeUrl(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Firecrawl error:', error);
        return { success: false, error: `Failed to fetch website: ${response.status}` };
      }

      const data = await response.json();
      
      if (!data.success) {
        return { success: false, error: data.error || 'Scrape failed' };
      }

      return { 
        success: true, 
        data: {
          markdown: data.data?.markdown || '',
          metadata: data.data?.metadata || {},
        }
      };
    } catch (error) {
      console.error('Firecrawl service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch website' 
      };
    }
  }
}

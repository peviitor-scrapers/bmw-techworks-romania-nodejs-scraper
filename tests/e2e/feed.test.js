import fetch from 'node-fetch';
import scraperConfig from '../../scraper/config/scraper.js';

describe('E2E: live JSON feed', () => {
  it('serves a JSON Feed with job items on the careers host', async () => {
    const res = await fetch(scraperConfig.sources.feed, {
      headers: { 'User-Agent': scraperConfig.userAgent, Accept: 'application/json' }
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
    for (const it of data.items) {
      expect(it.url.startsWith(scraperConfig.ownJobUrlPrefix)).toBe(true);
      expect(it.title).toBeTruthy();
    }
  }, 30000);

  it('scrapeFeed returns well-formed jobs', async () => {
    const { scrapeFeed } = await import('../../scraper/index.js');
    const jobs = await scrapeFeed();
    expect(jobs.length).toBeGreaterThan(0);
    for (const j of jobs) {
      expect(j.url).toMatch(/^https:\/\//);
      expect(j.location.length).toBeGreaterThan(0);
    }
  }, 30000);
});

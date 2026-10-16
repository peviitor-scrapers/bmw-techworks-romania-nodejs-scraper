import { jest } from '@jest/globals';

describe('JSON feed source', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../scraper/index.js');
  });

  const item = {
    id: '8528985',
    title: 'Industrial Automation & Embedded Systems Engineer',
    url: 'https://careers.bmwtechworks.ro/jobs/8528985-industrial-automation-embedded-systems-engineer',
    content_html: '<p>Firmware and C++ for automotive control units.</p>',
    _jobposting: {
      '@type': 'JobPosting',
      jobLocation: [{ address: { addressLocality: 'Cluj-Napoca', addressCountry: 'RO' } }]
    }
  };

  it('takes the location from the JobPosting block and the configured workmode', () => {
    const job = index.feedItemToJob(item);
    expect(job.url).toBe(item.url);
    expect(job.title).toBe('Industrial Automation & Embedded Systems Engineer');
    expect(job.location).toEqual(['Cluj-Napoca']);
    expect(job.workmode).toBe('hybrid');
  });

  it('deduplicates repeated cities across several job locations', () => {
    const job = index.feedItemToJob({
      ...item,
      _jobposting: { jobLocation: [
        { address: { addressLocality: 'Cluj-Napoca' } },
        { address: { addressLocality: 'Cluj-Napoca' } }
      ] }
    });
    expect(job.location).toEqual(['Cluj-Napoca']);
  });

  it('falls back to the default location when the item has no JobPosting block', () => {
    const job = index.feedItemToJob({ title: 'Tester', url: 'https://careers.bmwtechworks.ro/jobs/1-tester' });
    expect(job.location).toEqual(['Cluj-Napoca']);
  });

  it('derives tags from the title and description', () => {
    const tags = index.extractFeedTags('Senior Java Developer', 'Spring and Kubernetes');
    expect(tags).toEqual(expect.arrayContaining(['java', 'it', 'senior', 'devops']));
  });

  it('returns no tags for an unrelated title', () => {
    expect(index.extractFeedTags('Office Assistant', '')).toEqual([]);
  });
});

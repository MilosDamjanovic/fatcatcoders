import { chromium, Browser, Page } from 'playwright';

describe('Angular app homepage', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false, slowMo: 1000 });
    page = await browser.newPage();
  });

  it('Should display the correct page title', async () => {
    await page.goto('http://localhost:4200');
    expect(await page.title()).toBe('TimeTrackingDashboard');
  });

  afterAll(async () => {
    await browser.close();
  });
});

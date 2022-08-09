import countObjects from '../helpers/count-objects';

describe('Ids Button e2e Tests', () => {
  const url = 'http://localhost:4444/ids-button/example.html';

  beforeEach(async () => {
    await page.goto(url, { waitUntil: ['networkidle2', 'load'] });
    // await page.waitForTimeout(2000);
  });

  it('should not have errors', async () => {
    await expect(page.title()).resolves.toMatch('IDS Button Component');
  });

  it('should pass Axe accessibility tests', async () => {
    await page.setBypassCSP(true);
    await page.goto(url, { waitUntil: ['networkidle2', 'load'] });
    await (expect(page) as any).toPassAxeTests();
  });

  it('should not have memory leaks', async () => {
    const numberOfObjects = await countObjects(page);
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', `<ids-button id="test" type="primary" icon="settings">My Button</ids-button>`);
      document.querySelector('#test')?.remove();
    });
    expect(await countObjects(page)).toEqual(numberOfObjects);
  });

  it('should be able to createElement', async () => {
    let hasError = false;
    try {
      await page.evaluate(() => {
        document.createElement('ids-button');
      });
    } catch (err) {
      hasError = true;
    }
    await expect(hasError).toEqual(false);
  });

  it('should be able to set attributes before append', async () => {
    let hasError = false;
    try {
      await page.evaluate(() => {
        const elem: any = document.createElement('ids-button');
        elem.type = 'primary';
        document.body.appendChild(elem);
      });
    } catch (err) {
      hasError = true;
    }
    await expect(hasError).toEqual(false);
  });

  it('should be able to set attributes after append', async () => {
    let hasError = false;
    try {
      await page.evaluate(() => {
        const elem: any = document.createElement('ids-button');
        document.body.appendChild(elem);
        elem.type = 'primary';
      });
    } catch (err) {
      hasError = true;
    }
    await expect(hasError).toEqual(false);
  });

  it('should be able to set attributes after insertAdjacentHTML', async () => {
    let hasError = false;
    try {
      await page.evaluate(() => {
        document.body.insertAdjacentHTML('beforeend', `<ids-button id="test"></ids-button>`);
        const elem: any = document.querySelector('#test');
        elem.type = 'primary';
      });
    } catch (err) {
      hasError = true;
    }

    const value = await page.evaluate('document.querySelector("#test").getAttribute("type")');
    await expect(value).toEqual('primary');
    await expect(hasError).toEqual(false);
  });
});

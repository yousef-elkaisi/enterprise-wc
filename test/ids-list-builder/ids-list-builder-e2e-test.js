describe('Ids List Builder e2e Tests', () => {
  const url = 'http://localhost:4444/ids-list-builder';

  beforeAll(async () => {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });
  });

  it('should not have errors', async () => {
    await expect(page.title()).resolves.toMatch('IDS List Builder Component');
  });

  it('should pass Axe accessibility tests', async () => {
    await page.setBypassCSP(true);
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });
    await expect(page).toPassAxeTests();
  });

  it('can drag list items up and down', async () => {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });

    const jsPathListItemFirst = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("div > div.content > ids-virtual-scroll > div > div > ids-draggable:nth-child(1) > div")`;
    const jsPathListItemFourth = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("div > div.content > ids-virtual-scroll > div > div > ids-draggable:nth-child(4) > div")`;
    const firstLi = await (await page.evaluateHandle(jsPathListItemFirst)).asElement();
    const fourthLi = await (await page.evaluateHandle(jsPathListItemFourth)).asElement();
    const firstLiBox = await firstLi.boundingBox();
    const fourthLiBox = await fourthLi.boundingBox();

    const midWidth = firstLiBox.x + firstLiBox.width / 2;

    // drag item from top towards bottom
    await page.mouse.move(midWidth, firstLiBox.y + firstLiBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(midWidth, fourthLiBox.y + (fourthLiBox.height * 2));
    await page.mouse.up();

    // drag item from bottom towards up
    await page.mouse.move(midWidth, fourthLiBox.y + (fourthLiBox.height * 2));
    await page.mouse.down();
    await page.mouse.move(midWidth, firstLiBox.y + firstLiBox.height / 2);
    await page.mouse.move(midWidth, fourthLiBox.y + (fourthLiBox.height * 2));
    await page.mouse.up();

    await fourthLi.click();
    page.keyboard.press('Enter'); // edit an existing value
  });

  it('can click the toolbar buttons', async () => {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });

    const jsPathToolbarButtonEdit = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("#button-edit").shadowRoot.querySelector("button")`;
    const jsPathToolbarButtonAdd = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("#button-add").shadowRoot.querySelector("button")`;
    const jsPathToolbarButtonUp = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("#button-up").shadowRoot.querySelector("button")`;
    const jsPathToolbarButtonDown = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("#button-down").shadowRoot.querySelector("button")`;
    const jsPathToolbarButtonDelete = `document.querySelector("body > ids-container > ids-layout-grid.ids-layout-grid-gap-md.ids-layout-grid-cols > ids-layout-grid-cell > ids-list-builder").shadowRoot.querySelector("#button-delete").shadowRoot.querySelector("button")`;

    const editButton = await (await page.evaluateHandle(jsPathToolbarButtonEdit)).asElement();
    const addButton = await (await page.evaluateHandle(jsPathToolbarButtonAdd)).asElement();
    const upButton = await (await page.evaluateHandle(jsPathToolbarButtonUp)).asElement();
    const downButton = await (await page.evaluateHandle(jsPathToolbarButtonDown)).asElement();
    const deleteButton = await (await page.evaluateHandle(jsPathToolbarButtonDelete)).asElement();

    await addButton.click();
    await addButton.click();

    await editButton.click();
    await upButton.click();
    await downButton.click();
    await deleteButton.click();

    await addButton.click();
    await deleteButton.click();
  });

  it('can edit, select, and delete through keyboard', async () => {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });

    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');
    page.keyboard.press('Tab');

    page.keyboard.press('Space'); // select list item
    page.keyboard.press('Enter'); // this should edit the first list item
    page.keyboard.press('Enter'); // unfocus editor
    page.keyboard.press('Tab'); // move to next list item
    page.keyboard.press('Space'); // select the list item

    // random button to trigger default keyboard case
    page.keyboard.press('Shift');
  });
});

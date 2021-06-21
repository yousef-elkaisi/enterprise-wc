/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line
import processAnimFrame from '../helpers/process-anim-frame';
import IdsInput from '../../src/ids-input/ids-input';
import IdsPager, {
  IdsPagerInput,
  IdsPagerButton,
  IdsPagerNumberList
} from '../../src/ids-pager';

const HTMLSnippets = {
  NAV_BUTTONS_AND_INPUT: (
    `<ids-pager page-size="20" page-number="10" total="200">
      <ids-pager-section>
        <ids-pager-button first></ids-pager-button>
        <ids-pager-button previous></ids-pager-button>
        <ids-pager-input></ids-pager-input>
        <ids-pager-button next></ids-pager-button>
        <ids-pager-button last></ids-pager-button>
      </ids-pager-section>
    </ids-pager>`
  ),
  NUMBER_LIST_NAV: (
  `<ids-pager page-size="20" page-number="10" total="150">
      <ids-pager-section>
        <ids-pager-button previous></ids-pager-button>
        <ids-pager-number-list></ids-pager-number-list>
        <ids-pager-button next></ids-pager-button>
      </ids-pager-section>
  </ids-pager>`
  ),
  RIGHT_ALIGNED_CONTENT: (
    `<ids-pager page-size="20" page-number="10" total="150">
      <ids-pager-section>
        <ids-pager-button previous></ids-pager-button>
        <ids-pager-number-list></ids-pager-number-list>
        <ids-pager-button next></ids-pager-button>
      </ids-pager-section>
      <ids-pager-section>
        Right-Aligned Content
      </ids-pager-section>
    </ids-pager>`
  ),
  DOUBLE_SIDED_CONTENT: (
    `<ids-pager page-size="20" page-number="10" total="150">
      <ids-pager-section>
        Left-Aligned-Content
      </ids-pager-section>
      <ids-pager-section>
        <ids-pager-button previous></ids-pager-button>
        <ids-pager-number-list></ids-pager-number-list>
        <ids-pager-button next></ids-pager-button>
      </ids-pager-section>
      <ids-pager-section>
        Right-Aligned-Content
      </ids-pager-section>
    </ids-pager>`
  )
};

describe('IdsPager Component', () => {
  let elem;

  const createElemViaTemplate = async (innerHTML) => {
    elem?.remove?.();

    const template = document.createElement('template');
    template.innerHTML = innerHTML;
    elem = template.content.childNodes[0];
    document.body.appendChild(elem);

    await processAnimFrame();

    return elem;
  };

  afterEach(async () => {
    elem?.remove();
  });

  it('renders from HTML Template with nav buttons with no errors', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);

    const errors = jest.spyOn(global.console, 'error');
    expect(document.querySelectorAll('ids-pager').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders from HTML Template with number list navigation with no errors', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NUMBER_LIST_NAV);

    const errors = jest.spyOn(global.console, 'error');
    expect(document.querySelectorAll('ids-pager').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders with content on both sides with no errors', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.DOUBLE_SIDED_CONTENT);

    const errors = jest.spyOn(global.console, 'error');
    expect(document.querySelectorAll('ids-pager').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders with content on right side with no errors', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.RIGHT_ALIGNED_CONTENT);

    const errors = jest.spyOn(global.console, 'error');
    expect(document.querySelectorAll('ids-pager').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('updates the input on ids-pager-input and pager pageNumber updates', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);
    const idsPagerInput = elem.querySelector('ids-pager-input');
    idsPagerInput.input.value = '10';
    await processAnimFrame();
    idsPagerInput.input.dispatchEvent(new Event('change', { bubbles: true }));
    await processAnimFrame();

    expect(elem.pageNumber).toEqual(10);
  });

  it('sets the pager page-number to non numeric and pagerNumber gets reset to 1', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);
    elem.setAttribute('page-number', 'z35');
    await processAnimFrame();
    await processAnimFrame();

    expect(elem.pageNumber).toEqual(1);
  });

  it('sets the pager page-number above max and pagerNumber gets set to pageCount', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);
    elem.setAttribute('page-number', '100');
    expect(elem.pageNumber).toEqual(10);
  });

  it('creates a pager and toggles the last button attribute predictably', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);
    const lastNavButton = elem.querySelector('ids-pager-button[last]');
    lastNavButton.setAttribute('disabled', true);
    expect(lastNavButton.disabled).toEqual(true);

    lastNavButton.disabled = false;
    expect(lastNavButton.hasAttribute('disabled')).toEqual(false);
  });

  it('creates a pager and the "type" of each of its nav button when accessed is based on their flag attrib', async () => {
    elem = await createElemViaTemplate(HTMLSnippets.NAV_BUTTONS_AND_INPUT);
    const navButtons = elem.querySelectorAll('ids-pager-button');
    navButtons.forEach((idsPagerButton) => {
      expect(idsPagerButton.type).not.toBeFalsy();
      expect(idsPagerButton.hasAttribute(idsPagerButton.type)).not.toBeFalsy();
    });
  });

  it('creates a an ids-pager-button with "first" flag set and nav-disabled works reliably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" first></ids-pager-button>'
    );
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
    expect(elem.navDisabled).toEqual(true);
    elem.setAttribute('page-number', 5);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeFalsy();
    expect(elem.navDisabled).toEqual(false);
    elem.setAttribute('page-number', 1);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
  });

  it('can set parent-disabled on ids-pager-button predictably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" parent-disabled></ids-pager-button>'
    );
    expect(elem.parentDisabled).toEqual(true);

    elem.setAttribute('parent-disabled', false);
    expect(elem.parentDisabled).toEqual(false);

    elem.setAttribute('parent-disabled', true);
    expect(elem.parentDisabled).toEqual(true);

    elem.parentDisabled = false;
    expect(elem.parentDisabled).toEqual(false);

    elem.parentDisabled = true;
    expect(elem.parentDisabled).toEqual(true);
  });

  it('sets pageNumber to NaN on ids-pager-button and pageNumber resets to 1', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="z" page-size="10" total="100" parent-disabled></ids-pager-button>'
    );
    expect(elem.pageNumber).toEqual(1);
  });

  it('can set the pageSize on ids-pager-button predictably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" parent-disabled></ids-pager-button>'
    );

    elem.setAttribute('page-size', '11');
    expect(elem.pageSize).toEqual(11);

    elem.setAttribute('page-size', 'z100');
    expect(elem.pageSize).toEqual(1);
  });

  it('creates a an ids-pager-button with "previous" flag set and nav-disabled works reliably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" previous></ids-pager-button>'
    );
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
    elem.setAttribute('page-number', 5);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeFalsy();
    elem.setAttribute('page-number', 1);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
  });

  it('creates a an ids-pager-button with "next" flag set and nav-disabled works reliably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="10" page-size="10" total="100" next></ids-pager-button>'
    );
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
    elem.setAttribute('page-number', 5);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeFalsy();
    elem.setAttribute('page-number', 10);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
  });

  it('creates a an ids-pager-button with "last" flag set and nav-disabled works reliably', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="10" page-size="10" total="100" last></ids-pager-button>'
    );
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
    elem.setAttribute('page-number', 5);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeFalsy();
    elem.setAttribute('page-number', 10);
    await processAnimFrame();
    expect(elem.hasAttribute('nav-disabled')).toBeTruthy();
  });

  it('creates ids-pager-buttons and clicking causes no issues reliably', async () => {
    let pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="3" page-size="10" total="100" first></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(1);

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="2" page-size="10" total="100" previous></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(1);

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" next></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(1);

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" last></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(1);

    // clicking first or previous with page-number==1
    // should not dispatch

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" first></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" previous></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);

    // clicking next or last with page-number=={{last_page}}
    // should not dispatch

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="10" page-size="10" total="100" next></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);

    pageNumberChangeListener = jest.fn();
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="10" page-size="10" total="100" last></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);

    // clicking a disabled button should not
    // dispatch events

    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="3" page-size="10" total="100" first disabled></ids-pager-button>'
    );
    elem.addEventListener('pagenumberchange', pageNumberChangeListener);
    elem.button.dispatchEvent(new Event('click'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);
  });

  it('creates a "first" ids-pager-button, then changes the type to "previous" with no issues', async () => {
    elem = await createElemViaTemplate(
      '<ids-pager-button page-number="1" page-size="10" total="100" next></ids-pager-button>'
    );
    elem.setAttribute('previous', '');
    expect(elem.hasAttribute('previous')).toBeTruthy();
  });

  it('creates a number-list and has the correct number of entries based on page size and total', async () => {
    const pageSize = 10;
    const total = 100;

    elem = await createElemViaTemplate(
      `<ids-pager-number-list page-number="10" page-size="${pageSize}" total="${total}" last></ids-pager-number-list>`
    );

    const pageCount = Math.floor(total / pageSize);
    const pageNumberButtons = elem.shadowRoot.querySelectorAll('ids-button');

    expect(pageNumberButtons.length).toEqual(pageCount);
  });

  it('creates a pager input and pageSize can be set and read predictably', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" last></ids-pager-input>`
    );

    expect(elem.pageSize).toEqual(2);

    elem.pageSize = '20';
    expect(elem.pageSize).toEqual(20);
  });

  it('creates a pager input and disabled can be set and read predictably', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first></ids-pager-input>`
    );

    expect(elem.disabled).toEqual(false);
    expect(elem.hasAttribute('disabled')).toEqual(false);

    elem.disabled = true;
    expect(elem.disabled).toEqual(true);
    expect(elem.hasAttribute('disabled')).toEqual(true);

    elem.disabled = false;
    expect(elem.disabled).toEqual(false);
    expect(elem.hasAttribute('disabled')).toEqual(false);

    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first disabled></ids-pager-input>`
    );

    expect(elem.disabled).toEqual(true);
  });

  it('creates a pager input and parent-disabled can be set and read predictably', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first></ids-pager-input>`
    );

    expect(elem.parentDisabled).toEqual(false);
    expect(elem.hasAttribute('parent-disabled')).toEqual(false);

    elem.parentDisabled = true;
    expect(elem.parentDisabled).toEqual(true);
    expect(elem.hasAttribute('parent-disabled')).toEqual(true);

    elem.parentDisabled = false;
    expect(elem.parentDisabled).toEqual(false);
    expect(elem.hasAttribute('parent-disabled')).toEqual(false);
  });

  /*
  TODO: figure out why Enter key isn't firing; will take another crack while PR is initially
  reviewed
  or see if there's an easy/obvious answer on Monday
  it('fires a change event on ids-pager-input when user presses Enter while focusing on it',
  async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first></ids-pager-input>`
    );

    const inputChangeListener = jest.fn();
    elem.addEventListener('change', inputChangeListener);

    elem.input.input.value = '20';
    elem.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await processAnimFrame();
    expect(inputChangeListener).toBeCalledTimes(1);
  });
  */

  it('creates a disabled ids-pager-button and parent-disabled can be set and read predictably', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-button page-number="10" page-size="2" total="100" disabled></ids-pager-button>`
    );

    expect(elem.disabled).toEqual(true);
  });

  it('registers an pagenumberchange event predictably on ids-pager-input changes', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first></ids-pager-input>`
    );

    let pageNumberChangeListener = jest.fn();

    elem.addEventListener('pagenumberchange', pageNumberChangeListener);

    elem.input.input.value = 20;
    elem.input.dispatchEvent(new Event('change'));
    expect(pageNumberChangeListener).toBeCalledTimes(1);

    pageNumberChangeListener = jest.fn();
    elem.input.input.value = 'z22';
    elem.input.dispatchEvent(new Event('change'));
    expect(pageNumberChangeListener).toBeCalledTimes(0);
  });

  it('creates an ids-pager-input and before value is assigned to total, has null calculated pageCount', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" first></ids-pager-input>`
    );

    expect(elem.pageCount).toEqual(null);
  });

  it('sets total on ids-pager-input to non-numeric value and gets page-number reset to 1', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="10" page-size="2" total="100" first></ids-pager-input>`
    );

    elem.pageSize = 'z22';

    expect(elem.pageSize).toEqual(1);
  });

  it('sets pageNumber on ids-pager-input to non-numeric value and gets page-number reset to 1', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="1" page-size="2" total="100" first></ids-pager-input>`
    );

    elem.pageNumber = 'z22';
    expect(elem.pageNumber).toEqual(1);
  });

  it('sets total on ids-pager-input to invalid values and gets reset to 1', async () => {
    elem = await createElemViaTemplate(
      `<ids-pager-input page-number="1" page-size="2" total="100" first></ids-pager-input>`
    );

    elem.total = 'z22';
    expect(elem.total).toEqual(1);

    elem.total = 0;
    expect(elem.total).toEqual(1);
  });
});

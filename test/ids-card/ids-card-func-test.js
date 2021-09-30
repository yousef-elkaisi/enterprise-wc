/**
 * @jest-environment jsdom
 */
import IdsCard from '../../src/components/ids-card/ids-card';

describe('IdsCard Component', () => {
  let card;

  beforeEach(async () => {
    const elem = new IdsCard();
    elem.innerHTML = `<div slot="card-header">
            <ids-text font-size="20" type="h2">Card Title Two</ids-text>
          </div>
          <div slot="card-content">
          </div>`;
    document.body.appendChild(elem);
    card = document.querySelector('ids-card');
  });

  afterEach(async () => {
    document.body.innerHTML = '';
  });

  it('renders with no errors', () => {
    const errors = jest.spyOn(global.console, 'error');
    const elem = new IdsCard();
    document.body.appendChild(elem);
    elem.remove();
    expect(document.querySelectorAll('ids-card').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders correctly', () => {
    expect(card.outerHTML).toMatchSnapshot();
  });

  it('renders auto-height from an attribute', () => {
    card.setAttribute('auto-height', 'true');
    expect(card.getAttribute('auto-height')).toEqual('true');
    expect(card.container.classList.contains('ids-card-auto-height')).toEqual(true);
  });

  it('renders auto-fit from an attribute', () => {
    card.setAttribute('auto-fit', 'true');
    expect(card.autoFit).toEqual('true');
    expect(card.getAttribute('auto-fit')).toEqual('true');
    expect(card.container.classList.contains('ids-card-auto-fit')).toEqual(true);
    card.setAttribute('auto-fit', 'false');
    expect(card.autoFit).toEqual(null);
    expect(card.getAttribute('auto-fit')).toEqual(null);
    expect(card.container.classList.contains('ids-card-auto-fit')).toEqual(false);
  });

  it('renders success color from the api', () => {
    card.autoHeight = true;
    expect(card.getAttribute('auto-height')).toEqual('true');
    expect(card.autoHeight).toEqual('true');
  });

  it('removes the clickable attribute when reset', () => {
    card.autoHeight = true;
    expect(card.getAttribute('auto-height')).toEqual('true');

    card.autoHeight = false;
    expect(card.getAttribute('auto-height')).toEqual(null);
    expect(card.autoHeight).toEqual(null);
  });

  it('supports setting mode', () => {
    card.mode = 'dark';
    expect(card.container.getAttribute('mode')).toEqual('dark');
  });

  it('supports setting version', () => {
    card.version = 'classic';
    expect(card.container.getAttribute('version')).toEqual('classic');
  });
});

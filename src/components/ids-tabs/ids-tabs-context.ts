import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';

import Base from './ids-tabs-context-base';
import IdsTab from './ids-tab';
import './ids-tab-content';

import styles from './ids-tabs.scss';

/**
 * IDS Tabs Context Component
 * @type {IdsTabsContext}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @part container - the container of all tabs
 */
@customElement('ids-tabs-context')
@scss(styles)
export default class IdsTabsContext extends Base {
  constructor() {
    super();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [attributes.VALUE];
  }

  template() {
    return '<slot></slot>';
  }

  connectedCallback() {
    super.connectedCallback?.();

    this.onEvent('tabselect', this, (e: { stopPropagation: () => void; target: { value: any; onAction?: CallableFunction }; }) => {
      e.stopPropagation();

      // Don't try to change the content pane if the
      // selected tab has an `onAction` function attached
      if (typeof e.target.onAction === 'function') {
        return;
      }

      this.value = e.target.value;
    });

    // child Tab "click" event fires
    const handleTabClick = (tab: IdsTab) => {
      if (tab.actionable && typeof tab.onAction === 'function') {
        tab.onAction(tab.selected);
        return;
      }

      if (!tab.selected) {
        tab.selected = true;
      }
    };

    this.onEvent('click', this, (e: PointerEvent) => {
      const elem: any = e.target;
      if (elem && elem.tagName === 'IDS-TAB') {
        e.stopPropagation();
        handleTabClick(elem);
      }
    });

    this.onEvent('focus', this, (e: FocusEvent) => {
      const elem: any = e.target;
      if (!elem.selected) {
        elem.selected = true;
      }
      elem.focus();
    });
  }

  /** @param {string} value The value representing a currently selected tab */
  set value(value: string) {
    const currentValue = this.getAttribute(attributes.VALUE);
    if (currentValue !== value) {
      this.setAttribute(attributes.VALUE, value);
      this.#changeContentPane(currentValue, value);
    }
  }

  get value() {
    return this.getAttribute(attributes.VALUE);
  }

  /**
   * Switches the "Active" content pane associated with this Tabs Context
   * @param {string} currentValue the value of the current pane, used to make it inactive
   * @param {string} newValue the value of the new pane, used to make it active
   */
  #changeContentPane(currentValue: any, newValue: any) {
    const contentPanes = [...this.querySelectorAll('ids-tab-content')];
    const currentPane = contentPanes.find((el) => el.value === currentValue);
    const targetPane = contentPanes.find((el) => el.value === newValue);
    if (currentPane) currentPane.active = false;
    if (targetPane) targetPane.active = true;
  }
}

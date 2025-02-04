import { customElement, scss } from '../../core/ids-decorators';
import { htmlAttributes } from '../../core/ids-attributes';

import IdsEventsMixin from '../../mixins/ids-events-mixin/ids-events-mixin';
import IdsElement from '../../core/ids-element';

import styles from './ids-menu-header.scss';

/**
 * IDS Menu Header Component
 * @type {IdsMenuHeader}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @part header - the menu header element
 */
@customElement('ids-menu-header')
@scss(styles)
export default class IdsMenuHeader extends IdsEventsMixin(IdsElement) {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute(htmlAttributes.ROLE, 'none');
    if (this.menu) this.decorateForIcon((this.menu as any).hasIcons);
  }

  static get attributes() {
    return [
      ...super.attributes
    ];
  }

  /**
   * @readonly
   * @returns {HTMLElement} the `IdsMenu` or `IdsPopupMenu` parent node.
   */
  get menu() {
    return this.parentElement;
  }

  template() {
    return `<div class="ids-menu-header" part="header" role="none"><slot></slot></div>`;
  }

  decorateForIcon(doShow: boolean) {
    this.container?.classList[doShow ? 'add' : 'remove']('align-for-icons');
  }
}

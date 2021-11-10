import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import IdsModal from '../ids-modal/ids-modal';
import IdsIcon from '../ids-icon/ids-icon';
import { MESSAGE_STATUSES } from './ids-message-attributes';
import styles from './ids-message.scss';

/**
 * IDS Message Component
 * @type {IdsMessage}
 * @inherits IdsModal
 * @part popup - the popup outer element
 * @part overlay - the inner overlay element
 */
@customElement('ids-message')
@scss(styles)
export default class IdsMessage extends IdsModal {
  constructor() {
    super();

    if (!this.state) {
      this.state = {};
    }
    this.state.message = '';
    this.state.status = MESSAGE_STATUSES[0];
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.MESSAGE,
      attributes.STATUS
    ];
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    super.connectedCallback();

    // Update status and correct
    this.status = this.getAttribute(attributes.STATUS);

    // Sanitizes the HTML in the component
    const currentContentEl = this.querySelector('*:not([slot])');
    if (currentContentEl) {
      this.message = currentContentEl.innerHTML;
    }
  }

  /**
   * Used for ARIA Labels and other content
   * @readonly
   * @returns {string} concatenating the status and title together.
   */
  get ariaLabelContent() {
    const status = this.status !== 'none' ? `${this.status}: ` : '';
    return `${status}${this.messageTitle}`;
  }

  /**
   * @returns {string} the current contents of the messsage
   */
  get message() {
    return this.state.message;
  }

  /**
   * @param {string} val the desired contents of the message element
   */
  set message(val) {
    const sanitizedVal = this.xssSanitize(val);
    if (sanitizedVal !== this.state.message) {
      this.#refreshMessage(sanitizedVal);
    }
  }

  /**
   * Refreshes the state of the Message's Content
   * @param {string} content the new message content element
   */
  #refreshMessage(content) {
    let messageEl = this.querySelector('*:not([slot])');
    if (!messageEl) {
      messageEl = document.createElement('div');
      this.appendChild(messageEl);
    } else {
      messageEl.innerHTML = '';
    }

    // Replace the message content
    messageEl.insertAdjacentHTML('afterbegin', content);
    this.state.message = content;
  }

  /**
   * @returns {string} the message's current status type
   */
  get status() {
    return this.state.status;
  }

  /**
   * @param {string} val the message's new status type
   */
  set status(val) {
    let realStatusValue = MESSAGE_STATUSES[0];
    if (MESSAGE_STATUSES.includes(val)) {
      realStatusValue = val;
    }

    const currentValue = this.state.status;
    if (realStatusValue !== currentValue) {
      this.state.status = realStatusValue;

      if (typeof val === 'string' && val.length && realStatusValue !== MESSAGE_STATUSES[0]) {
        this.setAttribute(attributes.STATUS, realStatusValue);
      } else {
        this.removeAttribute(attributes.STATUS);
      }

      this.#refreshStatus(realStatusValue);
      this.refreshAriaLabel();
    }
  }

  /**
   * @param {string} val the value of the status icon
   * @returns {void}
   */
  #refreshStatus(val) {
    const header = this.container.querySelector('.ids-modal-header');
    let icon = header.querySelector('ids-icon');
    if (val && val !== MESSAGE_STATUSES[0]) {
      if (!icon) {
        header.insertAdjacentHTML('afterbegin', `<ids-icon slot="icon" icon="${val}" class="ids-icon ids-message-status"></ids-icon>`);
        icon = header.querySelector('ids-icon');
      }
      icon.icon = val;
      this.#setIconColor(icon, val);
    } else {
      icon?.remove();
    }
  }

  /**
   * Changes the color of the Status Icon
   * @param {IdsIcon} iconEl the icon element to update
   * @param {string} thisStatus the status string to apply as a CSS class
   * @returns {void}
   */
  #setIconColor(iconEl, thisStatus) {
    const iconElClassList = iconEl.classList;
    MESSAGE_STATUSES.forEach((status) => {
      if (thisStatus !== 'none' && thisStatus === status) {
        iconElClassList.add(status);
      } else {
        iconElClassList.remove(status);
      }
    });
  }
}

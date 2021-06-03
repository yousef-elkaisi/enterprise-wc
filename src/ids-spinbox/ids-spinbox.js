import {
  IdsElement,
  customElement,
  scss,
  props,
  stringUtils,
  mix
} from '../ids-base/ids-element';
import IdsButton from '../ids-button/ids-button';
import IdsInput from '../ids-input/ids-input';
import {
  IdsEventsMixin,
  IdsKeyboardMixin,
  IdsDirtyTrackerMixin
} from '../ids-mixins';
import styles from './ids-spinbox.scss';

const { stringToBool, buildClassAttrib } = stringUtils;

/**
 * used for assigning ids
 */
let instanceCounter = 0;

/**
 * IDS Spinbox Component
 * @type {IdsSpinbox}
 * @inherits IdsElement
 * @part container the overall container of the spinbox
 * @part button increment/decrement button
 * @part input input containing value/placeholder
 * @part label label text above the input
 * @part validation validation message when there is an error
 */
@customElement('ids-spinbox')
@scss(styles)
export default class IdsSpinbox extends mix(IdsElement).with(
    IdsEventsMixin,
    IdsKeyboardMixin,
    IdsDirtyTrackerMixin
  ) {
  constructor() {
    super();
  }

  /**
   * Return the properties we handle as getters/setters
   * @returns {Array} The properties in an array
   */
  static get properties() {
    return [
      props.DIRTY_TRACKER,
      props.DISABLED,
      props.LABEL,
      props.LABEL_REQUIRED,
      props.MAX,
      props.MIN,
      props.READONLY,
      props.STEP,
      props.VALIDATE,
      props.VALUE
    ];
  }

  /**
   * Create the Template for the contents
   * @returns {string} the template to render
   */
  template() {
    if (!this.id) {
      this.setAttribute(props.ID, `ids-spinbox-${++instanceCounter}`);
    }

    const disabledAttribHtml = this.hasAttribute(props.DISABLED)
      ? /* istanbul ignore next */' disabled'
      : '';

    const buttonDisabledAttribHtml = (
      this.hasAttribute(props.DISABLED) || this.hasAttribute(props.READONLY)
    ) ? ' disabled' : '';

    /* istanbul ignore next */
    const labelHtml = (
      `<label
        ${ buildClassAttrib(
        'ids-label-text', this.hasAttribute(props.DISABLED) && 'disabled'
      ) }
        part="label"
        for="${this.id}-input-input"
      >
        <ids-text color="unset" ${disabledAttribHtml}>${this.label}</ids-text>
      </label>`
    );

    /* istanbul ignore next */
    return (
      `<div
        class="ids-spinbox${
          this.hasAttribute(props.DISABLED) ? ' disabled' : ''
        }${this.hasAttribute(props.READONLY) ? ' readonly' : ''}"
        part="container">
          ${labelHtml}
          <div class="ids-spinbox-content">
            <ids-button
              type="tertiary"
              part="button"
              tabindex="-1"
              ${buttonDisabledAttribHtml}
            >-</ids-button>
            <ids-input
              text-align="center"
              value=${this.value}
              id="${this.id}-input"
              label="${this.label}"
              label-hidden="true"
              ${this.placeholder ? ` placeholder="${this.placeholder}"` : ''}
              ${disabledAttribHtml}
              part="input"
            ></ids-input>
            <ids-button
              type="tertiary"
              part="button"
              tabindex="-1"
              ${buttonDisabledAttribHtml}
            >+</ids-button>
          </div>
          ${this.validate ? '<div class="validation-message" part="validation"></div>' : ''}
      </div>`
    );
  }

  rendered() {
    this.#updateDecrementDisabled();
    this.#updateIncrementDisabled();
  }

  connectedCallback() {
    this.setAttribute('aria-valuenow', this.value);
    if (stringToBool(this.getAttribute(props.MAX))) {
      this.setAttribute('aria-valuemax', this.max);
    }
    if (stringToBool(this.getAttribute(props.MIN))) {
      this.setAttribute('aria-valuemin', this.min);
    }
    this.setAttribute('aria-label', this.label);

    this.#contentDiv = this.container.children[1];
    const [
      decrementButton,
      input,
      incrementButton
    ] = [...this.#contentDiv.children];

    this.input = input;
    this.#decrementButton = decrementButton;
    this.#incrementButton = incrementButton;

    this.input.mask = 'number';
    this.input.maskOptions = {
      allowDecimal: false,
      allowNegative: true
    };

    this.input.addEventListener('change', () => {
      if (this.input.value !== this.value) {
        this.value = this.input.value;
      }
    });

    const labelEl = this.container.children[0];
    this.onEvent('click.label', labelEl, () => {
      const isDisabled = this.hasAttribute(props.DISABLED);
      /* istanbul ignore else */
      if (!isDisabled) {
        this.input.input?.focus();
      }
    });

    if (this.container.children[2]) {
      const validationEl = this.container.children[2];
      this.input.setValidationElement(validationEl);
    }

    this.input.setLabelElement(labelEl);

    this.onEvent('click.decrement', this.#decrementButton, () => {
      this.#onDecrementStep();
    });

    this.onEvent('click.increment', this.#incrementButton, () => {
      this.#onIncrementStep();
    });

    this.onEvent('focus', this, (e) => {
      const isDisabled = this.hasAttribute(props.DISABLED);
      /* istanbul ignore next */
      if (!isDisabled) {
        e.preventDefault();
        this.input.focus();
      }
    });

    this.listen(['ArrowUp', 'ArrowDown'], this, (e) => {
      /* istanbul ignore next */
      if (stringToBool(this.getAttribute(props.DISABLED))) { return; }
      /* istanbul ignore next */
      const key = e.key;

      /* istanbul ignore next */
      switch (key) {
      case 'ArrowUp':
        this.#onIncrementStep();
        break;
      default:
      case 'ArrowDown':
        this.#onDecrementStep();
        break;
      }

      e.preventDefault();
    });

    this.setAttribute('role', 'spinbutton');
    return this;
  }

  /**
   * @param {number | string} value maximum value a spinbox can
   * be set to
   */
  set max(value) {
    if (parseInt(this.getAttribute(props.MAX)) !== parseInt(value)) {
      this.setAttribute(props.MAX, value);

      if (stringToBool(value)) {
        this.setAttribute('aria-valuemax', value);
      } else {
        this.removeAttribute('aria-valuemax');
      }

      this.#updateIncrementDisabled();
      this.#updateDecrementDisabled();
    }
  }

  /**
   * @returns {number | string} the current max value the spinbox' input
   * can be set to
   */
  get max() {
    return this.getAttribute(props.MAX);
  }

  /**
   * @param {number | string} value minimum value a spinbox can
   * be set to
   */
  set min(value) {
    if (parseInt(this.getAttribute(props.MIN)) !== parseInt(value)) {
      this.setAttribute(props.MIN, value);

      if (stringToBool(value)) {
        this.setAttribute('aria-valuemax', value);
      } else {
        this.removeAttribute('aria-valuemax');
      }

      this.#updateIncrementDisabled();
      this.#updateDecrementDisabled();
    }
  }

  /**
   * @returns {number | string} the current min value the spinbox' input
   * can be set to
   */
  get min() {
    return this.getAttribute(props.MIN);
  }

  /**
   * @param {number | string} value spinbox' input value
   */
  set value(value) {
    if (parseInt(this.getAttribute(props.VALUE)) !== parseInt(value)) {
      const hasMinValue = !Number.isNaN(parseInt(this.min));
      const hasMaxValue = !Number.isNaN(parseInt(this.max));

      let nextValue = parseInt(value);

      if (hasMinValue) {
        nextValue = Math.max(nextValue, parseInt(this.min));
      }

      if (hasMaxValue) {
        nextValue = Math.min(nextValue, parseInt(this.max));
      }

      this.setAttribute(props.VALUE, nextValue);
      this.setAttribute('aria-valuenow', nextValue);
      this.setAttribute(props.TYPE, 'number');
      this.input.value = nextValue;

      this.#updateDecrementDisabled();
      this.#updateIncrementDisabled();
    }
  }

  /**
   * @returns {number | string} spinbox' current input value
   */
  get value() {
    return this.getAttribute(props.VALUE);
  }

  /**
   * @param {string} value hint shown when a
   * user has cleared the spinbox input
   */
  set placeholder(value) {
    this.setAttribute(props.PLACEHOLDER, value);
  }

  /**
   * @returns {string} hint shown when a
   * user has cleared the spinbox input
   */
  get placeholder() {
    return this.getAttribute(props.PLACEHOLDER);
  }

  /**
   * @param {string} value label text describing the spinbox value
   */
  set label(value) {
    this.setAttribute(props.LABEL, value);
    this.setAttribute('aria-label', value);
    this.input?.setAttribute('label', value);
  }

  /**
   * @returns {string} value label text describing the spinbox value
   */
  get label() {
    return this.getAttribute(props.LABEL);
  }

  /**
   * @param {boolean|string} value whether to enable the dirty-tracker functionality
   */
  set dirtyTracker(value) {
    const isValueTruthy = stringToBool(value);
    if (isValueTruthy) {
      this.setAttribute(props.DIRTY_TRACKER, true);
      this.input.setAttribute(props.DIRTY_TRACKER, true);
    } else {
      this.removeAttribute(props.DIRTY_TRACKER);
      this.input.removeAttribute(props.DIRTY_TRACKER);
    }
  }

  /**
   * @returns {boolean|string} whether the dirty tracker has been enabled
   */
  get dirtyTracker() { return this.getAttribute(props.DIRTY_TRACKER); }

  /**
   * @param {boolean|string} value whether or not spinbox
   * interaction is disabled
   */
  set disabled(value) {
    const isValueTruthy = stringToBool(value);

    if (isValueTruthy) {
      this.setAttribute(props.DISABLED, true);
      this.input?.setAttribute?.(props.DISABLED, true);
      this.container.classList.add('disabled');
      this.setAttribute('tabindex', '-1');

      this.#incrementButton?.setAttribute?.(props.DISABLED, '');
      this.#decrementButton?.setAttribute?.(props.DISABLED, '');
    } else {
      this.removeAttribute?.(props.DISABLED);
      this.input?.removeAttribute?.(props.DISABLED);
      this.container.classList.remove('disabled');
      this.removeAttribute('tabindex');

      if (!this.hasAttribute(props.READONLY)) {
        this.#incrementButton?.removeAttribute?.(props.DISABLED);
        this.#decrementButton?.removeAttribute?.(props.DISABLED);
      }
    }
  }

  /**
   * @returns {'true'|null} whether or not element is disabled
   */
  get disabled() {
    return this.getAttribute(props.DISABLED);
  }

  /**
   * @param {string} value handles `validate` functionality; if set as "required",
   * has a required value
   */
  set validate(value) {
    if (value) {
      this.setAttribute(props.VALIDATE, value);
      this.input.setAttribute(props.VALIDATE, value);

      if (this.container.children.length === 2) {
        const validateElTemplate = document.createElement('template');
        validateElTemplate.innerHTML = `<div class="validation-message"></div>`;
        const [validateEl] = [...validateElTemplate.content.childNodes];
        this.container.appendChild(validateEl);
        this.input?.setValidationElement(validateEl);
      }
    } else {
      this.removeAttribute(props.VALIDATE);
      this.input.removeAttribute(props.VALIDATE);

      const validateEl = this.shadowRoot.querySelector('.validation-message');
      validateEl?.remove?.();
    }
  }

  /**
   * @returns {string} validation mode to use on input; if "required" then
   * displays a notice when no value was set.
   */
  get validate() { return this.getAttribute(props.VALIDATE); }

  /**
   * Sets the checkbox to required
   * @param {string} value The `label-required` attribute
   */
  set labelRequired(value) {
    const isValueTruthy = stringUtils.stringToBool(value);
    if (value) {
      this.setAttribute(props.LABEL_REQUIRED, value.toString());
    } else {
      this.removeAttribute(props.LABEL_REQUIRED);
    }

    this.container.children[0]?.classList
      ?.[!isValueTruthy ? 'add' : 'remove']?.('no-required-indicator');
  }

  get labelRequired() { return this.getAttribute(props.LABEL_REQUIRED); }

  /**
   * div holding spinbox buttons/input
   * @type {HTMLElement}
   */
  #contentDiv;

  /**
   * @type {IdsButton}
   */
  #incrementButton;

  /**
   * @type {IdsButton}
   */
  #decrementButton;

  /**
   * callback to increment value by step
   * @type {Function}
   */
  #onIncrementStep() {
    const hasValidStep = !Number.isNaN(parseInt(this.step));
    const step = hasValidStep
      ? parseInt(this.step)
      /* istanbul ignore next */
      : 1;

    const hasValidValue = !Number.isNaN(parseInt(this.value));
    this.value = (hasValidValue ? parseInt(this.value) : 0) + step;
  }

  /**
   * callback to decrement value by step
   * @type {Function}
   */
  #onDecrementStep() {
    const hasValidStep = !Number.isNaN(parseInt(this.step));
    const step = hasValidStep
      ? parseInt(this.step)
      /* istanbul ignore next */
      : 1;

    const hasValidValue = !Number.isNaN(parseInt(this.value));
    this.value = (hasValidValue ? parseInt(this.value) : 0) - step;
  }

  /**
   * updates state of whether decrement button is disabled
   * @type {Function}
   */
  #updateDecrementDisabled() {
    const hasMinValue = !Number.isNaN(parseInt(this.min));

    if (!hasMinValue) {
      this.#decrementButton.removeAttribute(props.DISABLED);
      return;
    }

    if (parseInt(this.value) <= parseInt(this.min)) {
      this.#decrementButton.setAttribute(props.DISABLED, '');
    } else if (!this.hasAttribute(props.READONLY)) {
      this.#decrementButton.removeAttribute(props.DISABLED);
    }
  }

  /**
   * updates state of whether increment button is disabled
   * @type {Function}
   */
  #updateIncrementDisabled() {
    const hasMaxValue = !Number.isNaN(parseInt(this.max));

    if (!hasMaxValue) {
      this.#incrementButton.removeAttribute(props.DISABLED);
      return;
    }

    if (parseInt(this.value) >= parseInt(this.max)) {
      this.#incrementButton?.setAttribute(props.DISABLED, '');
    } else if (!this.hasAttribute(props.READONLY)) {
      this.#incrementButton?.removeAttribute(props.DISABLED);
    }
  }

  /**
   * @param {boolean} value whether or not spinbox is readonly
   */
  set readonly(value) {
    if (stringToBool(value)) {
      this.container.classList.add('readonly');
      this.setAttribute(props.READONLY, true);
      this.input.setAttribute(props.READONLY, true);
      this.#incrementButton.setAttribute(props.DISABLED, '');
      this.#decrementButton.setAttribute(props.DISABLED, '');
    } else {
      this.container.classList.remove('readonly');

      this.removeAttribute(props.READONLY);
      this.input.removeAttribute(props.READONLY);

      if (!this.hasAttribute(props.DISABLED)) {
        this.#incrementButton.removeAttribute(props.DISABLED);
        this.#decrementButton.removeAttribute(props.DISABLED);
      }
    }
  }

  /**
   * @returns {boolean} value whether or not spinbox is readonly
   */
  get readonly() {
    return this.getAttribute(props.READONLY);
  }
}

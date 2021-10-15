// Ids is a JavaScript project, but we define TypeScript declarations so we can
// confirm our code is type safe, and to support TypeScript users.

import { IdsElement } from '../../core';

export default class extends IdsElement {
  /** Set the text string of the element */
  text: string;
}

import {MessageBase} from '../stream/messagesBase';
import {MessageUtils} from '../messageUtils';
import {MessageElements} from '../messages';
import {HTMLUtils} from './htmlUtils';

export class HTMLMessages {
  private static addElement(messages: MessageBase, outerElement: HTMLElement) {
    messages.elementRef.appendChild(outerElement);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  private static createElements(messages: MessageBase, html: string, role: string) {
    const messageElements = messages.createNewMessageElement('', role);
    messageElements.bubbleElement.classList.add('html-message');
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  private static overwrite(messages: MessageBase, html: string, role: string, messagesEls: MessageElements[]) {
    const {messages: aMessages} = messages;
    const overwrittenElements = MessageUtils.overwriteMessage(aMessages, messagesEls, html, role, 'html', 'html-message');
    if (overwrittenElements) {
      overwrittenElements.bubbleElement.innerHTML = html;
      HTMLUtils.apply(messages, overwrittenElements.outerContainer);
    }
    return overwrittenElements;
  }

  public static add(messages: MessageBase, html: string, role: string, messagesEls: MessageElements[], update = false) {
    if (update) {
      const overwrittenElements = this.overwrite(messages, html, role, messagesEls);
      if (overwrittenElements) return overwrittenElements;
    }
    const messageElements = HTMLMessages.createElements(messages, html, role);
    if (html.trim().length === 0) MessageBase.fillEmptyMessageElement(messageElements.bubbleElement);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    messages.applyCustomStyles(messageElements, role, false, messages.messageStyles?.html);
    HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}

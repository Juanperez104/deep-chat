import {UploadImagesButton} from './buttons/uploadImages/uploadImagesButton';
import {MicrophoneButton} from './buttons/microphone/microphoneButton';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {ButtonPosition} from './buttons/buttonPosition';
import {ServiceIO} from '../../../services/serviceIO';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, messages: Messages, serviceIO: ServiceIO) {
    this.elementRef = Input.createPanelElement(aiAssistant.inputStyles?.panel);
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles, aiAssistant.inputCharacterLimit);
    const uploadImagesButton = UploadImagesButton.isAvailable(serviceIO, aiAssistant.uploadImages)
      ? new UploadImagesButton(this.elementRef) : undefined;
    const submitButton = new SubmitButton(aiAssistant, keyboardInput.inputElementRef, messages, serviceIO,
      uploadImagesButton?.inputElement);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submit.bind(submitButton);
    const microphoneButton = aiAssistant.speechInput
      ? new MicrophoneButton(aiAssistant.speechInput, keyboardInput.inputElementRef,
          messages.addNewErrorMessage.bind(messages)) : undefined;
    Input.addElements(this.elementRef, aiAssistant, keyboardInput.elementRef,
      submitButton.elementRef, microphoneButton?.elementRef, uploadImagesButton?.elementRef);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const panelElement = document.createElement('div');
    panelElement.id = 'input';
    Object.assign(panelElement.style, customStyle);
    return panelElement;
  }

  // prettier-ignore
  private static addElements(panel: HTMLElement, aiAssistant: AiAssistant, keyboardInputEl: HTMLElement,
      submitButtonEl: HTMLElement, microphoneButton?: HTMLElement, uploadImagesButton?: HTMLElement) {
    ElementUtils.addElements(panel, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(panel, sideContainers, submitButtonEl, aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (microphoneButton && aiAssistant.speechInput) {
      const position = typeof aiAssistant.speechInput === 'boolean' ? 'outside-right' : aiAssistant.speechInput.position;
      ButtonPosition.add(panel, sideContainers, microphoneButton, position || 'outside-right');
    }
    if (uploadImagesButton) ButtonPosition.add(panel, sideContainers, uploadImagesButton, 'outside-left');
    SideContainers.add(panel, sideContainers);
  }
}

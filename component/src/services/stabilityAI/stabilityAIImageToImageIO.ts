import {StabilityAI, StabilityAIImageToImage} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {StabilityAIUtils} from './utils/stabilityAIUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {MessageContent} from '../../types/messages';
import {StabilityAIIO} from './stabilityAIIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class StabilityAIImageToImageIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/image-to-image';
  private readonly _imageWeight: number | undefined;
  textInputPlaceholderText = 'Describe image changes';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Stability AI - Image to Image</b></div>
    <p>Upload an image to create a new one with the changes you have described.</p>
    <p>Click <a href="https://platform.stability.ai/">here</a> for more info.</p>`;

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.stabilityAI;
    const defaultFile = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 1}}};
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey, defaultFile);
    const config = directConnection?.stabilityAI?.imageToImage as NonNullable<StabilityAI['imageToImage']>;
    if (typeof config === 'object') {
      if (config.engineId) this.url = `https://api.stability.ai/v1/generation/${config.engineId}/text-to-image`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      StabilityAIImageToImageIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAIImageToImageIO.canSendFileTextMessage;
  }

  private static cleanConfig(config: StabilityAIImageToImage) {
    delete config.engineId;
    delete config.weight;
  }

  private static canSendFileTextMessage(text?: string, files?: File[]) {
    return !!files?.[0] && !!(text && text.trim() !== '');
  }

  private createFormDataBody(body: StabilityAIImageToImage, image: File, text?: string) {
    const formData = new FormData();
    formData.append('init_image', image);
    if (text && text !== '') {
      formData.append('text_prompts[0][text]', text);
    }
    if (this._imageWeight !== undefined && this._imageWeight !== null) {
      formData.append('text_prompts[0][weight]', String(this._imageWeight));
    }
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof StabilityAIImageToImage]));
    });
    return formData;
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (!files) throw new Error('Image was not found');
    const lastMessage = pMessages[pMessages.length - 1]?.text?.trim();
    const formData = this.createFormDataBody(this.rawBody, files[0], lastMessage);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Result> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {base64: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}

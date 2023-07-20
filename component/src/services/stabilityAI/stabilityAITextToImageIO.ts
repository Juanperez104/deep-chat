import {StabilityAI, StabilityAITextToImage} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
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

export class StabilityAITextToImageIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image';
  private readonly _imageWeight: number | undefined;
  textInputPlaceholderText = 'Describe an image';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Stability AI - Text to Image</b></div>
    <p>Insert text to generate an image.</p>
    <p>Click <a href="https://platform.stability.ai/">here</a> for more info.</p>`;

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.stabilityAI;
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey);
    const config = directConnection?.stabilityAI?.textToImage as NonNullable<StabilityAI['textToImage']>;
    if (typeof config === 'object') {
      if (config.engineId) this.url = `https://api.stability.ai/v1/generation/${config.engineId}/text-to-image`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      StabilityAITextToImageIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAITextToImageIO.canSendTextMessage;
  }

  private static cleanConfig(config: StabilityAITextToImage) {
    delete config.engineId;
    delete config.weight;
  }

  private static canSendTextMessage(text?: string) {
    return !!(text && text.trim() !== '');
  }

  private preprocessBody(body: StabilityAITextToImage, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const prompt = {text: lastMessage} as {weight?: number};
    if (this._imageWeight) prompt.weight = this._imageWeight;
    bodyCopy.text_prompts = [prompt];
    return bodyCopy;
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, _: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Result> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {base64: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}

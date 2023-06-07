import {HuggingFaceClassificationResult} from '../../types/huggingFaceResult';
import {HuggingFaceFileIO} from './huggingFaceFileIO';
import {HuggingFace} from '../../types/huggingFace';
import {PollResult} from '../serviceIO';
import {DeepChat} from '../../deepChat';

export class HuggingFaceImageClassificationIO extends HuggingFaceFileIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.existingService?.huggingFace?.imageClassification as NonNullable<
      HuggingFace['imageClassification']
    >;
    const defaultFile = {images: {}};
    super(deepChat, 'Attach an image file', 'google/vit-base-patch16-224', config, defaultFile);
  }

  async extractPollResultData(result: HuggingFaceClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result.error) throw result.error;
    return {text: result[0]?.label || ''};
  }
}

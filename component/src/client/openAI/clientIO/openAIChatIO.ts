import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIMessage} from '../../../types/openAI';
import {OpenAIClientIO} from './openAIClientIO';

// chat is a form of completions
export class OpenAIChatIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/chat/completions';

  buildBody(params: OpenAIInternalBody, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(params)) as OpenAIInternalBody;
    const messages: OpenAIMessage[] = messagesObj.messages.map((message) => {
      return {content: message.text, role: message.role === 'ai' ? 'assistant' : message.role};
    });
    if (body.messages) {
      body.messages.push(...messages);
    } else {
      body.messages = messages;
    }
    return JSON.stringify(body);
  }

  extractTextFromResult(result: OpenAIResult): string {
    if (result.choices[0].delta) {
      return result.choices[0].delta.content || '';
    }
    if (result.choices[0].message) {
      return result.choices[0].message.content;
    }
    return '';
  }
}

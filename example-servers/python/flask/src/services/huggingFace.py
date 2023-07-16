import requests
import os


class HuggingFace:
    def chat(self, body):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Text messages are stored inside request body using the Deep Chat JSON format:
        # https://deepchat.dev/docs/connect
        chat_body = self.create_chat_body(body['messages'])
        response = requests.post(
            'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', json=chat_body, headers=headers)
        result = response.json()
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result['generated_text']}}

    @staticmethod
    def create_chat_body(messages):
        text = messages[-1]['text']
        previous_messages = messages[:-1]
        if not text:
            return None
        past_user_inputs = [message['text'] for message in previous_messages if message['role'] == 'user']
        generated_responses = [message['text'] for message in previous_messages if message['role'] == 'ai']
        return {'inputs': {'past_user_inputs': past_user_inputs, 'generated_responses': generated_responses, 'text': text}, 'wait_for_model': True}


    def image_classification(self, files):
        headers = {
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Files are stored inside a files object
        data=files[0].read()
        response = requests.post(
            'https://api-inference.huggingface.co/models/google/vit-base-patch16-224', data=data, headers=headers)
        result = response.json()
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result[0]['label']}}
    
    def speech_recognition(self, files):
        headers = {
            'Authorization': 'Bearer ' + os.getenv('HUGGING_FACE_API_KEY')
        }
        # Files are stored inside a files object
        data=files[0].read()
        response = requests.post(
            'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self', data=data, headers=headers)
        result = response.json()
        # Sends response back to Deep Chat using the Result format:
        # https://deepchat.dev/docs/connect/#Result
        return {'result': {'text': result['text']}}

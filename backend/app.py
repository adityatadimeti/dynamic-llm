from flask import Flask, jsonify, request, session
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from base64 import b64decode, b64encode
import json
from llm_manager import llm_text, process_through_llm
from llm_manager import LLMManager, LLM
from groq import Groq
from openai import OpenAI
import os

app = Flask(__name__)


@app.route('/encrypt')
def encrypt():
    apikey = request.args.get('apiKey')  
    with open('secrets.json', 'r') as file:
        keys = json.load(file)
        publicKey = keys['public_key']

    public_key_bytes = b64decode(publicKey)
    public_key = load_pem_public_key(public_key_bytes, default_backend())
    encryptedData = public_key.encrypt(
        apikey.encode(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    return jsonify({'encryptedData': b64encode(encryptedData).decode('utf-8')})

@app.route('/decrypt')
def decrypt():
    data = request.args.get('data')  

    with open('secrets.json', 'r') as file:
        keys = json.load(file)
        privateKey = keys['private_key']

    private_key_bytes = b64decode(privateKey)
    private_key = serialization.load_pem_private_key(private_key_bytes, password=None, backend=default_backend())

    encrypted_data_bytes = b64decode(data)
    decrypted_data = private_key.decrypt(
        encrypted_data_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    return jsonify({'decryptedData': decrypted_data.decode('utf-8')})

@app.route('/create_llm_manager')
def create_llm_manager():

    groq_client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )
    openai_client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY")
    )

    llm_options = [
        LLM(client=groq_client, model_name="llama3-8b-8192"),
        LLM(client=groq_client, model_name="mixtral-8x7b-32768"),
        LLM(client=openai_client, model_name="gpt-3.5-turbo"),
        LLM(client=groq_client, model_name="llama3-70b-8192"),
        LLM(client=openai_client, model_name="gpt-4o")
    ]

    llm_manager = LLMManager(llm_options)
    llm_manager_dict = llm_manager.to_dict()
    #session['llm_manager'] = llm_manager_dict
    
    return jsonify(llm_manager_dict)

@app.route('/process_through_llm_API')
def process_through_llm_API():
    print("starting from api")
    data_str = request.args.get('data')

    data = json.loads(data_str)
    
    # Now you can access the contents of the dictionary
    good_model = data.get('good_model')
    cur_index = data.get('cur_index')
    chat_history = data.get('chat_history')
    llm_manager = data.get('llm_manager')
    user_input = data.get('user_input')
    prevOutputs = data.get('prevChats')
    prevResponses = data.get('prevResponses')


    # go through each prev output and prev response and add it to the user_input by saying "here are the previous inputs and responses by the user for this conversation. Please add this to your context when processing the user's new prompt, specific earlier"
    
    if len(prevOutputs) > 0:
        user_input += ". Here are the previous inputs and responses by the user for this conversation. Please add this to your context when generating text for the user's new prompt, specified earlier. The user did not like those previous outputs, so take that into consideration. But still understand that information about what the user asked and what got generated and the fact that they didnt like it. When processing the user's prompt now, specified after User:, please take this into consideration. "
        for i in range(len(prevOutputs)):
            user_input += "Previous input number " + str(i+1) + ": "
            user_input += prevOutputs[i]
            user_input += ". Response to that input: "
            user_input += prevResponses[i]
            user_input += ". "
        user_input += "Now answer the user's new prompt, based on the context provided."
        

    llm_manager = LLMManager(llm_manager['llms'], llm_manager['current_index'])

    output = process_through_llm(llm_manager, good_model, cur_index, chat_history, user_input)

    print("done from api")
    return jsonify(output)


@app.route('/genText')
def genText():
    model = request.args.get('model')  
    prompt = request.args.get('prompt')  

    return jsonify({'output': "output text"})

if __name__ == '__main__':
    app.run(debug=True)  # For development, enable debug mode
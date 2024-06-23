from flask import Flask, jsonify, request
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from base64 import b64decode, b64encode
import json

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

@app.route('/genText')
def genText():
    model = request.args.get('model')  
    prompt = request.args.get('prompt')  

    return jsonify({'output': "output text"})

if __name__ == '__main__':
    app.run(debug=True)  # For development, enable debug mode
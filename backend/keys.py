from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import base64

# Generate an RSA key pair
def generate_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()

    # Serialize keys to PEM format
    pem_private_key = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    pem_public_key = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # Convert PEM keys to base64 encoded strings for easier handling
    base64_private_key = base64.b64encode(pem_private_key).decode('utf-8')
    base64_public_key = base64.b64encode(pem_public_key).decode('utf-8')

    return base64_public_key, base64_private_key

# Example usage
public_key, private_key = generate_key_pair()

#write to a json file
import json
data = {}
data['public_key'] = public_key
data['private_key'] = private_key
with open('keys.json', 'w') as outfile:
    json.dump(data, outfile)
print('Keys generated and saved to keys.json')
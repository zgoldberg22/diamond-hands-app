from dotenv import load_dotenv
import os
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

load_dotenv()

password = os.getenv("ENCRYPT_PASSWORD")
salt = os.getenv("ENCRYPT_SALT")
salt_in_bytes = salt.encode('utf-8')

def generate_key(password, salt):
    """Generate a key from a password and salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def decrypt_json(input_file):
    key = generate_key(password, salt_in_bytes)
    fernet = Fernet(key)

    with open(input_file, 'rb') as file:
      encoded_data = file.read()
   
    decrypted_data = fernet.decrypt(encoded_data)
    return json.loads(decrypted_data.decode())
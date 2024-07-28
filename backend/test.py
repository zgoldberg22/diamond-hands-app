# from jsoncrypt import Encrypt, Decrypt
# import json
import os
from dotenv import load_dotenv

load_dotenv()



# def encrypt_json_file(input_filename, output_filename, password):
#     encrypted_string = Encrypt.jsonfile(input_filename, password=password)
#     with open(output_filename, "w") as f:
#         f.write(encrypted_string)
#     print("File encrypted and saved as", output_filename)


# def get_decrypted_data(file_path, password):
#     with open(file_path, "r") as f:
#         encrypted_data = f.read()
#     decrypted_data = Decrypt.jsonfile(file_to_decrypt=file_path, password=password)
#     return decrypted_data

# Make password an environment variable 
# print(os.environ)
# password = os.getenv("JSON_PASSWORD")

# encrypt_json_file("basic_pitches.json", "encrypted_data.txt", )

# data = get_decrypted_data("encrypted_data.txt", "PASSWORD")
# print(data)
# json_data = json.loads(data)
# print(json_data)

# with open("decrypted_data.json", "w") as f:
#     json.dump(json_data, f, indent=2)

# with open("decrypted_data.json", "w") as f:
#     json.dump(data, f, indent=2)


# Generate a random string with a seed
# result = generate_random_string(string_length, seed_value)
# print(result) #d8#ZQL]qu"S|U2,brfsfg4@0z5[.)~7I

# encrypt_json_file("ball_tracking.json", "ball_tracking_encrypted.txt", password)


import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

key = Fernet.generate_key()
# salt = Fernet.generate_key()[:16]


def generate_key(password, salt):
    """Generate a key from a password and salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_json(input_file, output_file, password, salt):
    key = generate_key(password, salt)
    fernet = Fernet(key)

    with open(input_file, 'rb') as file:
      #   data = json.load(file)
      data = file.read()

    encrypted_data = fernet.encrypt(data)

    with open(output_file, 'wb') as file:
      file.write(encrypted_data)

   # #  json_string = json.dumps(data).encode()
   #  return fernet.encrypt(json_string)

def decrypt_json(input_file, password, salt):
    key = generate_key(password, salt)
    fernet = Fernet(key)

    with open(input_file, 'rb') as file:
      encoded_data = file.read()
   
    decrypted_data = fernet.decrypt(encoded_data)
    return json.loads(decrypted_data.decode())

# print(key)
# b'IUxWHq-9Vjoml0gXgL1tgxsWDANvGJO0THfxI-a82S4='
# encrypt_json_file("ball_tracking.json", "encrypted_data.txt", key)

# encrypt_json_file("hit_contact.json", "hit_contact_encrypt.bin", key)
# encrypt_json_file("bat_tracking_hits.json", "bat_tracking_hits_encrypt.bin", key)

# key = generate_key("DIAMOND_HANDS")
password = os.getenv("ENCRYPT_PASSWORD")

salt = os.getenv("ENCRYPT_SALT")
salt_in_bytes = salt.encode('utf-8')

# encrypt_json("hit_contact.json", "hit_contact_encrypt.bin", password, salt_in_bytes)
# encrypt_json("bat_tracking_hits.json", "bat_tracking_hits_encrypt.bin", password, salt_in_bytes)

# decrypted_data = decrypt_json("ball_tracking_encrypted.txt", password, salt_in_bytes)

decrypted_data = decrypt_json("hit_contact_encrypt.bin", password, salt_in_bytes)

print(decrypted_data)

# if decrypted_data: 
#    print(decrypted_data[:20])
#    print(type(decrypted_data))
# else:
#    print("No data")

# key = base64.urlsafe_b64encode("b'fsHfD9wRnkyiRbyVBu3r5ut5gXA0UG7HXjtI3JUDiug='")

# print(generate_key("DIAMOND_HANDS"))
# decrypted_data = decrypt_json_file("encrypted_data.txt", "b'fsHfD9wRnkyiRbyVBu3r5ut5gXA0UG7HXjtI3JUDiug='")



#gAAAAABmpTDtSzs4Z8f-3SojOJWAdLjiLaanXH2-7dz8hzsRlBR-rrZ7l7KT61lRmQVEZVJYS93vYsqFtbxpWSjfHGVB1KlwdGwjxNaJtdAF86_VQwYHXh0LqJA4Te_KoT3PZVkyw9sEYy4-h8Yz9FQXddURCNx4dlM8fcMQsmGlA2zjAJicjcUBE5nKK-uQ0bOPRdvfVShraDj5O7Fm4PQ4JJhbXbSh5yJZ6r5xYV9OghV2O8xpfD8AU8YxY-JRds1yu4bTJJWigLLo38U0N9QB7S1ecV05D8pk8UoiAqDe75StduFtQVvC0eOLF5TqPWHtU1xggKqdZadugaqnLbp4adBwTwJI169s2OYbqToGJM5LIhL0QawwnDNi0d9dqByR4rwUdgzyqTbLIFP38O8p2azkm_2HsjC
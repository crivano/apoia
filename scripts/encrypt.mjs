import Cryptr from 'cryptr'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });

const key = process.env.PROPERTY_SECRET
const cryptr = new Cryptr(key, {})

// Get the string to encrypt from the command line arguments
const stringToEncrypt = process.argv[2];

if (!stringToEncrypt) {
    console.error('Please provide a string to encrypt as a command line argument.');
    process.exit(1); // Exit with an error code
}

console.log(`Encrypting with secret: ${key}`)
const encryptedString = cryptr.encrypt(stringToEncrypt);
console.log(`Original string:  ${stringToEncrypt}`);
console.log(`Decrypted string: ${cryptr.decrypt(encryptedString)}`);
console.log(`Encrypted string: ${encryptedString}`);
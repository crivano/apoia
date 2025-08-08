import Cryptr from 'cryptr'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });

const key = process.env.PROPERTY_SECRET
const cryptr = new Cryptr(key, {});

// Get the string to encrypt from the command line arguments
const stringToDecrypt = process.argv[2];

if (!stringToDecrypt) {
    console.error('Please provide a string to dencrypt as a command line argument.');
    process.exit(1); // Exit with an error code
}

console.log(`Dencrypting with secret: ${key}`)
console.log(`Encrypted string: ${stringToDecrypt}`);
console.log(`Decrypted string: ${cryptr.decrypt(stringToDecrypt)}`);
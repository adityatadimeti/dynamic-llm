import fs from "fs";
import forge from "node-forge";

// Generate RSA key pair and write to secrets.json
// async function generateAndWriteKeysToFile() {
//   try {
//     // Generate RSA key pair
//     const keypair = await generateRSAKeyPair();
//     const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
//     const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

//     // Write keys to secrets.json file
//     const secrets = { publicKey, privateKey };
//     fs.writeFileSync("secrets.json", JSON.stringify(secrets, null, 2));

//     console.log("RSA keys have been written to secrets.json");
//   } catch (err) {
//     console.error("Error generating and writing RSA keys:", err);
//   }
// }

// // Function to generate RSA key pair
// function generateRSAKeyPair() {
//   return new Promise((resolve, reject) => {
//     forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(keypair);
//       }
//     });
//   });
// }

// // Example usage
// async function exampleUsage() {
//   await generateAndWriteKeysToFile();
// }

// // Call example usage
// exampleUsage();

function encryptData(data, publicKey) {
  const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = publicKeyForge.encrypt(data, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);
}

function decryptData(encryptedData, privateKey) {
  const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);
  const decrypted = privateKeyForge.decrypt(
    forge.util.decode64(encryptedData),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
    }
  );
  return decrypted.toString();
}

const secrets = JSON.parse(fs.readFileSync("secrets.json", "utf8"));
const publicKey = secrets.publicKey;
const privateKey = secrets.privateKey;
console.log(publicKey);

const inputText = "Sensitive data";

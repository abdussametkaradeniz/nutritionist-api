"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.E2EEncryption = void 0;
const tweetnacl_1 = require("tweetnacl");
const tweetnacl_util_1 = require("tweetnacl-util");
class E2EEncryption {
    // Her kullanıcı için bir anahtar çifti oluştur
    static generateKeyPair() {
        const keyPair = tweetnacl_1.box.keyPair();
        return {
            publicKey: (0, tweetnacl_util_1.encodeBase64)(keyPair.publicKey),
            privateKey: (0, tweetnacl_util_1.encodeBase64)(keyPair.secretKey),
        };
    }
    // Mesajı şifrele
    static encryptMessage(message, senderPrivateKey, recipientPublicKey) {
        const ephemeralKeyPair = tweetnacl_1.box.keyPair();
        const nonce = (0, tweetnacl_1.randomBytes)(tweetnacl_1.box.nonceLength);
        const encryptedMessage = (0, tweetnacl_1.box)((0, tweetnacl_util_1.decodeUTF8)(message), nonce, (0, tweetnacl_util_1.decodeBase64)(recipientPublicKey), (0, tweetnacl_util_1.decodeBase64)(senderPrivateKey));
        return {
            encrypted: (0, tweetnacl_util_1.encodeBase64)(encryptedMessage),
            nonce: (0, tweetnacl_util_1.encodeBase64)(nonce),
            ephemeralPublicKey: (0, tweetnacl_util_1.encodeBase64)(ephemeralKeyPair.publicKey),
        };
    }
    // Mesajı deşifre et
    static decryptMessage(encryptedData, recipientPrivateKey, senderPublicKey) {
        const decrypted = tweetnacl_1.box.open((0, tweetnacl_util_1.decodeBase64)(encryptedData.encrypted), (0, tweetnacl_util_1.decodeBase64)(encryptedData.nonce), (0, tweetnacl_util_1.decodeBase64)(senderPublicKey), (0, tweetnacl_util_1.decodeBase64)(recipientPrivateKey));
        if (!decrypted) {
            throw new Error("Mesaj deşifre edilemedi");
        }
        return (0, tweetnacl_util_1.encodeUTF8)(decrypted);
    }
}
exports.E2EEncryption = E2EEncryption;

import { box, randomBytes } from "tweetnacl";
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from "tweetnacl-util";

export class E2EEncryption {
  // Her kullanıcı için bir anahtar çifti oluştur
  static generateKeyPair() {
    const keyPair = box.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  // Mesajı şifrele
  static encryptMessage(
    message: string,
    senderPrivateKey: string,
    recipientPublicKey: string
  ) {
    const ephemeralKeyPair = box.keyPair();
    const nonce = randomBytes(box.nonceLength);

    const encryptedMessage = box(
      decodeUTF8(message),
      nonce,
      decodeBase64(recipientPublicKey),
      decodeBase64(senderPrivateKey)
    );

    return {
      encrypted: encodeBase64(encryptedMessage),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
    };
  }

  // Mesajı deşifre et
  static decryptMessage(
    encryptedData: {
      encrypted: string;
      nonce: string;
      ephemeralPublicKey: string;
    },
    recipientPrivateKey: string,
    senderPublicKey: string
  ) {
    const decrypted = box.open(
      decodeBase64(encryptedData.encrypted),
      decodeBase64(encryptedData.nonce),
      decodeBase64(senderPublicKey),
      decodeBase64(recipientPrivateKey)
    );

    if (!decrypted) {
      throw new Error("Mesaj deşifre edilemedi");
    }

    return encodeUTF8(decrypted);
  }
}

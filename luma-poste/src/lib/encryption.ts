import crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  
  private static getKey(): Buffer {
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod';
    return crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  static encrypt(plaintext: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Obtenir le tag d'authentification
      const tag = cipher.getAuthTag();
      
      // Retourner IV + Tag + Encrypted en base64
      const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
      return combined.toString('base64');
    } catch (error) {
      console.error('Erreur chiffrement:', error);
      throw new Error('Impossible de chiffrer les données');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const key = this.getKey();
      const combined = Buffer.from(encryptedData, 'base64');
      
      // Extraire IV, Tag et données chiffrées
      const iv = combined.subarray(0, this.IV_LENGTH);
      const tag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
      const encrypted = combined.subarray(this.IV_LENGTH + this.TAG_LENGTH);
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erreur déchiffrement:', error);
      throw new Error('Impossible de déchiffrer les données');
    }
  }
}

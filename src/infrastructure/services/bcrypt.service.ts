import { hashSync, compareSync } from 'bcrypt';

const SALT = 10;

export class BcryptService {
  encrypt(password: string): string {
    return hashSync(password, SALT);
  }

  decrypt(hash: string, password: string): boolean {
    return compareSync(password, hash);
  }
}
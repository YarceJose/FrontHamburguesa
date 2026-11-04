import { generatePassword } from './password';

describe('generatePassword', () => {
  it('meets the length and character rules', () => {
    for (let i = 0; i < 50; i++) {
      const password = generatePassword();
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[2-9]/);
      expect(password).toMatch(/[!@#$%*?]/);
      expect(password).not.toMatch(/[0O1lI]/);
    }
  });
});

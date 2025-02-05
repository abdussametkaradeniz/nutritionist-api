export const generateRandomCodes = (count: number): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    codes.push(code);
  }
  return codes;
};

declare global {
  namespace NodeJS {
    interface Error {
      statusCode?: number;
      code?: string;
    }
  }
}

export {};

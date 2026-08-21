declare global {
  namespace Express {
    interface Request {
      userId: number; // or number depending on your DB
      sessionId?: string; // optional if not always present
    }
  }
}

export {};

import { Request, Response } from 'express';

export async function checkHealth(req: Request, res: Response) {
  return res.status(200).json({
    status: 'ok',
  });
}

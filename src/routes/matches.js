import { Router } from 'express';

export const matchRouter = Router();

matchRouter.get('/', (req,res)=>{
  res.statusCode(200).json({ message: 'Match List'})
})

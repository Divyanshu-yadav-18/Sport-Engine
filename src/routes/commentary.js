import {Router} from "express";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { commentary } from "../db/schema.js";
import { db } from "../db/db.js";
import { eq, desc } from "drizzle-orm";


const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get('/',async (req,res)=>{
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if(!paramsResult.success){
     return res.status(400).json({error: 'Invalid Match Id', details: paramsResult.error.issues});
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query);
  if(!queryResult.success){
     return res.status(400).json({error: 'Invalid Query Params', details: queryResult.error.issues});
  }

  try{
    const { id: matchId } = paramsResult.data;
    const { limit = 10 } = queryResult.data;

    const safeLimit = Math.min(limit, MAX_LIMIT);

    const results = await db.select().from(commentary).where(eq(commentary.matchId, matchId)).orderBy(desc(commentary.createdAt)).limit(safeLimit);

    res.status(200).json({ data: results});
  }
  catch(error){
        console.error('Failed to fetch commentary', error);
    res.status(500).json({ error: 'Failed to fetch commentary'});

  }
  
});

commentaryRouter.post('/', async (req, res)=>{
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if(!paramsResult.success){
    return res.status(400).json({error: 'Invalid Match Id', details: paramsResult.error.issues});
    
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);

  if(!bodyResult.success){
    return res.status(400).json({error: 'Invalid commentary Payload', details: bodyResult.error.issues});
  }

  try{
    const {minutes, ...rest } = bodyResult.data;
    const [result] = await db.insert(commentary).values({
      matchId:paramsResult.data.id,
      minutes,
      ...rest
    }).returning();

    res.status(201).json({data: result});
    
  }catch(e){
    console.error('Failed to create commentary', e);
    res.status(500).json({ error: 'Failed to create commentary'});
  }
})

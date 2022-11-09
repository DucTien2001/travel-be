import { Router } from 'express';
import { mainRouter } from 'modules/index';

export const restRouter = Router(); 

restRouter.use('/v1.0', mainRouter)
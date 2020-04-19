import * as express from 'express';
import * as Controllers from './controllers';

export function buildApiRouter(): express.IRouter<never> {
  const router = express.Router();

  router.post('/shifubriq', Controllers.initiateShifubriqGame);

  router.post('/action', Controllers.play);

  return router;
}

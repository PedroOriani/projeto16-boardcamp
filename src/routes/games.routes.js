import { Router } from "express";
import { getGames, postGame } from "../controllers/game.controllers.js";
import gameSchema from "../schemas/game.schema.js";
import { validateSchema } from "../middlewares/validateSchema.js"

const gamesRouter = Router();

gamesRouter.get('/games', getGames);
gamesRouter.post('/games', validateSchema(gameSchema) ,postGame)

export default gamesRouter;
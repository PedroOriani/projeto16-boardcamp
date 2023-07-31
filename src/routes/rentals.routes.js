import { Router } from "express";
import { deleteRental, finalizeRental, getRentals, postRental } from "../controllers/rental.controllers.js";

const rentalsRouter = Router();

//UM MIDDLEWARE PODE AUXILIAR PARA NÃO FAZER CÓDIGOS REPETIDOS :D

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', postRental)
rentalsRouter.post('/rentals/:id/return', finalizeRental)
rentalsRouter.delete('./rentals/:id', deleteRental)

export default rentalsRouter;
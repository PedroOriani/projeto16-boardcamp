import { Router } from "express";
import { getCustomers, getCustomersById, postCustomer, updateCustomer } from "../controllers/customer.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import customerSchema from "../schemas/customer.schema.js";

const customersRouter = Router();

customersRouter.get('/customers', getCustomers)
customersRouter.get('/customers/:id', getCustomersById)
customersRouter.post('/customers', validateSchema(customerSchema), postCustomer)
customersRouter.put('/customers/:id', validateSchema(customerSchema), updateCustomer)

export default customersRouter;
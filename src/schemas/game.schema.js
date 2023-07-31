import Joi from "joi";

const gameSchema = Joi.object({
    name: Joi.string().trim().required(),
    image: Joi.string().required(),
    stockTotal: Joi.number().integer().min(1).required(),
    pricePerDay: Joi.number().min(1).required(),
})

export default gameSchema;
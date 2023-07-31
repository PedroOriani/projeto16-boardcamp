import Joi from "joi";

const customerSchema = Joi.object({
    name: Joi.string().min(1).required(),
    phone: Joi.string().min(10).max(11).required(),
    cpf: Joi.string().length(11).required(),
    birthday: Joi.date().required(),
});

export default customerSchema;
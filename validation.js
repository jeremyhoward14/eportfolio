//VALIDATION
const Joi = require('@hapi/joi');

//Register Validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(2).required(),
        email: Joi.string().min(2).required().email(),
        password: Joi.string().min(2).required(),
        firstname: Joi.string().min(2).required(),
        lastname: Joi.string().min(2).required()
      });

    return schema.validate(data);
};

//Login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(2).required().email(),
        password: Joi.string().min(2).required(),
      });

    return schema.validate(data);
};
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
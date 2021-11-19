const { ExpressError, errorHandler, catchAsync } = require('./utils');
const Joi = require('joi');



function validateList(req, res, next) {

    const itemSchema = Joi.object({
        description: Joi.string().min(3).max(30).required(),
        link: Joi.string().allow('')
    });

    const listSchema = Joi.object({
        list: Joi.object({
            title: Joi.string().min(3).max(30).required(),
            items: Joi.array().items(itemSchema)
        }).required()
    });

    const { error } = listSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

function validateGroup(req, res, next) {

    const groupSchema = Joi.object({
        group: Joi.object({
            title: Joi.string().min(3).max(30).required(),
            dateEnd: Joi.date().required(),
            isPrivate: Joi.string().valid('private')
        }).required()
    });

    const { error } = groupSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    return next();
}

module.exports = {
    validateList,
    validateGroup
}
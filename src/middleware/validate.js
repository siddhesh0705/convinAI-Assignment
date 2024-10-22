const Joi = require('joi');

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    mobileNumber: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateExpense = (req, res, next) => {
  const schema = Joi.object({
    description: Joi.string().required(),
    amount: Joi.number().positive().required(),
    splitType: Joi.string().valid('EQUAL', 'EXACT', 'PERCENTAGE').required(),
    shares: Joi.array().items(
      Joi.object({
        userId: Joi.string().uuid().required(),
        share: Joi.number().when('splitType', {
          is: 'EXACT',
          then: Joi.required()
        }),
        percentage: Joi.number().when('splitType', {
          is: 'PERCENTAGE',
          then: Joi.required()
        })
      })
    ).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateUser, validateExpense };

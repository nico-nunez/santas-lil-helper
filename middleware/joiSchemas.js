const { ExpressError } = require("../helpers/errors");
const Joi = require("joi");

const emailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net"],
    },
  })
  .trim()
  .lowercase()
  .required()
  .messages({
    "any.required": "Valid email is required.",
    "string.email": "Please enter a valid email.",
  });

const passwordSchema = Joi.string()
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
  .required()
  .messages({
    "any.required": "Password is required.",
    "string.pattern.base": `Password must be between 8-32 characters and contain at least
    an uppercase, lowercase, number, and special character [!@$%&*?].
  `,
  });

const confirmSchema = Joi.string()
  .required()
  .valid(Joi.ref("password"))
  .messages({
    "any.required": "Please confirm password.",
    "any.only": "Passwords must match.",
  });

const nameSchema = Joi.string()
  .max(30)
  .trim()
  .required()

const avatarSchema = Joi.string()
  .trim()

const partyTitleSchema = Joi.string()
  .min(3)
  .max(50)
  .trim()
  .required()
  .messages({
    "any.required": "Name is required.",
    "string.min": "Name must contain at least 3 characters",
    "string.max": "Name can contain a max of 50 characters.",
    "string.alphanum": "Name may only contain only letters and/or numbers."
  });

const partySecretSchema = Joi.string()
  .min(8)
  .max(32)
  .alphanum()
  .trim()
  .allow('')
  .messages({
    "string.min": "Code must contain at least 8 characters",
    "string.max": "Code can contain a max of 32 characters.",
    "string.alphanum": "Code may only contain only letters and/or numbers."
  });

function validateInput(joiSchema, req, redirect=null) {
  const redirectURL = redirect || req.originalUrl;
	const {value, error} = joiSchema.validate(req.body);
  if(error) {
    const message = error.details.map(err => err.message).join(',');
    throw new ExpressError(message, 400, redirectURL);
  }
  req.body = value;
}

function validRegistration(req, res, next) {
	const userSchema = Joi.object({
		newUser: Joi.object({
			email: emailSchema,
			displayName: nameSchema,
      avatar: avatarSchema,
			password: passwordSchema,
			confirmPass: confirmSchema,
		})
	});

	validateInput(userSchema, req);

	return next();
}

function validList(req, res, next) {
	const itemSchema = Joi.object({
		description: Joi.string().max(50).allow(""),
		link: Joi.string().allow(""),
	});

	const listSchema = Joi.object({
		list: Joi.object({
			title: Joi.string().min(3).max(50).required(),
			items: Joi.array().items(itemSchema),
      public: Joi.string().allow('')
		}).required(),
	});

	validateInput(listSchema, req);

	return next();
}

function validParty(req, res, next) {
	const partySchema = Joi.object({
		party: Joi.object({
			title: partyTitleSchema,
      secret: partySecretSchema,
			selectionsOn: Joi.date().required(),
			exchangeOn: Joi.date().required(),
			public: Joi.string(),
		})
    .required()
	});
	validateInput(partySchema, req, '/parties/new');
	return next();
}

function validEmail(req, res, next) {
  const resetSchema = Joi.object({
    email: emailSchema
  });
  validateInput(resetSchema, req, '/auth/password/update/reset');
  return next();
}

function validPassUpdate(req, res, next) {
  const updatePassSchema = Joi.object({
    currentPass: passwordSchema,
    password: passwordSchema,
    confirm: confirmSchema,
  });
  validateInput(updatePassSchema, req, );
  return next();
}

function validPassReset(req, res, next) {
  const redirect = `/auth/password/update?=${req.body.ulc}`;
  const resetPassSchema = Joi.object({
    password: passwordSchema,
    confirm: confirmSchema,
    ulc: Joi.string().required()
  });
  validateInput(resetPassSchema, req, redirect);
  return next();
}


function validProfile(req, res, next) {
  const profileSchema = Joi.object({
    profile: Joi.object({
      displayName: nameSchema,
      email: emailSchema,
      avatar: avatarSchema
    })
  })
  validateInput(profileSchema, req, `/users/${req.user.id}/update` );
  return next();
}

module.exports = {
	validRegistration,
	validList,
	validParty,
  validEmail,
  validPassUpdate,
  validPassReset,
  validProfile
};

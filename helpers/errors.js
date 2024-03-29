class ExpressError extends Error {
	constructor(message, status, redirectURL) {
		super();
		this.message = message;
		this.status = status;
		this.redirectURL = redirectURL;
	}
}

const catchAsync = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};

const errorHandler = (err, req, res, next) => {
	const defaultURL = '/';
	const { status = 500, redirectURL = defaultURL } = err;
	if (!err.message) err.message = 'Oops! Something went wrong with the server.';
	if (err.name === 'CastError')
		err.message = 'Sorry, unable to find what you were looking for.';
	req.flash('error', err.message);
	return res.status(status).redirect(redirectURL);
};

const formatDate = (dateObj) => {
	const monthStr = String(dateObj.getUTCMonth() + 1);
	const monthFormatted = '0'.repeat(2 - monthStr.length) + monthStr;

	const dateStr = String(dateObj.getUTCDate());
	const dateFormatted = '0'.repeat(2 - dateStr.length) + dateStr;

	return `${dateObj.getFullYear()}-${monthFormatted}-${dateFormatted}`;
};

module.exports = {
	ExpressError,
	errorHandler,
	catchAsync,
	formatDate,
};

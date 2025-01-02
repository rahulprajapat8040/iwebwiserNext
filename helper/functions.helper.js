const responseGenerator = (res, message, statusCode = 200, data = null) => {
    return res.status(statusCode).json({
        message,
        statusCode,
        data,
        status: true
    });
};

const parseIfString = (data, keys) => {
    keys.forEach(key => {
        if (typeof data[key] === "string") {
            try {
                data[key] = JSON.parse(data[key]);
            } catch (error) {
                console.error(`Error parsing key: ${key}`, error);
            }
        }
    });
    return data;
};

module.exports = { responseGenerator, parseIfString };
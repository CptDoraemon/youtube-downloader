module.exports = {
    unableToDownload: myError('unableToDownload'),
    invalidInput: myError('invalidInput'),
    zipError: myError('serverError')
};

function myError(messageString) {
    const error = new Error(messageString);
    error.name = messageString;
    return error
}
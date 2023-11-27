const response = (ok, {payload = null, message = '', status_code}) => {
    if (ok) {
        return {
            payload,
            message,
            status_code
        }
    } else {
        return {
            payload,
            message: message ? message : 'Some error occurred while retrieving Clients.',
            status_code: status_code ? status_code : 400
        }
    }
}

module.exports = response
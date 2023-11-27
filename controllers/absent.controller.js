const Absent = require("../model/absent.model");
const response = require("../utils/response");

exports.getAllAbsent = (req, res) => {
    console.log('ran');
    const body = {
        limit: req.body.limit,
        offset: req.body.offset,
        company_id: req.body.company_id,
        full_name: req.body.full_name,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        location_checkin: req.body.location_checkin,
        location_checkout: req.body.location_checkout,
        absent: req.body.absent,
        late: req.body.late,
    }
    Absent.getAllAbsent(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(err?.status_code || 500).send(response(false, {
                message: err.message,
                status_code: err?.status_code || 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
}

exports.getAbsent = (req, res) => {
    const body = {
        user_id: req.body.user_id,
        date: req.body.date,
    }
    Absent.getAbsent(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(err?.status_code || 500).send(response(false, {
                message: err.message,
                status_code: err?.status_code || 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.getAbsentV2 = (req, res) => {
    const body = {
        user_id: req.body.user_id,
        date: req.body.date,
        company_id: req.body.company_id
    }
    Absent.getAbsentV2(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(err?.status_code || 500).send(response(false, {
                message: err.message,
                status_code: err?.status_code || 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.checkin = (req, res) => {
    const body = {
        user_id: req.body.user_id,
        company_id: req.body.company_id,
        check_in_datetime: req.body.date_time,
        check_in_image: req.body.image,
        check_in_lat: req.body.lat,
        check_in_long: req.body.long,
        is_late: req.body.is_late ? 1 : 0
    }
    Absent.checkin(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.checkout = (req, res) => {
    const body = {
        user_id: req.body.user_id,
        company_id: req.body.company_id,
        check_out_datetime: req.body.date_time,
        check_out_image: req.body.image,
        check_out_lat: req.body.lat,
        check_out_long: req.body.long,
        overtime_notes: req.body.overtime_notes,
    }
    Absent.checkout(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.getAllCompanyAbsentFeature = (req, res) => {
    Absent.getAllCompanyAbsentFeature((err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.updateAbsentFeature = (req, res) => {
    const body = {
        company_id: req.body.company_id,
        absent_feature: req.body.absent_feature ? 1 : 0,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        last_absent_time: req.body.last_absent_time,
    }
    Absent.updateAbsentFeature(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.getAllCompanyAllowSelfCreateFeature = (req, res) => {
    Absent.getAllCompanyAllowSelfCreateFeature((err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};

exports.updateAllowSelfCreateFeature = (req, res) => {
    const body = {
        company_id: req.body.company_id,
        allow_self_create_client: req.body.allow_self_create_client ? 1 : 0,
    }
    Absent.updateAllowSelfCreateFeature(body, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else res.status(200).send(response(true, {
            payload: data,
            message: 'success',
            status_code: 200
        }));
    });
};
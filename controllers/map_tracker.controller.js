const MapTracker = require("../model/map_tracker.model");
const response = require("../utils/response");
const moment = require("moment");
const WebSocket = require("ws");
const url = require('url');

let userWss = []

const wsServer = new WebSocket.Server({
    port: 4001
})

// live tracking in array:
// ws://localhost:3001/live-tracking?user_id=[1,2]
// live tracking in string:
// ws://localhost:3001/live-tracking?user_id=2
wsServer.on('connection', (socket, request) => {
    if (request.url.includes('live-tracking')) {
        const route = url.parse(request.url, true);
        const user_id = JSON.parse(route.query.user_id);
        if (!userWss.some(user => user.socket === socket)) {
            userWss.push({
                user_id,
                socket
            });
        }
        socket.on('close', () => {
            const indexSelected = userWss.findIndex(item => item .socket=== socket);
            userWss.splice(indexSelected, 1)
        })
    }
});

exports.createMapTracker = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    const data = new MapTracker({
        user_id: req.body.user_id,
        company_id: req.body.company_id,
        device_id: req.body.device_id,
        lat: req.body.lat,
        long: req.body.long,
        os: req.body.os,
        full_name: req.body.full_name,
        os_version: req.body?.os_version,
        brand_name: req.body?.brand_name,
        model_name: req.body?.model_name,
        app_version: req.body?.app_version,
        build_number: req.body?.build_number,
        api_level: req.body?.api_level
    });

    MapTracker.createMapTracker(data, (err, data) => {
        if (err) {
            console.log(err, "errrrrr")
            res.status(500).send(response(false, {
                message: err.message,
                status_code: 500
            }));
        } else {
            if (userWss.length) {
                userWss.forEach(user => {
                    const length = JSON.stringify(user.user_id).length
                    if (Array.isArray(user.user_id)) {
                        if (user.user_id.some(item => item === data.user_id)) {
                            user.socket.send(JSON.stringify(data))
                        }
                    } else {
                        if (user.user_id === data.user_id) {
                            user.socket.send(JSON.stringify(data))
                        }
                    }
                })
            }
            res.status(201).send(response(true, {
                payload: data,
                message: 'created',
                status_code: 201
            }))
        };
    });
};

exports.getMapTracker = (req, res) => {
    MapTracker.getMapTracker((err, data) => {
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

exports.getMapTrackerbyUserId = (req, res) => {
    const body = {
        user_id: req.body.user_id,
        limit: req.body.limit,
        offset: req.body.offset,
        start_date: req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
        end_date: req.body.end_date ? moment(req.body.end_date).format('YYYY-MM-DD HH:mm') : req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
    }
    MapTracker.getMapTrackerbyUserId(body, (err, data) => {
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
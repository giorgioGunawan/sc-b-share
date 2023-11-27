const Schedule = require("../model/schedule.model.js");
const moment = require("moment");
const response = require("../utils/response.js");

// Create and Save a new User
exports.createNewSchedule = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  
   // Create a newschedule
   const newschedule = new Schedule({
    user_id: req.body.user_id,
    client_id: req.body.client_id,
    schedule_datetime: req.body.schedule_datetime,
    predicted_time_spent: 1,
    reason: req.body.reason,
    products: req.body.products
  });
  console.log(newschedule);
  
  // Save Schedule in the database
  Schedule.createNewSchedule(newschedule, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    else res.send(data);
  });
};

exports.createNewScheduleWithCheckin = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  
   // Create a newschedule
   const newschedule = {
    client_entity_name: req.body.client_entity_name,
    custom_field: req.body.custom_field,
    address: req.body.address,
    phone_number: req.body.phone_number,
    location: req.body.location,
    company_id: req.body.company_id,
    schedule_datetime: req.body.schedule_datetime,
    user_id: req.body.user_id,
    predicted_time_spent: req.body.predicted_time_spent,
    reason: req.body.reason,
    products: req.body.products,
    check_in_datetime: req.body.check_in_datetime,
    upload_picture: req.body.upload_picture
   }
  console.log(newschedule);
  
  // Save Schedule in the database
  Schedule.createNewScheduleWithCheckin(newschedule, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    else res.send(data);
  });
};

// Retrieve all clients from the database.
exports.findAllSchedule = (req, res) => {
    const body = {
      limit: req.body.limit,
      offset: req.body.offset
    }
    Schedule.getAllSchedule(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving Clients."
          });
        else res.send(data);
      });
};

exports.findScheduleByCompanyId = (req, res) => {
  Schedule.getScheduleByCompanyId(req.body.company_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.findScheduleByClientId = (req, res) => {
  Schedule.getScheduleByClientId(req.body.client_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.findScheduleWithFilter = (req, res) => {
  let body = {}
  if (req.body.branch_id) {
    body = {
      company_id: req.body.company_id,
      limit: req.body.limit,
      offset: req.body.offset,
      client_id: req.body.client_id,
      user_id: req.body.user_id,
      predicted_time_spent: req.body.predicted_time_spent,
      reason: req.body.reason,
      isLate: req.body.isLate,
      present: req.body.present,
      branch_id: req.body.branch_id,
      client_entity_name: req.body.client_entity_name,
      full_name: req.body.full_name,
      visiting_reason_id: req.body.visiting_reason_id,
      outcome_id: req.body.outcome_id,
      start_date: req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm:ss') : null,
      end_date: req.body.end_date ? moment(req.body.end_date).format('YYYY-MM-DD HH:mm:ss') : req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm:ss') : null,
    }

    console.log(body);
    Schedule.getBranchScheduleWithFilter(body, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving Clients."
          });
        else res.send(data);
      });
    } else {
      body = {
        company_id: req.body.company_id,
        limit: req.body.limit,
        offset: req.body.offset,
        client_id: req.body.client_id,
        user_id: req.body.user_id,
        predicted_time_spent: req.body.predicted_time_spent,
        reason: req.body.reason,
        isLate: req.body.isLate,
        present: req.body.present,
        client_entity_name: req.body.client_entity_name,
        full_name: req.body.full_name,
        visiting_reason_id: req.body.visiting_reason_id,
        outcome_id: req.body.outcome_id,
        start_date: req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
        end_date: req.body.end_date ? moment(req.body.end_date).format('YYYY-MM-DD HH:mm') : req.body.start_date ? moment(req.body.start_date).format('YYYY-MM-DD HH:mm') : null,
      }
      Schedule.getCompanyScheduleWithFilter(body, (err, data) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving Clients."
            });
          else res.send(data);
        });
    }
};

exports.findScheduleByUserId_v2 = (req, res) => {
  const body = {
    user_id: req.body.user_id,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
  }
  Schedule.getScheduleByUserId_v2(body, (err, data) => {
      if (err) {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      } else {
        const editedData = data.map(item => {
          const [ lat, long ] = item.location.split(' ')
          return {
            ...item,
            lat,
            long,
            check_in_datetime: item.check_in_datetime === '0000-00-00 00:00:00' ? null : item.check_in_datetime,
            check_out_datetime: item.check_out_datetime === '0000-00-00 00:00:00' ? null : item.check_out_datetime,
            status: item.check_in_datetime !== '0000-00-00 00:00:00' && item.check_out_datetime !== '0000-00-00 00:00:00' ? 'success' : 'pending'
          }
        })
        res.send(editedData);
      }
    });
};

exports.findScheduleByUserId = (req, res) => {
  Schedule.getScheduleByUserId(req.body.user_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.findScheduleById = (req, res) => {
  Schedule.getScheduleById(req.body.id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.findCheckinScheduleByUserId = (req, res) => {
  Schedule.getCheckinScheduleByUserId(req.body.user_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.findCheckoutScheduleByUserId = (req, res) => {
  Schedule.getCheckoutScheduleByUserId(req.body.user_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.getReport = (req, res) => {
  Schedule.getReport(req.body.user_id, req.body.start_date, req.body.end_date, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.checkin = (req, res) => {
  Schedule.checkin({schedule_id: req.body.schedule_id, check_in_datetime: req.body.check_in_datetime, upload_picture: req.body.upload_picture}, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

exports.checkout = (req, res) => {
  Schedule.checkout(req.body.schedule_id, req.body.check_out_datetime, req.body.notes, req.body.upload_picture, req.body.signature, req.body.outcome_id, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Clients."
        });
      else res.send(data);
    });
};

// Delete a client with the specified clientId in the request
exports.deleteSchedule = (req, res) => {
    Schedule.removeSchedule(req.body.schedule_id, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found schedule with schedule_id ${req.params.schedule_id}.`
            });
          } else {
            res.status(500).send({
              message: "Could not delete schedule with schedule_id " + req.params.schedule_id
            });
          }
        } else res.send({ message: `schedule was deleted successfully!` });
      });
};

// Delete all clients from the database.
exports.deleteAllSchedule = (req, res) => {
    Schedule.removeAllSchedule((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all schedules."
          });
        else res.send({ message: `All schedules were deleted successfully!` });
    });
};

exports.getCompanyCanvasCheckinFeature = (req, res) => {
  const body = {
    company_id: req.body.company_id,
}
  Schedule.getCompanyCanvasCheckinFeature(body, (err, data) => {
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

exports.getAllCompanyCanvasCheckinFeature = (req, res) => {
  Schedule.getAllCompanyCanvasCheckinFeature((err, data) => {
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

exports.updateCanvasCheckinFeature = (req, res) => {
  const body = {
      company_id: req.body.company_id,
      canvas_checkin_feature: req.body.canvas_checkin_feature ? 1 : 0,
  }
  Schedule.updateCanvasCheckinFeature(body, (err, data) => {
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
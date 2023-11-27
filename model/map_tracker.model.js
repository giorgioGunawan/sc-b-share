const sql = require("./db.js");
const moment = require("moment");
const momentTz = require('moment-timezone'); // Import the moment-timezone library

// constructor
const MapTracker = function (mapTracker) {
  this.user_id = mapTracker.user_id;
  this.company_id = mapTracker.company_id;
  this.device_id = mapTracker.device_id;
  this.lat = mapTracker.lat;
  this.long = mapTracker.long;
  this.os = mapTracker.os;
  this.full_name = mapTracker.full_name
  this.os_version = mapTracker.os_version
  this.brand_name = mapTracker.brand_name
  this.model_name = mapTracker.model_name
  this.app_version = mapTracker.app_version
  this.build_number = mapTracker.build_number
  this.api_level = mapTracker.api_level
}

MapTracker.createMapTracker = (newTracker, result) => {
    const mapTrackerBody = {
      user_id: newTracker?.user_id,
      company_id: newTracker?.company_id,
      device_id: newTracker?.device_id,
      lat: newTracker?.lat,
      long: newTracker?.long,
      os: newTracker?.os,
      full_name: newTracker?.full_name,
    }
    const deviceBody = {
      user_id: newTracker?.user_id,
      device_id: newTracker.device_id,
      os_name: newTracker?.os,
      os_version: newTracker?.os_version,
      brand_name: newTracker?.brand_name,
      model_name: newTracker?.model_name,
      app_version: newTracker?.app_version,
      build_number: newTracker?.build_number,
      api_level: newTracker?.api_level,
    }

    // If mapTrackerBody.company_id is 38 (logistindo), and indonesian WIB time is 
    // less than 8 AM or more than 6 PM or day is sunday, return early

    // Check if company_id is 38 (logistindo)
    if (mapTrackerBody.company_id == 38 || mapTrackerBody.company_id == 31) {
      const currentTime = momentTz().tz('Asia/Jakarta'); // Get current time in WIB timezone
      // Check if the current time is before 8 AM, after 6 PM, or if it's Sunday
      if (
        currentTime.hour() < 8 ||     // Before 8 AM
        currentTime.hour() >= 18 ||   // After 6 PM
        currentTime.day() === 0       // Sunday (Sunday is represented as 0)
      ) {
        console.log("Returning early due to company_id and time/day condition");
        console.log('hour: ', currentTime.hour())
        console.log('day: ', currentTime.day())

        result(true, "Cannot create MapTracker under these conditions.");
        return;
      }
    }
    sql.query("INSERT INTO `map_tracker` SET ?", mapTrackerBody, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(true, err);
          return;
        }
        // console.log("maptracker has been created: ");
        result(null, { id: res.id, ...newTracker });
    });
    sql.query(`SELECT * FROM device WHERE device_id = '${newTracker?.device_id}' AND user_id = ${newTracker?.user_id}`, (err, res) => {
      if (err) {
        return
      }
      if (!res?.length) {
        sql.query("INSERT INTO `device` SET ?", deviceBody)
      } else {
        sql.query("UPDATE `device` SET user_id = ?, device_id = ?, os_name = ?, os_version = ?, brand_name = ?, model_name = ?, app_version = ?, build_number = ?, api_level = ? WHERE id = ?",
          [
            newTracker?.user_id,
            newTracker?.device_id,
            newTracker?.os,
            newTracker?.os_version,
            newTracker?.brand_name,
            newTracker?.model_name,
            newTracker?.app_version,
            newTracker?.build_number,
            newTracker?.api_level,
            res[0]?.id,
          ]
          )
      }
    })
};

MapTracker.getMapTracker = (result) => {
    sql.query(`select * from map_tracker `, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(true, err);
        return;
      }
      result(null, res);
    });
  };
  
MapTracker.getMapTrackerbyUserId = (params, result) => {
    sql.query(`
      SELECT * FROM map_tracker
          where 
          (
            ${Array.isArray(params.user_id) ? `user_id in (${params.user_id.join(', ')})` : `user_id = ${params.user_id}`}
            ${params.start_date && params.end_date ? `AND created_at >= '${params.start_date}' and created_at <= '${params.end_date}'` : `AND created_at LIKE '%${moment(new Date()).format('YYYY-MM-DD')}%'`}
          )
            ORDER by created_at ASC ${params.limit ? `LIMIT ${params.limit}` : ''} ${params.offset ? `OFFSET ${params.offset}` : ''}`,
      (err, res) => {
        sql.query(`
        SELECT COUNT(*) as total FROM map_tracker
          where 
          (
            ${Array.isArray(params.user_id) ? `user_id in (${params.user_id.join(', ')})` : `user_id = ${params.user_id}`}
            ${params.start_date && params.end_date ? `AND created_at >= '${params.start_date}' and created_at <= '${params.end_date}'` : `AND created_at LIKE '%${moment(new Date()).format('YYYY-MM-DD')}%'`}
          )`
          , (errTotal, total) => {
            if (err) {
              console.log("error: ", err);
              result(true, err);
              return;
            }
            const data = {
              data: res,
              total: total?.[0]?.total ? total?.[0]?.total : 0,
              limit: params.limit,
              offset: params.offset
            }
            result(null, data);
          })
    });
};

module.exports = MapTracker
const Client = require("./client.model.js");
const sql = require("./db.js");
const moment = require("moment")


// constructor
const Schedule = function (schedule) {
  this.schedule_id = schedule.schedule_id,
    this.full_name = schedule.full_name,
    this.client_entity_name = schedule.client_entity_name,
    this.user_id = schedule.user_id,
    this.client_id = schedule.client_id,
    this.schedule_datetime = schedule.schedule_datetime,
    this.predicted_time_spent = schedule.predicted_time_spent,
    this.notes = schedule.notes,
    this.upload_picture = schedule.upload_picture,
    this.check_in_datetime = schedule.check_in_datetime,
    this.check_out_datetime = schedule.check_out_datetime,
    this.reason = schedule.reason,
    this.products = schedule.products,
    this.isLate = schedule.isLate,
    this.exceed_time_limit = schedule.exceed_time_limit
};

//create new schedule
Schedule.createNewSchedule = (newSchedule, result) => {
  sql.query(`Select schedule_id from schedule 
  WHERE 
  '${newSchedule.schedule_datetime}' BETWEEN  schedule_datetime 
  AND DATE_ADD(schedule_datetime, INTERVAL predicted_time_spent MINUTE) 
  AND sales_client_id IN (SELECT sales_client_id FROM sales_client 
  WHERE user_id=${newSchedule.user_id})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("checked user: ", res[0]);
    if (JSON.stringify(res[0]) != undefined) {
      console.log({ schedule_id: "0" })
      result(null, { schedule_id: "0" });
      return;
    } else {
      sql.query(`INSERT INTO schedule (sales_client_id, schedule_datetime, predicted_time_spent, reason) SELECT sales_client_id, '${newSchedule.schedule_datetime}', ${newSchedule.predicted_time_spent}, '${newSchedule.reason}' FROM sales_client WHERE user_id = ${newSchedule.user_id} and client_id = ${newSchedule.client_id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        if (newSchedule?.products?.length) {
          const values = [newSchedule?.products?.map(product_id => {
              return [
                  res.insertId,
                  newSchedule.reason,
                  product_id,
              ]
          })]
          sql.query("INSERT INTO schedule_visiting_reason (schedule_id, visiting_reason_id, product_id) VALUES ?", values, (err, res2) => {
              if (err) {
                  console.log("error: ", err);
                  result(err, null);
                  return;
              }
              result(null, { ...res2, id: res.insertId });
          });
        } else {
          const value = {
            schedule_id: res.insertId,
            visiting_reason_id: newSchedule.reason,
          }
          sql.query("INSERT INTO schedule_visiting_reason SET ?", value, (err, res2) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            result(null, { ...res2, id: res.insertId });
        });
        }
      });
    }
  });

};

Schedule.getAllSchedule = ({limit, offset},result) => {
  sql.query(`SELECT
	s.schedule_id,
    u.full_name,
    c.client_entity_name,
    DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
    s.predicted_time_spent,
    s.notes,
    s.upload_picture,
    DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
    DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime,
    s.reason,
    s.isLate,
    s.exceed_time_limit,
    s.signature,
    co.company_entity_name
    FROM
      schedule s
    LEFT OUTER JOIN sales_client sc
      ON s.sales_client_id = sc.sales_client_id
    LEFT OUTER JOIN user u
      ON u.user_id = sc.user_id
    LEFT OUTER JOIN client c
      ON c.client_id = sc.client_id
    LEFT OUTER JOIN company co
      ON c.company_id = co.company_id
    ORDER by s.schedule_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`,
    (err, res) => {
      sql.query(`
      SELECT
      COUNT(*) as total
      FROM
        schedule s
      LEFT OUTER JOIN sales_client sc
        ON s.sales_client_id = sc.sales_client_id
      LEFT OUTER JOIN user u
        ON u.user_id = sc.user_id
      LEFT OUTER JOIN client c
        ON c.client_id = sc.client_id`,
      (errTotal, total) =>{
          if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
          }
          const editedData = res?.map?.(item => {
            return {
              ...item,
              status: item.check_in_datetime !== '0000-00-00 00:00:00' && item.check_out_datetime !== '0000-00-00 00:00:00' ? 'success' : 'pending'
            }
          })
          
          const data = {
            data: editedData,
            total: total?.[0]?.total ? total?.[0]?.total : 0,
            limit,
            offset
          }
          result(null, data);
        })
  });
};

// This is the old get report that checks for new clients
Schedule.getReportOld = (user_id, start_date, end_date, result) => {
  let schedule_number = 0
  let success = 0
  let new_client = 0
  sql.query(`SELECT u.full_name, COUNT(u.full_name) AS schedule_number
  FROM schedule s 
 LEFT OUTER JOIN sales_client sc 
 ON s.sales_client_id = sc.sales_client_id
 LEFT OUTER JOIN user u
 ON u.user_id = sc.user_id
 WHERE u.user_id = ${user_id} AND s.schedule_datetime BETWEEN '${start_date}' AND '${end_date}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    schedule_number = res[0].schedule_number
    sql.query(`SELECT u.full_name, COUNT(u.full_name) AS success
  FROM schedule s 
 LEFT OUTER JOIN sales_client sc 
 ON s.sales_client_id = sc.sales_client_id
 LEFT OUTER JOIN user u
 ON u.user_id = sc.user_id
 WHERE u.user_id = ${user_id} AND 
 s.schedule_datetime BETWEEN '${start_date}' AND '${end_date}'
 AND s.check_in_datetime != 0 AND s.check_out_datetime != 0
 `, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      success = res[0].success
      // result(null, res[0]);
      sql.query(`SELECT COUNT(*) AS new_client FROM client WHERE created_by = ${user_id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        new_client = res[0].new_client

        result(null, { schedule_number: schedule_number, success: success, new_client: new_client, percentage: schedule_number != 0? success/schedule_number*100: 0 });
      });
    });

    // result(null, res[0]);
  });

};

// New get report that only checks for visits
Schedule.getReport = (user_id, start_date, end_date, result) => {
  sql.query(`
    SELECT 
      u.full_name, 
      COUNT(u.full_name) AS schedule_number, 
      SUM(CASE WHEN s.check_in_datetime != 0 THEN 1 ELSE 0 END) AS success,
      CASE WHEN COUNT(u.full_name) > 0 THEN SUM(CASE WHEN s.check_in_datetime != 0 THEN 1 ELSE 0 END) / COUNT(u.full_name) * 100 ELSE 0 END AS percentage
    FROM user u 
    LEFT OUTER JOIN sales_client sc ON u.user_id = sc.user_id
    LEFT OUTER JOIN schedule s ON sc.sales_client_id = s.sales_client_id 
    WHERE u.user_id = ${user_id} AND s.schedule_datetime BETWEEN '${start_date}' AND '${end_date}'
    GROUP BY u.full_name`, 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.length > 0) {
      result(null, { 
        schedule_number: res[0].schedule_number,
        success: res[0].success,
        new_client: 0,
        percentage: res[0].percentage
      });
    } else {
      result(null, { 
        schedule_number: 0,
        success: 0,
        new_client: 0,
        percentage: 0
      });
    }
  });
};

Schedule.getScheduleByClientId = (client_id, result) => {
  sql.query(
    `
    SELECT s.*, vr.name as reason_name, oc.name as outcome_name, u.full_name
    FROM schedule s
    JOIN sales_client sc ON s.sales_client_id = sc.sales_client_id
    LEFT JOIN visiting_reason vr ON s.reason = vr.id
    LEFT JOIN outcome oc ON s.outcome_id = oc.id
    LEFT JOIN user u ON u.user_id = sc.user_id
    WHERE sc.client_id = ${client_id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      result(null, res);
    });
}

Schedule.getScheduleByCompanyId = (company_id, result) => {
  sql.query(`SELECT
	s.schedule_id,
	u.full_name,
	c.client_entity_name,
	DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
	s.predicted_time_spent,
	s.notes,
	s.upload_picture,
	DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
	DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime,
	s.reason,
  s.isLate,
  s.exceed_time_limit,
  s.signature
FROM
	schedule s
LEFT OUTER JOIN sales_client sc
	ON s.sales_client_id = sc.sales_client_id
LEFT OUTER JOIN user u
	ON u.user_id = sc.user_id
LEFT OUTER JOIN client c
  ON c.client_id = sc.client_id
WHERE
	u.company_id IN (${company_id})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Schedule.getBranchScheduleWithFilter = ({company_id, limit, offset, user_id, client_id, predicted_time_spent, reason, isLate, present, branch_id, client_entity_name, full_name, visiting_reason_id, outcome_id, start_date, end_date}, result) => {
  sql.query(`SELECT
    s.schedule_id,
    u.full_name,
    c.client_entity_name,
    DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
    s.predicted_time_spent,
    s.notes,
    s.upload_picture,
    DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
    DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime,
    s.reason,
    s.isLate,
    s.exceed_time_limit,
    s.signature,
    vr.name as visiting_reason_name,
    s.outcome_id,
    o.name as outcome_name
    FROM
      schedule s
    LEFT OUTER JOIN sales_client sc
      ON s.sales_client_id = sc.sales_client_id
    LEFT OUTER JOIN user u
      ON u.user_id = sc.user_id
    LEFT OUTER JOIN client c
      ON c.client_id = sc.client_id
    LEFT OUTER JOIN schedule_visiting_reason svr
      ON s.schedule_id = svr.schedule_id
    LEFT OUTER JOIN visiting_reason vr
      ON vr.id = svr.visiting_reason_id
    LEFT OUTER JOIN outcome o
      ON o.id = s.outcome_id
    WHERE
      (u.branch_id = ${branch_id} and u.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''} ${predicted_time_spent ? `and s.predicted_time_spent = ${predicted_time_spent}` : ''} ${reason ? `and s.reason = ${reason}` : ''} ${isLate ? `and s.isLate = ${isLate}` : ''} ${present === true ? `and DATE(check_in_datetime) != 0000-00-00` : present === false ? `and DATE(check_in_datetime) = 0000-00-00` : ''} ${visiting_reason_id ? `and svr.visiting_reason_id = ${visiting_reason_id}` : ''} ${outcome_id ? `and s.outcome_id = ${outcome_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        }
      ${start_date && end_date ? `AND (s.schedule_datetime <= '${end_date}') AND (s.schedule_datetime >= '${start_date}')` : ''}
      GROUP BY svr.schedule_id
      ORDER by s.schedule_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`,
  (err, res) => {
    sql.query(`
    SELECT
    COUNT(svr.schedule_id) as total
    FROM
      schedule s
    LEFT OUTER JOIN sales_client sc
      ON s.sales_client_id = sc.sales_client_id
    LEFT OUTER JOIN user u
      ON u.user_id = sc.user_id
    LEFT OUTER JOIN client c
      ON c.client_id = sc.client_id
    LEFT OUTER JOIN schedule_visiting_reason svr
      ON svr.schedule_id = s.schedule_id
    LEFT OUTER JOIN visiting_reason vr
      ON vr.id = svr.visiting_reason_id
    WHERE
      (u.branch_id = ${branch_id} and u.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''} ${predicted_time_spent ? `and s.predicted_time_spent = ${predicted_time_spent}` : ''} ${reason ? `and s.reason = ${reason}` : ''} ${isLate ? `and s.isLate = ${isLate}` : ''} ${present === true ? `and DATE(check_in_datetime) != 0000-00-00` : present === false ? `and DATE(check_in_datetime) = 0000-00-00` : ''} ${visiting_reason_id ? `and svr.visiting_reason_id = ${visiting_reason_id}` : ''} ${outcome_id ? `and s.outcome_id = ${outcome_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        }
      ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : ''}
      `, (errTotal, total) =>{
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
        const editedData = res?.map?.(item => {
          return {
            ...item,
            status: item.check_in_datetime !== '0000-00-00 00:00:00' && item.check_out_datetime !== '0000-00-00 00:00:00' ? 'success' : 'pending'
          }
        })
        const data = {
          data: editedData,
          total: total?.[0]?.total ? total?.[0]?.total : 0,
          limit,
          offset
        }
        result(null, data);
      })
  });
};

Schedule.getScheduleByUserId_v2 = ({user_id, start_date = moment().format('YYYY-MM-DD 00:00:00'), end_date = moment().format('YYYY-MM-DD 23:59:59')}, result) => {
  sql.query(`SELECT
  u.user_id,
  u.full_name,
  s.schedule_id,
  s.reason,
  c.client_id,
  c.client_entity_name,
  c.location,
  c.address,
  DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
  DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
  DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime
  FROM
    schedule s
  LEFT OUTER JOIN sales_client sc
    ON s.sales_client_id = sc.sales_client_id
  LEFT OUTER JOIN user u
    ON u.user_id = sc.user_id
  LEFT OUTER JOIN client c
    ON c.client_id = sc.client_id
  WHERE
    u.user_id = ${user_id}
    ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : `AND s.check_in_datetime LIKE '%${moment(new Date()).format('YYYY-MM-DD')}%'`}
    ORDER BY s.schedule_datetime ASC`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      result(null, res);
    });
};

Schedule.getScheduleById = (id, result) => {
  sql.query(`SELECT
  s.notes,
  s.upload_picture,
  s.signature,
  u.user_id,
  u.full_name,
  s.schedule_id,
  s.reason,
  c.client_id,
  c.client_entity_name,
  c.location,
  c.address,
  c.custom_field,
  o.name as outcome_name,
  DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
  DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
  DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime
  FROM
    schedule s
  LEFT OUTER JOIN sales_client sc
    ON s.sales_client_id = sc.sales_client_id
  LEFT OUTER JOIN user u
    ON u.user_id = sc.user_id
  LEFT OUTER JOIN client c
    ON c.client_id = sc.client_id
  LEFT OUTER JOIN outcome o
    ON o.id = s.outcome_id
  WHERE
    s.schedule_id = ${id}`, (err, schedule) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      sql.query(`
      SELECT vr.id, vr.name, p.id as product_id, p.name as product_name FROM schedule_visiting_reason svr
        INNER JOIN visiting_reason vr
          ON svr.visiting_reason_id = vr.id
        LEFT JOIN product p
          ON svr.product_id = p.id
        WHERE svr.schedule_id = ${id}`, (err, visitingReason) => {
          if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
          }
          result(null, {
            ...schedule?.[0],
            status: schedule.check_in_datetime !== '0000-00-00 00:00:00' && schedule.check_out_datetime !== '0000-00-00 00:00:00' ? 'success' : 'pending',
            visiting_reason: {
              id: visitingReason?.[0]?.id || null,
              name: visitingReason?.[0]?.name || null,
              products: visitingReason?.map?.(item => ({
                id: item.product_id,
                name: item.product_name
              }))?.filter(item => item.name)
            }
          });
        })
    });
};

Schedule.getCompanyScheduleWithFilter = ({company_id, limit, offset, user_id, client_id, predicted_time_spent, reason, isLate, present, client_entity_name, full_name, visiting_reason_id, outcome_id, start_date, end_date}, result) => {
  sql.query(`SELECT
    s.schedule_id,
    u.full_name,
    c.client_entity_name,
    DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
    s.predicted_time_spent,
    s.notes,
    s.upload_picture,
    DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
    DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime,
    s.reason,
    s.isLate,
    s.exceed_time_limit,
    s.signature,
    vr.name as visiting_reason_name,
    s.outcome_id,
    o.name as outcome_name
    FROM
      schedule s
    LEFT OUTER JOIN sales_client sc
      ON s.sales_client_id = sc.sales_client_id
    LEFT OUTER JOIN user u
      ON u.user_id = sc.user_id
    LEFT OUTER JOIN client c
      ON c.client_id = sc.client_id
    LEFT OUTER JOIN schedule_visiting_reason svr
      ON s.schedule_id = svr.schedule_id
    LEFT OUTER JOIN visiting_reason vr
      ON vr.id = svr.visiting_reason_id
    LEFT OUTER JOIN outcome o
      ON o.id = s.outcome_id
    WHERE
      (u.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''} ${predicted_time_spent ? `and s.predicted_time_spent = ${predicted_time_spent}` : ''} ${reason ? `and s.reason = ${reason}` : ''} ${isLate ? `and s.isLate = ${isLate}` : ''} ${present === true ? `and DATE(check_in_datetime) != 0000-00-00` : present === false ? `and DATE(check_in_datetime) = 0000-00-00` : ''} ${visiting_reason_id ? `and svr.visiting_reason_id = ${visiting_reason_id}` : ''} ${outcome_id ? `and s.outcome_id = ${outcome_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        }
      ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : ''}
      GROUP BY svr.schedule_id
      ORDER by s.schedule_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}
      `,
  (err, res) => {
    sql.query(`
    SELECT
    COUNT(svr.schedule_id) as total
    FROM
      schedule s
    LEFT OUTER JOIN sales_client sc
      ON s.sales_client_id = sc.sales_client_id
    LEFT OUTER JOIN user u
      ON u.user_id = sc.user_id
    LEFT OUTER JOIN client c
      ON c.client_id = sc.client_id
    LEFT OUTER JOIN schedule_visiting_reason svr
      ON svr.schedule_id = s.schedule_id
    LEFT OUTER JOIN visiting_reason vr
      ON vr.id = svr.visiting_reason_id
    LEFT OUTER JOIN outcome o
      ON o.id = s.outcome_id
    WHERE
      (u.company_id IN (${company_id}) ${user_id ? `and u.user_id = ${user_id}` : ''} ${client_id ? `and c.client_id = ${client_id}` : ''} ${predicted_time_spent ? `and s.predicted_time_spent = ${predicted_time_spent}` : ''} ${reason ? `and s.reason = ${reason}` : ''} ${isLate ? `and s.isLate = ${isLate}` : ''} ${present === true ? `and DATE(check_in_datetime) != 0000-00-00` : present === false ? `and DATE(check_in_datetime) = 0000-00-00` : ''} ${visiting_reason_id ? `and svr.visiting_reason_id = ${visiting_reason_id}` : ''} ${outcome_id ? `and s.outcome_id = ${outcome_id}` : ''})
      ${
        client_entity_name
          ?
          `AND (c.client_entity_name LIKE '%${client_entity_name}%')`
          :
          ''
        }
      ${
        full_name
          ?
          `AND (u.full_name LIKE '%${full_name}%')`
          :
          ''
        }
      ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : ''}
      `, (errTotal, total) =>{
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
        const editedData = res?.map?.(item => {
          return {
            ...item,
            status: item.check_in_datetime !== '0000-00-00 00:00:00' && item.check_out_datetime !== '0000-00-00 00:00:00' ? 'success' : 'pending'
          }
        })
        
        const data = {
          data: editedData,
          total: total?.[0]?.total ? total?.[0]?.total : 0,
          limit,
          offset
        }
        result(null, data);
      })
  });
};

Schedule.getScheduleByUserId = (user_id, result) => {
  sql.query(`SELECT
  s.schedule_id,
  c.client_id,
  c.client_entity_name,
  DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime,
  DATE_FORMAT(s.check_in_datetime,"%Y-%m-%d %H:%i:%s") as check_in_datetime,
  DATE_FORMAT(s.check_out_datetime,"%Y-%m-%d %H:%i:%s") as check_out_datetime
FROM
	schedule s
LEFT OUTER JOIN sales_client sc
	ON s.sales_client_id = sc.sales_client_id
LEFT OUTER JOIN user u
	ON u.user_id = sc.user_id
LEFT OUTER JOIN client c
  ON c.client_id = sc.client_id
WHERE
  u.user_id = ${user_id}
  ORDER BY s.schedule_datetime ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Schedule.getCheckinScheduleByUserId = (user_id, result) => {
  sql.query(`SELECT
  c.client_id,
  c.client_entity_name,
  s.schedule_id,
  DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime
FROM
	schedule s
LEFT OUTER JOIN sales_client sc
	ON s.sales_client_id = sc.sales_client_id
LEFT OUTER JOIN user u
	ON u.user_id = sc.user_id
LEFT OUTER JOIN client c
  ON c.client_id = sc.client_id
WHERE
  u.user_id = ${user_id} AND s.check_in_datetime='0000-00-00 00:00:00'
  ORDER BY s.schedule_datetime ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Schedule.getCheckoutScheduleByUserId = (user_id, result) => {
  sql.query(`SELECT
  c.client_id,
  c.client_entity_name,
  s.schedule_id,
  DATE_FORMAT(s.schedule_datetime,"%Y-%m-%d %H:%i:%s") as schedule_datetime
FROM
	schedule s
LEFT OUTER JOIN sales_client sc
	ON s.sales_client_id = sc.sales_client_id
LEFT OUTER JOIN user u
	ON u.user_id = sc.user_id
LEFT OUTER JOIN client c
  ON c.client_id = sc.client_id
WHERE
  u.user_id = ${user_id} AND s.check_out_datetime='0000-00-00 00:00:00' AND s.check_in_datetime !='0000-00-00 00:00:00'
  ORDER BY s.schedule_datetime ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Schedule.removeSchedule = (schedule_id, result) => {
  sql.query("DELETE FROM schedule WHERE schedule_id = ?", schedule_id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Client with the compny_id
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res);
  });
};

Schedule.removeAllSchedule = result => {
  sql.query("DELETE FROM schedule", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

Schedule.checkin = ({schedule_id, check_in_datetime, upload_picture}, result) => {
  if (schedule_id == null) {
    return
  }
  let c_datetime = new Date(check_in_datetime)
  //Get Geolocation and check 200m
  sql.query(`SELECT c.* FROM company c  WHERE company_id = (SELECT company_id FROM user WHERE user_id = (SELECT user_id FROM sales_client WHERE sales_client_id = (SELECT sales_client_id FROM schedule WHERE schedule_id = ${schedule_id})))`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(res, 'rezzzzz')
    let late_policy = res[0].late_policy
    sql.query(`SELECT schedule_datetime FROM schedule WHERE schedule_id = ${schedule_id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      let schedule_datetime = new Date(res[0].schedule_datetime)

      var diff = (c_datetime.getTime() - schedule_datetime.getTime()) / 1000;

      diff /= (60 * 60)
      let isLate = 0
      if (late_policy > diff) {
        isLate = 0
      } else {
        isLate = 1
      }
      sql.query(`UPDATE schedule SET check_in_datetime='${check_in_datetime}', isLate=${isLate}, upload_picture_check_in='${upload_picture}' WHERE schedule_id = ${schedule_id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        result(null, res);
      });
    });
    // console.log("Company_Rules: ", late_policy);
    // result(null, res);
  });


};


Schedule.checkout = (schedule_id, check_out_datetime, notes, upload_picture, signature, outcome_id, result) => {

  //Get Geolocation and check 200m
  console.log(schedule_id)
  if (schedule_id == null) {
    return
  }
  let c_datetime = new Date(check_out_datetime)
  //Get Geolocation and check 200m
  sql.query(`SELECT c.* FROM company c  WHERE company_id = (SELECT company_id FROM user WHERE user_id = (SELECT user_id FROM sales_client WHERE sales_client_id = (SELECT sales_client_id FROM schedule WHERE schedule_id = ${schedule_id})))`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    let time_limit_per_schedule = res[0].time_limit_per_schedule
    sql.query(`SELECT check_in_datetime FROM schedule WHERE schedule_id = ${schedule_id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      let check_in_datetime = new Date(res[0].check_in_datetime)

      var diff = (c_datetime.getTime() - check_in_datetime.getTime()) / 1000;

      diff /= (60 * 60)
      console.log(diff)
      let exceed_time_limit = 0
      if (time_limit_per_schedule > diff) {
        exceed_time_limit = 0
      } else {
        exceed_time_limit = 1
      }
      sql.query(`UPDATE schedule SET check_out_datetime='${check_out_datetime}', exceed_time_limit=${exceed_time_limit}, notes='${notes}', upload_picture='${upload_picture}', signature='${signature}', outcome_id=${outcome_id} WHERE schedule_id = ${schedule_id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        result(null, res);
      });
    });
    // console.log("Company_Rules: ", late_policy);
    // result(null, res);
  });
};

Schedule.getCompanyCanvasCheckinFeature = (body, result) => {
  sql.query(`
      SELECT company_id, canvas_checkin_feature FROM company WHERE company_id = ${body?.company_id}
      `, (err, companyResponse) => {
              if (err) {
              const error = {
                  message: 'something went wrong'
              }
              result(error, null);
              return;
          }
          const response = {
            ...companyResponse?.[0],
            canvas_checkin_feature: companyResponse?.[0]?.canvas_checkin_feature?.readUInt8()
          }
          result(null, response);
      }
  )
};

Schedule.getAllCompanyCanvasCheckinFeature = (result) => {
  sql.query(`
      SELECT company_id, company_entity_name, canvas_checkin_feature FROM company
      `, (err, companyResponse) => {
              if (err) {
              const error = {
                  message: 'something went wrong'
              }
              result(error, null);
              return;
          }
          const mappedRes = companyResponse?.map?.(item => {
              const canvas_checkin_feature = item.canvas_checkin_feature?.readUInt8()
              return {
                  ...item,
                  canvas_checkin_feature: !!canvas_checkin_feature
              }
          }) || []
          result(null, mappedRes);
      }
  )
};

Schedule.updateCanvasCheckinFeature = ({canvas_checkin_feature, company_id}, result) => {
  sql.query("UPDATE `company` SET canvas_checkin_feature = ? WHERE company_id = ?",
      [canvas_checkin_feature, company_id],
      (err, res) => {
          if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            }
      
            if (res.affectedRows == 0) {
              // not found company with the id
              result({ message: "not found" }, null);
              return;
            }
            result(null, !!canvas_checkin_feature);
      }
  )
};

Schedule.createNewScheduleWithCheckin = ({
  client_entity_name,
  custom_field,
  address,
  phone_number,
  location,
  company_id,
  schedule_datetime,
  user_id,
  predicted_time_spent,
  reason,
  products,
  check_in_datetime,
  upload_picture
}, result) => {
  Client.createClient({
    client_entity_name,
    custom_field,
    address,
    phone_number,
    location,
    company_id,
    created_by: user_id,
    approved: 1,
  }, (err, res) => {
    if (err) {
      result(true);
      return
    }
    Schedule.createNewSchedule({
      schedule_datetime,
      user_id,
      predicted_time_spent,
      reason,
      client_id: res.id,
      products,
    }, (err, res) => {
      if (err || res.id == 0 || res.schedule_id == 0) {
        result(true);
        return
      }
      Schedule.checkin({schedule_id: res.id, check_in_datetime, upload_picture}, (err, res) => {
        result(null, res)
      })
    })
  })
}

module.exports = Schedule;
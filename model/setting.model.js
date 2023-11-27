const sql = require("./db.js");

const Setting = function() {
  
}

Setting.updateLiveTrackerSetting = (newSetting, result) => {
  sql.query(`SELECT * FROM company WHERE company_id = ${newSetting.company_id}`, (err, res) => {
    if (err || !res.length) {
      const error = {
        message: 'company_id not found'
      }
      result(error, null);
      return;
    }
    sql.query(`SELECT * FROM setting WHERE company_id = ${newSetting.company_id}`, (err, res) => {
      if (err) {
        result(err, null);
        return;
      }
      if (res.length) {
        sql.query(`
        UPDATE setting
        SET latitude='${newSetting.latitude}', longitude=${newSetting.longitude}
        WHERE company_id = ${newSetting.company_id};
        `, (err, res) => {
            if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            }
            result(null, { res });
        });
      } else {
        sql.query(`
        INSERT INTO setting
        SET latitude='${newSetting.latitude}', longitude=${newSetting.longitude}, company_id = ${newSetting.company_id};
        `, (err, res) => {
            if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            }
            result(null, { res });
        });
      }
    })
  })
};

Setting.getLiveTrackerSetting = (company_id, result) => {
  sql.query(`
      SELECT setting.id, setting.company_id, setting.longitude, setting.latitude, company.company_entity_name FROM setting
      RIGHT JOIN company ON setting.company_id = company.company_id
      WHERE company.company_id = ${company_id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res[0]);
  });
};

Setting.getAllLiveTrackerSetting = (body, result) => {
  const { keyword, limit, offset } = body
  sql.query(`
    SELECT setting.id, company.company_id, setting.longitude, setting.latitude, company.company_entity_name FROM setting
    RIGHT JOIN company ON setting.company_id = company.company_id
    ${
      keyword
        ?
        `WHERE (setting.company_id LIKE '%${keyword}%' OR company.company_entity_name LIKE '%${keyword}%' OR setting.latitude LIKE '%${keyword}%' OR setting.longitude LIKE '%${keyword}%')`
        :
        ''
    }
    ORDER by setting.company_id DESC ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}
    `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    sql.query(`
      SELECT COUNT(*) as total FROM setting
      RIGHT JOIN company ON setting.company_id = company.company_id
      ${
        keyword
          ?
          `WHERE (setting.company_id LIKE '%${keyword}%' OR company.company_entity_name LIKE '%${keyword}%' OR setting.latitude LIKE '%${keyword}%' OR setting.longitude LIKE '%${keyword}%')`
          :
          ''
      }
      `, (errTotal, total) => {
          if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
          }
          const data = {
            data: res,
            total: total?.[0]?.total ? total?.[0]?.total : 0,
            limit,
            offset
          }
          result(null, data);
        })
  });
};

module.exports = Setting;
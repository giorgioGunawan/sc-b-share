const sql = require("./db.js");
const moment = require("moment")

const Absent = function() {
  
}

Absent.getAllAbsent = (body, result) => {
    sql.query(`
        SELECT a.*, u.full_name FROM absent a
        LEFT JOIN user u
        ON a.user_id = u.user_id
        WHERE a.company_id = ${body?.company_id}
        ${
            body.start_date
                ?
                `AND (a.check_in_datetime >= '${body?.start_date}')`
                :
                ''
        }
        ${
            body.end_date
                ?
                `AND (a.check_in_datetime <= '${body?.end_date}')`
                :
                ''
        }
        ORDER by a.check_in_datetime DESC ${body.limit ? `LIMIT ${body.limit}` : ''} ${body.offset ? `OFFSET ${body.offset}` : ''}
        `
        , (err, res) => {
            sql.query(`
            SELECT COUNT(*) FROM absent a
            LEFT JOIN user u
            ON a.user_id = u.user_id
            WHERE a.company_id = ${body?.company_id}
            ${
                body.start_date
                    ?
                    `AND (a.check_in_datetime >= '${body?.start_date}')`
                    :
                    ''
            }
            ${
                body.end_date
                    ?
                    `AND (a.check_in_datetime <= '${body?.end_date}')`
                    :
                    ''
            }
            `, (errTotal, total) => {
                if (err) {
                    const error = {
                        message: 'something went wrong'
                    }
                    result(error, null);
                    return;
                }
                const totalCount = total[0]['COUNT(*)']
                const data = {
                    data: res,
                    total: totalCount ?? 0,
                    limit: body.limit,
                    offset: body.offset
                }

                result(null, data);
            })
        }
    )
}

Absent.getAbsent = (body, result) => {
    sql.query(`
        SELECT user_id, check_in_datetime, check_out_datetime FROM absent WHERE user_id = ${body?.user_id} AND check_in_datetime LIKE '%${moment(new Date(body.date)).format('YYYY-MM-DD')}%'
        `, (err, res) => {
                if (err) {
                    const error = {
                        message: 'something went wrong'
                    }
                    result(error, null);
                    return;
                }
                if (!res.length) {
                    const error = {
                        message: 'Not Found',
                        status_code: 404
                    }
                    result(error, null);
                    return;
            }
            result(null, res?.[0]);
        }
    )
};

Absent.getAbsentV2 = (body, result) => {
    sql.query(`
        SELECT id, check_in_datetime, check_out_datetime FROM absent WHERE user_id = ${body?.user_id} AND check_in_datetime LIKE '%${moment(new Date(body.date)).format('YYYY-MM-DD')}%'
        `, (err, absentRes) => {
            if (err) {
                const error = {
                    message: 'something went wrong'
                }
                result(error, null);
                return;
            }
            sql.query(`SELECT absent_feature FROM company WHERE company_id = ${body?.company_id}`
            , (err, companyRes) => {
                console.log(companyRes)
                const absent_feature = !!companyRes?.[0]?.absent_feature?.readUInt8()
                result(null, {
                    id: absentRes?.[0]?.id || null,
                    check_in_datetime: absentRes?.[0]?.check_in_datetime || null, 
                    check_out_datetime: absentRes?.[0]?.check_out_datetime || null,
                    absent_feature
                });
            })
        }
    )
};

Absent.checkin = (body, result) => {
    sql.query(`
        SELECT check_in_datetime FROM absent WHERE user_id = ${body.user_id} AND check_in_datetime LIKE '%${moment(new Date(body.check_in_datetime)).format('YYYY-MM-DD')}%'
        `, (err, res) => {
            if (err) {
                const error = {
                    message: 'something went wrong'
                }
                result(error, null);
                return;
            }
            const isCheckin = !!res?.[0]?.check_in_datetime;
            if (isCheckin) {
                const error = {
                    message: 'Already Checkin'
                }
                result(error, null);
                return
            }
            sql.query("INSERT INTO `absent` SET ?", body, (err, res) => {
                if (err) {
                  console.log("error: ", err);
                  result(true, err);
                  return;
                }
                console.log("absent has been created: ");
                result(null, { id: res.id, ...body });
            });
        }
    )
};

Absent.checkout = (body, result) => {
    sql.query(`
        SELECT id FROM absent WHERE user_id = ${body.user_id} AND DATE(check_in_datetime) LIKE '%${moment(new Date(body.check_out_datetime)).format('YYYY-MM-DD')}%'
        `, (err, res) => {
            if (err) {
                const error = {
                    message: 'something went wrong'
                }
                console.log(err);
                result(error, null);
                return;
            }
            if (!res.length) {
                const error = {
                    message: 'Need Checkin First'
                }
                result(error, null);
                return
            }
            const item = res?.[0]
            const isCheckout = !!item?.check_out_datetime;
            if (isCheckout) {
                const error = {
                    message: 'Already Checkout'
                }
                result(error, null);
                return
            }
            const update_id = res[0].id;
            const fields = [
                body.check_out_datetime,
                body.check_out_image,
                body.check_out_lat,
                body.check_out_long,
                body.overtime_notes,
                update_id,
            ]

            sql.query("UPDATE `absent` SET check_out_datetime = ?, check_out_image = ?, check_out_lat = ?, check_out_long = ?, overtime_notes = ? WHERE id = ?", fields, (err, res) => {
                if (err) {
                  console.log("error: ", err);
                  result(true, err);
                  return;
                }
                result(null, { id: update_id, ...body });
            });
        }
    )
};

Absent.getAllCompanyAbsentFeature = (result) => {
    sql.query(`
        SELECT company_id, company_entity_name, absent_feature FROM company
        `, (err, companyResponse) => {
                if (err) {
                const error = {
                    message: 'something went wrong'
                }
                result(error, null);
                return;
            }
            const mappedRes = companyResponse?.map?.(item => {
                const absent_feature = item.absent_feature?.readUInt8()
                return {
                    ...item,
                    absent_feature: !!absent_feature
                }
            }) || []
            result(null, mappedRes);
        }
    )
};

Absent.updateAbsentFeature = ({absent_feature, company_id}, result) => {
    sql.query("UPDATE `company` SET absent_feature = ? WHERE company_id = ?",
        [absent_feature, company_id],
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
              result(null, !!absent_feature);
        }
    )
};

Absent.getAllCompanyAllowSelfCreateFeature = (result) => {
    sql.query(`
        SELECT company_id, company_entity_name, allow_self_create_client FROM company
        `, (err, companyResponse) => {
                if (err) {
                const error = {
                    message: 'something went wrong'
                }
                result(error, null);
                return;
            }
            
            const mappedRes = companyResponse?.map?.(item => {
                const allow_self_create_client = item.allow_self_create_client?.readUInt8()
                console.log('56',!!item.allow_self_create_client?.readUInt8())
                return {
                    ...item,
                    allow_self_create_client: !!allow_self_create_client
                }
            }) || []
            result(null, mappedRes);
        }
    )
};

Absent.updateAllowSelfCreateFeature = ({allow_self_create_client, company_id}, result) => {
    sql.query("UPDATE `company` SET allow_self_create_client = ? WHERE company_id = ?",
        [allow_self_create_client, company_id],
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
              result(null, !!allow_self_create_client);
        }
    )
};

module.exports = Absent;
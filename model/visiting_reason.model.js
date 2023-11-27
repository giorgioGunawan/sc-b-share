const sql = require("./db.js");

const VR = function() {
  
}

VR.getAllVisitingReason = (company_id, result) => {
    sql.query(`
        SELECT company_id, company_entity_name FROM company WHERE company_id = ${company_id}
        `, (err, companyResponse) => {
                if (err || !companyResponse.length) {
                const error = {
                    message: 'company_id not found'
                }
                result(error, null);
                return;
            }
            sql.query(`
                SELECT *  FROM visiting_reason WHERE company_id = ${company_id}
                `, (err, visitingReasonResponse) => {
                        if (err || !visitingReasonResponse.length) {
                        const error = {
                            message: 'company_id not found'
                        }
                        result(error, null);
                        return;
                    }
                    result(null, {
                        ...companyResponse[0],
                        data: visitingReasonResponse
                    });
                }
            )
        }
    )
};

VR.getVisitingReasonById = (id, result) => {
    sql.query(`
        SELECT visiting_reason.*, company.company_entity_name FROM visiting_reason
        INNER JOIN company ON visiting_reason.company_id = company.company_id
        WHERE visiting_reason.id = ${id}
        `,
        (err, res) => {
            if (err || !res.length) {
            const error = {
                message: 'id not found'
            }
            result(error, null);
            return;
            }
            result(null, res[0]);
    })
};

VR.createVisitingReason = (newVisitingReason, result) => {
    sql.query(`SELECT * FROM company WHERE company_id = ${newVisitingReason.company_id}`, (err, res) => {
        if (err || !res.length) {
          const error = {
            message: 'company_id not found'
          }
          result(error, null);
          return;
        }
        sql.query(`
            INSERT INTO visiting_reason
            SET name='${newVisitingReason.name}', description='${newVisitingReason.description}', company_id = ${newVisitingReason.company_id}, include_product = ${newVisitingReason.include_product};
            `, (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                result(null, { res });
        });
    })
};

VR.updateVisitingReason = (body, result) => {
    sql.query(
        'UPDATE visiting_reason SET `name`=?, `description`=?, `include_product`=? WHERE id = ?', [body.name, body.description, body.include_product, body.id],
        (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }
    
          if (res.affectedRows == 0) {
            // not found company with the id
            result({ kind: "not_found" }, null);
            return;
          }
          result(null, { id: body.id, status: 201 });
        }
    );
}
VR.deleteVisitingReason = (id, result) => {
    sql.query(
        `DELETE FROM visiting_reason WHERE id = ${id}`
        , (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            result(null, { res });
    });
}

VR.getVisitingReasonReport = ({ company_id, start_date, end_date }, result) => {
    sql.query(`
        SELECT company_id, company_entity_name FROM company WHERE company_id = ${company_id}
        `, (err, companyResponse) => {
                if (err || !companyResponse.length) {
                const error = {
                    message: 'company_id not found'
                }
                result(error, null);
                return;
            }
            sql.query(`
                SELECT vr.*, COUNT(*) as total_schedule FROM schedule_visiting_reason svr
                LEFT OUTER JOIN visiting_reason vr
                    ON svr.visiting_reason_id = vr.id
                LEFT OUTER JOIN schedule s
                    ON s.schedule_id = svr.schedule_id
                WHERE vr.company_id = ${company_id}
                ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : ''}
                GROUP BY svr.visiting_reason_id
                `, (err, visitingReasonResponse) => {
                        if (err) {
                        const error = {
                            message: 'Something wrong'
                        }
                        result(error, null);
                        return;
                    }
                    result(null, {
                        ...companyResponse[0],
                        data: visitingReasonResponse
                    });
                }
            )
        }
    )
};

module.exports = VR;
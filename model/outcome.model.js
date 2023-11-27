const sql = require("./db.js");

const Outcome = function() {
  
}

Outcome.getAllOutcome = (company_id, result) => {
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
                SELECT * FROM outcome WHERE company_id = ${company_id}
                `, (err, outcomeResponse) => {
                        if (err) {
                            result(true, null);
                            return;
                        }
                        if (!outcomeResponse.length) {
                            const error = {
                                message: 'Outcome not found'
                            }
                            result(error, null);
                            return;
                        }
                    result(null, {
                        ...companyResponse[0],
                        data: outcomeResponse
                    });
                }
            )
        }
    )
};

Outcome.getOutcomeById = (id, result) => {
    sql.query(`
        SELECT outcome.*, company.company_entity_name FROM outcome
        INNER JOIN company ON outcome.company_id = company.company_id
        WHERE outcome.id = ${id}
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

Outcome.createOutcome = (newOutcome, result) => {
    if (!newOutcome.name.length) {
        result({}, null);
    }
    sql.query(`SELECT * FROM company WHERE company_id = ${newOutcome.company_id}`, (err, res) => {
        if (err || !res.length) {
          const error = {
            message: 'company_id not found'
          }
          result(error, null);
          return;
        }
        sql.query(`
            INSERT INTO outcome
            SET name='${newOutcome.name}', description='${newOutcome.description}', company_id = ${newOutcome.company_id};
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

Outcome.updateOutcome = (body, result) => {
    sql.query(
        'UPDATE outcome SET `name`=?, `description`=? WHERE id = ?', [body.name, body.description, body.id],
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
Outcome.deleteOutcome = (id, result) => {
    sql.query(`
        DELETE outcome FROM outcome WHERE id = ${id}
        `,
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            result(null, res[0]);
    })
}

Outcome.getOutcomeReport = ({ company_id, start_date, end_date }, result) => {
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
                SELECT o.*, COUNT(*) as total_schedule FROM schedule s
                LEFT OUTER JOIN outcome o
                    ON o.id = s.outcome_id
                WHERE o.company_id = ${company_id}
                ${start_date && end_date ? `AND s.check_in_datetime >= '${start_date}' and s.check_in_datetime <= '${end_date}'` : ''}
                GROUP BY o.id
                `, (err, outcomeResponse) => {
                        if (err) {
                        const error = {
                            message: 'Something wrong'
                        }
                        result(error, null);
                        return;
                    }
                    result(null, {
                        ...companyResponse[0],
                        data: outcomeResponse
                    });
                }
            )
        }
    )
};

module.exports = Outcome;
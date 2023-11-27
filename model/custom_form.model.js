const sql = require("./db.js");

const CF = function() {
  
}

CF.getCustomUploadField = ({ company_id, form_name }, result) => {
    sql.query(`
        SELECT custom_upload_field.*, form.name FROM custom_upload_field
        INNER JOIN form ON custom_upload_field.form_id = form.id
        WHERE custom_upload_field.company_id = ${company_id} AND form.name = '${form_name}'
        `, (err, customUploadFieldResponse) => {
                console.log(customUploadFieldResponse, err, 'customUploadFieldResponse')
                if (err) {
                const error = {
                    message: 'Some error occurred.'
                }
                result(error, null);
                return;
            }
            const response = {
                id: customUploadFieldResponse?.[0]?.id || null,
                form_id: customUploadFieldResponse?.[0]?.form_id || null,
                company_id,
                form_name,
                enable: !!customUploadFieldResponse?.[0]?.enable,
                required: !!customUploadFieldResponse?.[0]?.required,
            }
            result(null, response);
        }
    )
};

CF.getAllCustomUploadField = (company_id, result) => {
    sql.query(`
        SELECT id, name FROM form
        `, (err, formResponse) => {
                if (err || !formResponse.length) {
                const error = {
                    message: 'company_id not found'
                }
                result(error, null);
                return;
            }
            sql.query(`
                SELECT * FROM custom_upload_field WHERE company_id = ${company_id}
                `, (err, customUploadFieldResponse) => {
                        if (err) {
                        const error = {
                            message: 'Some error occurred.'
                        }
                        result(error, null);
                        return;
                    }
                    const response = formResponse?.map?.((form) => {
                        const customUploadField = customUploadFieldResponse?.find?.((item) => item.form_id === form.id);
                        if (customUploadField) {
                            return {
                                id: customUploadField.id,
                                form_id: form.id,
                                company_id,
                                form_name: form.name,
                                enable: !!customUploadField.enable,
                                required: !!customUploadField.required,
                            }
                        }
                        return {
                            id: null,
                            form_id: form.id,
                            company_id,
                            form_name: form.name,
                            enable: false,
                            required: false,
                        }
                    })
                    result(null, response);
                }
            )
        }
    )
};

CF.createCustomUploadField = (body, result) => {
    sql.query(`SELECT * FROM company WHERE company_id = ${body.company_id}`, (err, res) => {
        if (err || !res.length) {
          const error = {
            message: 'company_id not found'
          }
          result(error, null);
          return;
        }
        sql.query(`
            INSERT INTO custom_upload_field
            SET company_id='${body.company_id}', form_id='${body.form_id}', enable = ${body.enable}, required = ${body.required};
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

CF.updateCustomUploadField = (body, result) => {
    if (body.id === undefined || body.id === null) {
        CF.createCustomUploadField(body, result);
        return;
    }
    sql.query(
        'UPDATE custom_upload_field SET `company_id`=?, `form_id`=?, `enable`=?, `required`=? WHERE id = ?', [body.company_id, body.form_id, body.enable, body.required, body.id],
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
          result(null, { id: body.id || res?.insertedId, status: 201 });
        }
    );
}

module.exports = CF
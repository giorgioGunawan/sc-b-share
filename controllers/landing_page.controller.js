exports.sendEmail = (req, res) => {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
    
     // Create an email
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'throwawayscouthippo@gmail.com',
        pass: 'vydiqnjpurnhzjld'
    }
    });

    var mailOptions = {
    from: 'throwawayscouthippo@gmail.com',
    to: ['scouthippo@gmail.com', req.body.email],
    subject: 'Landing page funnel from ' + req.body.name + ', Email: ' + req.body.email,
    text: 'Email: ' + req.body.email + ' came from the landing page. Message: ' + req.body.message,
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send({
            message: "Success!"
          });
          /*
        res.status(200).send(response(true, {
            payload: {},
            message: 'success',
            status_code: 200
        }));*/
    }
    });
  };
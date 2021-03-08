var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var User = require('../models/user');


var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// Sending mail
router.get('/forgetpassword/:useremail', (req, res, next) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
  });

  var mailOptions = {
    from: 'youremail@gmail.com',
    to: req.params.useremail,
    subject: 'Password Reset',
    message: 'Click the link to reset your password: http://localhost:3000/reset.html?&email=' + req.params.useremail
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      err.status = 403;
      return next(err);
    }
    else {
      res.send('Email sent: ' + info.response);
    }
  });
});


// Resetting password
router.post('/resetpassword/:email', (req, res, next) => {
  User.findOne({username: req.params.email}).then((user) => {

    user.setPassword(req.body.newPassword);
    user.save().then((user) => {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.send({msg: 'success'});

    });

  }, (err) => next(err))
  .catch((err) => next(err));
});



module.exports = router;

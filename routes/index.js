var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var User = require('../models/user');
var Appointment = require('../models/appointment');
var authenticate = require('../authenticate');
var connectEnsureLogin = require('connect-ensure-login');
const { use } = require('passport');

var userSessionId;

var router = express.Router();
router.use(bodyParser.json());


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// GET for destroying session
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/login.html');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});


// GET Users
router.get('/user', (req, res, next) => {
  userSessionId = req.session;

  if (userSessionId.Id) {

    User.findById(userSessionId.Id).then((user) => {

      if (user != null) {
  
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
  
      }
      else {
        var err = new Error('Administrator not found!');
        err.status = 404;
        return next(err);
      }
  
    }, (err) => next(err))
    .catch((err) => next(err));

  }

});


// GET userinfo for select options
router.get('/userappointment/:userId', (req, res, next) => {
  Appointment.findOne({_id: req.params.userId}).then((userAppointment) => {

    if (userAppointment != null) {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(userAppointment);
    }
    else {
      var err = new Error('Applicant not found!');
      err.status = 404;
      return next(err);
    }

  }, (err) => next(err))
  .catch((err) => next(err));
});


// GET Appointments
router.get('/appointments', (req, res, next) => {
  Appointment.find({}).then((appointments) => {

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.send(appointments);

  }, (err) => next(err))
  .catch((err) => next(err));
});


// GET Today Appointments
router.get('/todayappointments', (req, res, next) => {

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  
  Appointment.find({bookingDate: today, status: 'Pending'}, (err, appointments) => {

    if (err) {
      console.log(err);
    }
    res.json({data: appointments});
  });
});


// GET Today Appointments dates
router.get('/selectappointmentdates', (req, res, next) => {

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  
  Appointment.find({bookingDate: today, status: 'Pending'}, (err, appointments) => {

    if (err) {
      console.log(err);
    }
    res.json(appointments);
  });
});


// POST for registering new applicants
router.post('/register', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if (err) {
      res.send({err: err});
    }
    if (req.body.name)
    user.name = req.body.name;
    if (req.body.phoneNumber)
    user.phoneNumber = req.body.phoneNumber;
    if (req.body.location)
    user.location = req.body.location;
    if (req.body.admin)
    user.admin = req.body.admin;
    user.save((err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.send({err: err});
        return;
      }
      else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.send({msg: 'success'});
      }
    });
  });
});


// POST for loggoing applicant or user in
router.post('/login', (req, res, next) => {
  userSessionId = req.session;

  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      res.send({msg: 'Login Unsuccessful!', err: 'Email and Password not found!'});
    }
    req.login(user, (err) => {
      if (err) {
        res.send({msg: 'Login Unsuccessful!', err: 'Email or Password invalid' + err});
      }

      userSessionId.Id = user._id;
      
      res.send({msg: 'success', admin: user.admin, userId: user._id});
    });

  })(req, res, next);
});


// POST a appointment
router.post('/appointment', (req, res, next) => {
  Appointment.find({}).then((appointments) => {

    if (appointments.length !== 0) {

      if (appointments != null) {

        for(var i = 0; i < appointments.length; i++) {
          if (req.body.bookingDate === appointments[i].bookingDate && req.body.bookingTime === appointments[i].bookingTime) {
            res.send({err: '<strong>Appointment date and time already scheduled!</strong>&nbsp;&nbsp;Please choose different time.'});
            return false;
          }
        }
        
        Appointment.create(req.body).then((appointment) => {
  
          res.statusCode = 200;
          res.send({msg: 'success'});
  
        }, (err) => next(err))
        .catch((err) => next(err));

      }
      else {
        res.send({err: 'Appointment not found!'});
        return false;
      }

    }
    else {
      Appointment.create(req.body).then((appointment) => {

        res.statusCode = 200;
        res.send({msg: 'success'});

      }, (err) => next(err))
      .catch((err) => next(err));
    }

  }, (err) => next(err))
  .catch((err) => next(err));
});


// POST for password change
router.post('/changepassword', (req, res, next) => {
  userSessionId = req.session;

  if (userSessionId.Id) {
    User.findOne({_id: userSessionId.Id}).then((user) => {

      user.changePassword(req.body.oldPassword, req.body.newPassword, (err, user) => {

        if (err) {
          res.send({err: '<strong>Sorry!</strong>&nbsp;&nbsp;Password not found!'});
          return false;
        }
        else {
          res.send({msg: 'success'});
        }
      });

    }, (err) => next(err))
    .catch((err) => next(err));
  }
  
});


// PUT to complete applicant status
router.put('/appointmentcompleted/:userId', (req, res, next) => {
  Appointment.findByIdAndUpdate(req.params.userId, {

    $set: {"status": "Completed"}

  }, {new: true}).then((appointment) => {

    res.send({msg: 'success'});

  }, (err) => next(err))
  .catch((err) => next(err));

});


module.exports = router;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentModel = new Schema({
    name: String,
    phoneNumber: String,
    location: String,
    bookingType: String,
    bookingDate: String,
    bookingTime: String,
    comment: String,
    status: {
        type: String,
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentModel);
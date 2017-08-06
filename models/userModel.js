const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bcrypt = require('bcryptjs');

const robotSchema = new mongoose.Schema({
    id: { type: Number },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true},
    avatar: { type: String, default: null },
    email: { type: String, require:true},
    university: { type: String, default: null },
    job: { type: String, default: null },
    company: { type: String, default: null },
    skills: [],
    phone: { type: String, default: null },
    address: {
        street_num: { type: String, default: null },
        street_name: { type: String, default: null },
        city: { type: String, default: null },
        state_or_province: { type: String, default: null },
        country: { type: String, default: null }
    }
})

robotSchema.statics.getAllUsers = function (callback) {
    return this.find();
}
robotSchema.statics.updateUser = function (userName, updateData, callback) {
    var query = { username: userName };
    return this.findOneAndUpdate(query, updateData, { new: true, upsert: true })
}

//Query
robotSchema.query.country = function (country, callback) {
    return this.where({ "address.country": country });
};
robotSchema.query.skill = function (skill, callback) {
    return this.where({ skills: skill });
}
robotSchema.query.employed = function (employed, callback) {
    let query = employed ? { company: { $not: { $type: 10 } } } : { company: null }
    return this.where(query);
}
//Model
const RobotModel = mongoose.model('users', robotSchema)

module.exports = RobotModel;

module.exports.createUser = function (newUser, callback) {
    const hash = bcrypt.hashSync(newUser.password, 8);
    newUser.password = hash;
    return newUser.save();
}
module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username };
    RobotModel.findOne(query, callback);
}
module.exports.getUserById = function (id, callback) {
    RobotModel.findById(id, callback);
}

module.exports.comparePassword = function (inputPassword, password, callback) {
    bcrypt.compare(inputPassword, password, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

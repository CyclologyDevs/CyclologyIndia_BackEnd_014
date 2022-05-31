const db = require('../config/database');
var bcrypt = require('bcrypt');

const update_password = async (req, res, next) => {
    var salty = bcrypt.genSaltSync(10);
    var data = {
        password: await bcrypt.hashSync(req.body.password, salty),
    }
    // console.log(data)
    db.run(
        `UPDATE users set 
           password = COALESCE(?,Password)
           WHERE token = ?`,
        [data.password, req.body.token],
        function (err, result) {
            if (err) {
                console.log("Error Occured while Password Reset where token is ",req.body.token)
                console.error(err.message);
                return res.status(500).send("Error Occured while Password Reset where token is ",req.body.token)
              }

            console.log("Password Reset Done where token is ",req.body.token)

            res.status(200).json({
                message: "success",
                data: data,
                changes: this.changes
            })
        });
}

module.exports = update_password
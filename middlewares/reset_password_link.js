const db = require('../config/database');
const sendEmail = require('./email')
const randtoken = require('rand-token')

const reset_password_email = async function (req, res, next) {

    var email = req.body.email;

    var sql = 'SELECT * FROM users WHERE email = ?'

    await db.all(sql, email, (err, result) => {
        if (err) {
            console.log("Error Occured while Forget Password where email ",email);
            console.error(err.message);
            return res.status(500).send("Error Occured while while Forget Password where email ",email);
          }

        var type = ''
        var msg = ''

        
        if (result[0].email.length > 0) {

            var token = randtoken.generate(20);
            var sent = sendEmail(email, token);

            if (sent != '0') {

                var data = {
                    token: token
                }

                var sql1 = 'UPDATE users SET email = COALESCE(?,Email) WHERE email = ?' 

                db.run( sql1, email, data, (err, result) => {
                    if (err) {
                        console.log("Error Occured while Forget Password email where email ",email);
                        console.error(err.message);
                        return res.status(500).send("Error Occured while while Forget Password email where email ",email);
                      }

                })

                db.run(
                    `UPDATE users set  
                       token = COALESCE(?,token)
                       WHERE email = ?`,
                    [data.token, req.body.email],
                     (err, result) => {
                        if (err) {
                            console.log("Error Occured while Forget Password update_password where email ",email);
                            console.error(err.message);
                            return res.status(500).send("Error Occured while while Forget Password update_password where email ",email);
                          }
                       
                    });

                type = 'success';
                msg = 'The reset password link has been sent to your email address';
                console.log("Password Reset LINK send for email",email)

            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
                console.log("Password Reset LINK NOT send for email",email)
            }

        } else {
            type = 'error';
            msg = 'The Email is not registered with us';
            console.log("Password Reset LINK NOT send as account does not exits for email",email)

        }

        res.redirect('/');
    });
}

module.exports = reset_password_email
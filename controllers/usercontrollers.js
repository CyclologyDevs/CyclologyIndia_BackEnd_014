const express = require('express');
const app = express();

require("dotenv").config();
const cookieParser = require("cookie-parser");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
app.use(cookieParser());

const db = require('../config/database');   //For DataBase Connection



// * R E G I S T E R   N E W   U S E R

const register = async (req, res) => {
    var errors = []
    try {
        const { fname, lname, email, password, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, } = req.body;

        if (!fname) {
            errors.push("Firstname is missing");
        }
        if (!lname) {
            errors.push("Lastname is missing");
        }
        if (phone_number === emergency_contact) {
            errors.push("Try different phone number");
        }
        if (!email) {
            errors.push("Email is missing");
        }
        if (!password) {
            errors.push("Password is missing");
        }
        if (errors.length) {
            res.status(400).json({ "error": errors.join(", ") });
            return;
        }       

        var sql = "SELECT * FROM users WHERE email = ?"
        await db.all(sql, email, async (err, result) => {
            if (err) {
                res.status(402).json({ "error": err.message });
                return;
            }

            if (result.length == 0) {
                var data = {
                    uuid: Date.now(),
                    fname: fname,
                    lname: lname,
                    email: email,
                    password: bcrypt.hashSync(password, salt),
                    phone_number: phone_number,
                    gender: gender,
                    date_of_birth: date_of_birth,
                    blood_group: blood_group,
                    emergency_contact: emergency_contact,
	                relation_emergency_contact: relation_emergency_contact,
	                insta_link: insta_link,
	                facebook_link: facebook_link,
	                twitter_link: twitter_link,
	                linkdin_link: linkdin_link,
	                occupation: occupation,
	                about_you: about_you,
	                accident_insurance_number: accident_insurance_number,
                    DateCreated: Date('now')
                }

                var sql = 'INSERT INTO users (uuid, fname, lname, email, password, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, DateCreated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                var params = [data.uuid, data.fname, data.lname, data.email, data.password, data.phone_number, data.gender, data.date_of_birth, data.blood_group, data.emergency_contact, data.relation_emergency_contact, data.insta_link, data.facebook_link, data.twitter_link, data.linkdin_link, data.occupation, data.about_you, data.accident_insurance_number, Date('now')]
                await db.run(sql, params, (err, innerResult) => {
                    if (err) {                        
                        res.status(400).json({ "error": err.message })
                        return;
                    }
                    res.status(201).send("Success1");
                    console.log("User Created")
                });
            }

            else {
                res.status(400).send("User Already Exist. Please Login");  
                return;
            }
        });
    } catch (err) {
        console.log(err);
    }
}


// * L O G I N

const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        // console.log( email, password );
        // Make sure there is an Email and Password in the request
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }

        const user = [];

        var sql = "SELECT * FROM users WHERE email = ?";
        db.all(sql, email, async function (err, rows) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }

            if(rows.length == 0){
                // console.log("No Email Match Found!");
                return res.status(400).send("No Match");
            }
            rows.forEach(function (row) {;
                user.push(row);
            })

            //console.log(password);
            // console.log(user[0].password);
            var PHash = await bcrypt.compare(password, user[0].password);
            

            if (PHash) {
                // * CREATE JWT TOKEN
                var token = jwt.sign(
                    { user_uuid: user[0].uuid, username: user[0].fname, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
                    }
                );

                db.run(`UPDATE users SET DateLoggedIn = COALESCE(?,DateLoggedIn) WHERE email = ?`,
                    [Date('now'), req.body.email], (err) => {
                        if (err) {
                            res.status(400).json({ "error": err.message })
                            return;
                        }
                    }
                    
                    )

            } else {
                // console.log("No Password Match Found!");
                return res.status(400).send("No Match");
            }

            //    return res.status(200).send(user);   
            //return res.cookie('jwt', token, { httpOnly: true }).send(user).status(200)
            return res.cookie('jwt', token).send(user).status(200)
        });

    } catch (err) {
        console.log(err);
    }
};



// * L O G O U T

  const logout = (req, res) => {
    res.clearCookie("jwt", { path: '/' })
    res.status(200).send("User Logged Out")
};


// * T E S T  

const auth = async (req, res) => {
    res.status(200).send("Token Works - Yay!");
};


// * A L L U S E R

const alluser = (req, res, next) => {
    var sql = "select * from users"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success2",
            "data": rows
        })
    });
};


// * S I N G L E U S E R

const single = (req, res, next) => {
    var sql = "select * from users where uuid = ?"
    var params = [req.params.uuid]
    db.all(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        else if(row.length == 0) {
            res.status(400).send(`NO Users found for uuid =  ${params}`);
            return;
        }
        res.json({
            "message": "success3",
            "data": row
        })
    });
};


// * U P D A T E   U S E R

const update = async (req, res, next) => {
    var salty = bcrypt.genSaltSync(10);
    var data = {
        phone: req.body.phone,
        email: req.body.email,
        // password: req.body.password ? bcrypt.hashSync(req.body.password, salty) : null,
        password: await bcrypt.hashSync(req.body.password, salty),
    }
    // console.log(data)
    db.run(
        `UPDATE users set 
           phone = COALESCE(?,phone), 
           email = COALESCE(?,email), 
           password = COALESCE(?,Password)
           WHERE uuid = ?`,
        [data.phone, data.email, data.password, req.params.uuid],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success4",
                data: data,
                changes: this.changes
            })
        });
}


// * D E L E T E   U S E R

const deleteit = (req, res, next) => {
    db.run(
        'DELETE FROM users WHERE uuid = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
}




module.exports = {
    register,
    login,
    logout,
    auth,
    alluser,
    single,
    update,
    deleteit
}
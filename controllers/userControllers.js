const express = require('express');
const app = express();
require("dotenv").config();
const fs = require('fs');
const path = require('path'); 
const cookieParser = require("cookie-parser");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const UUID = require('uuid-int');
const salt = bcrypt.genSaltSync(10);
app.use(cookieParser());
const db = require('../config/database');   //For DataBase Connection



// * R E G I S T E R   N E W   U S E R

const register = async (req, res) => {
    var errors = [];
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
            console.log("IMP field MISSINGING while Registering");
            return res.status(400).json({ "error": errors.join(", ") });
        }       


        const sql = "SELECT * FROM users WHERE email = ?";
        
        if(!req.file) {
            await db.all(sql, email, async (err, result) => {
                if (err) {
                    console.log("Error Occured while registering Email ",email);
                    console.error(err.message);
                    return res.status(500).send("Error Occured while registering Email ",email);
                  }
	   	 
                if (result.length == 0) {
                    var data = {
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

                    var sql = 'INSERT INTO users (fname, lname, email, password, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, DateCreated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                    var params = [data.fname, data.lname, data.email, data.password, data.phone_number, data.gender, data.date_of_birth, data.blood_group, data.emergency_contact, data.relation_emergency_contact, data.insta_link, data.facebook_link, data.twitter_link, data.linkdin_link, data.occupation, data.about_you, data.accident_insurance_number, Date('now')]
                    await db.run(sql, params, (err, innerResult) => {
                        if (err) {
                            console.log("Error Occured while insert registering Email ",email);
                            console.error(err.message);
                            return res.status(500).send("Error Occured while insert registering Email ",email);
                          }

                        console.log("Accounted Created for Email",data.email)
                        return res.status(201).send("Success1");
                    });
                }
    
                else {
                    console.log("Accounted Already Exits for Email",data.email)
                    return res.status(400).send("User Already Exist. Please Login");  
                }
            });

        } else {
            await db.all(sql, email, async (err, result) => {
                if (err) {
                    console.log("Error Occured while registering Email ",email);
                    console.error(err.message);
                    return res.status(500).send("Error Occured while registering Email ",email);
                  }
                    
                if (result.length == 0) {
                    var data = {
                        filename: req.file.filename,
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
    
                    
                    var dir = `./ProfilePics/${data.email}/`;
    
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    var oldPath = `./ProfilePics/${req.file.filename}`
                    var newPath = `./ProfilePics/${data.email}/${req.file.filename}.jpg`;
                
                    fs.rename(oldPath, newPath, function (err) {
                        if (err) {
                            console.log("Error Occured while IMG upload Email ",data.email);
                            console.error(err.message);
                            return res.status(500).send("Error Occured while  IMG upload Email ",data.email);
                          }
                        console.log('Image uploaded Successfully for email',data.email)
                    })
                    
    
                    var sql = 'INSERT INTO users (filename, fname, lname, email, password, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, DateCreated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                    var params = [data.filename, data.fname, data.lname, data.email, data.password, data.phone_number, data.gender, data.date_of_birth, data.blood_group, data.emergency_contact, data.relation_emergency_contact, data.insta_link, data.facebook_link, data.twitter_link, data.linkdin_link, data.occupation, data.about_you, data.accident_insurance_number, Date('now')]
                    await db.run(sql, params, (err, innerResult) => {
                        if(err) {
                            console.log("Error Occured while insert registering Email ",data.email);
                            console.error(err.message);
                            return res.status(500).send("Error Occured while insert registering Email ",data.email);
                          }

                          console.log("Accounted Created for Email",data.email)
                          return res.status(201).send("Success1");
                    });
                }
    
                else {
                    let oldPath = `./ProfilePics/${req.file.filename}`;
                    if( fs.existsSync(oldPath) )
                        fs.unlinkSync(oldPath);
                    
                        console.log("Accounted Already Exits for Email",data.email)
                        return res.status(400).send("User Already Exist. Please Login");  
                }
            });
        }

        } catch (err) {
            
                console.log("Error Occured while catch registering");
                console.error(err);
                return res.status(500).send("Error Occured while catch registering");
        }
}


// * L O G I N

const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            console.log("Email or Password Missing while Login")
            res.status(400).send("All input is required");
        }

        const user = [];

        const sql = "SELECT uuid,filename,fname,lname,athlete_id,email,password,phone_number,gender,date_of_birth,blood_group,emergency_contact,relation_emergency_contact,insta_link,facebook_link,twitter_link,linkdin_link,occupation,about_you,accident_insurance_number FROM users WHERE email = ?";
        db.all(sql, email, async function (err, rows) {
            if (err) {
                console.log("Error Occured while Login -DB Email ",email);
                console.error(err.message);
                return res.status(500).send("Error Occured while Login -DB Email ",email);
              }

            if(rows.length == 0){
                console.log("NO Account Foind in Login email",email);
                return res.status(400).send("No Match");
            }

            rows.forEach(function (row) {
                user.push(row);
            })

        
            var PHash = await bcrypt.compare(password, user[0].password);
            

            if (PHash) {
                var token = jwt.sign(
                    { user_uuid: user[0].uuid, username: user[0].fname, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
                    }
                );

                db.all(`UPDATE users SET DateLoggedIn = COALESCE(?,DateLoggedIn) WHERE email = ?;`, [Date('now'), email], (err) => {
                    if (err) {
                        console.log("Error Occured while DateLoggedIn -db  Email ",email);
                        console.error(err.message);
                        return res.status(500).send("Error Occured while DateLoggedIn -db Email ",email);
                      }

                      console.log("Logged IN email",email);
                    return res.status(200).json({"jwt": token, "user": user[0], "Photo":`ProfilePics/${user[0].email}/${user[0].filename}.jpg`});
                })

            } else {
                console.log("NO Account Foind in Login email",email);
                return res.status(400).send("No Match!");
            }
        });

    } catch (err) {
        console.log("Error Occured while catch Login");
        console.error(err);
        return res.status(500).send("Error Occured while catch Login");
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
            console.log("Error Occured while ALLuser -db  Email ",email);
            console.error(err.message);
            return res.status(500).send("Error Occured while ALLuser -db Email ",email);
          }
        res.json({
            "message": "success2",
            "data": rows
        })
    });
};


// * S I N G L E U S E R     P R O F I L E

const single = (req, res, next) => {
    var sql = `SELECT uuid,filename,fname,lname,athlete_id,email,phone_number,gender,date_of_birth,blood_group,emergency_contact,relation_emergency_contact,insta_link,facebook_link,twitter_link,linkdin_link,occupation,about_you,accident_insurance_number FROM users WHERE uuid = ?`;
    var params = [req.params.uuid]
    db.all(sql, params, (err, row) => {
        if (err) {
            console.log("Error Occured while single user -db  Email ",email);
            console.error(err.message);
            return res.status(500).send("Error Occured while single user -db Email ",email);
          }

        else if(row.length == 0) {
            console.log("No user found with uuid",params)
            return res.status(400).send(`NO Users found for uuid =  ${params}`);
        }

        console.log("Profile Data SEND for uuid",params)
        return res.json({
            "message": "success3",
            "data": row[0],
	    "Photo":`ProfilePics/${row[0].email}/${row[0].filename}.jpg`
        })
    });
};


// * U P D A T E   U S E R

const update = async (req, res, next) => {

    const { uuid, fname, lname, email, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, } = req.body;

        if(req.file != undefined) {

            let fily = req.file.filename;
            let dir = `./ProfilePics/${email}/`;
            let path = dir;

            if( fs.existsSync(dir) ) {
                fs.readdirSync(dir).forEach( function(file) {
                  var curPath = path + "/" + file;
                    if(fs.lstatSync(curPath).isDirectory()) { 
                        deleteFolderRecursive(curPath);
                    } else { 
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
        
                fs.mkdirSync(dir, { recursive: true })
              }
        
        
                var oldPath = `./ProfilePics/${req.file.filename}`
                var newPath = `./ProfilePics/${req.body.email}/${req.file.filename}.jpg`;
        
                fs.rename(oldPath, newPath, function (err) {
                    if (err) {
                        console.log("Error Occured while IMG upload uuid ",uuid);
                        console.error(err.message);
                        return res.status(500).send("Error Occured while  IMG upload uuid ",uuid);
                      }
                    console.log('Image uploaded Successfully for uuid ',uuid);
                })

                db.run(
                    `UPDATE users SET
                        filename = COALESCE(?,filename),
                        fname = COALESCE(?,fname),
                        lname = COALESCE(?,lname),
			email = COALESCE(?,email),
                        phone_number = COALESCE(?,phone_number),
                        gender = COALESCE(?,gender),
                        date_of_birth = COALESCE(?,date_of_birth),
                        blood_group = COALESCE(?,blood_group),
                        emergency_contact = COALESCE(?,emergency_contact),
                        relation_emergency_contact = COALESCE(?,relation_emergency_contact),
                        insta_link = COALESCE(?,insta_link),
                        facebook_link = COALESCE(?,facebook_link),
                        twitter_link = COALESCE(?,twitter_link),
                        linkdin_link = COALESCE(?,linkdin_link),
                        occupation = COALESCE(?,occupation),
                        about_you = COALESCE(?,about_you),
                        accident_insurance_number = COALESCE(?,accident_insurance_number)
                        WHERE uuid = ?`,
            
                    [fily, fname, lname, email, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, uuid],
            
                    function (err, result) {
                        if (err) {
                            console.log("Error Occured while update uuid ",uuid);
                            console.error(err.message);
                            return res.status(500).send("Error Occured while update uuid ",uuid);
                          }
                          
                        console.log("Successfully update for uuid ",uuid);
                        return res.status(202).json({ message: "success4", changes: this.changes })
                    });


        } else {

            db.run(
                `UPDATE users SET
                    
                    fname = COALESCE(?,fname),
                    lname = COALESCE(?,lname),
		    email = COALESCE(?,email),
                    phone_number = COALESCE(?,phone_number),
                    gender = COALESCE(?,gender),
                    date_of_birth = COALESCE(?,date_of_birth),
                    blood_group = COALESCE(?,blood_group),
                    emergency_contact = COALESCE(?,emergency_contact),
                    relation_emergency_contact = COALESCE(?,relation_emergency_contact),
                    insta_link = COALESCE(?,insta_link),
                    facebook_link = COALESCE(?,facebook_link),
                    twitter_link = COALESCE(?,twitter_link),
                    linkdin_link = COALESCE(?,linkdin_link),
                    occupation = COALESCE(?,occupation),
                    about_you = COALESCE(?,about_you),
                    accident_insurance_number = COALESCE(?,accident_insurance_number)
                    WHERE uuid = ?`,
        
                [fname, lname, email, phone_number, gender, date_of_birth, blood_group, emergency_contact, relation_emergency_contact, insta_link, facebook_link, twitter_link, linkdin_link, occupation, about_you, accident_insurance_number, uuid],
        
                function (err, result) {
                    if (err) {
                        console.log("Error Occured while update uuid ",uuid);
                        console.error(err.message);
                        return res.status(500).send("Error Occured while update uuid ",uuid);
                      }
                    
                    console.log("Successfully update for uuid ",uuid);
                    return res.status(202).json({ message: "success4", changes: this.changes })
                });

        }
}


// * D E L E T E   U S E R

const deleteit = (req, res, next) => {
    db.run(
        'DELETE FROM users WHERE uuid = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                console.log("Error Occured while DELETE user uuid ",uuid);
                console.error(err.message);
                return res.status(500).send("Error Occured while DELETE user uuid ",uuid);
              }

              console.log("Successfully user deleted for uuid ",uuid);
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

const express = require('express');
const db = require('../config/database');   //For DataBase Connection
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));  // Com/on JS

var athlete_id;

  async function strava(code, uuid, email, req, res) {
    const headers = {
      'Accept' : 'application/json, text/plain, */*',
      'Content-Type' : 'application/json'
      }

    const body = JSON.stringify({
      client_id : process.env.Client_ID,
      client_secret : process.env.Client_Secret,
      code : code,
      grant_type : 'authorization_code',
      })

    const oAuthExchange = await fetch('https://www.strava.com/oauth/token', {
          method : 'POST',
          "headers" : headers,
          "body" : body,
      })

  const oAuthRes = await oAuthExchange.json();
  
  
  athlete_id = oAuthRes.athlete.id;
  
  const sql = `UPDATE users SET athlete_id=?, refresh_token=?, access_token=?, access_token_expiration=? WHERE email = ?;`;
  let params = [oAuthRes.athlete.id,oAuthRes.refresh_token,oAuthRes.access_token,oAuthRes.expires_at,email];

  await db.run(sql,params, (err, data, fields) => {
    if (err) {
      console.log("Error Occured while Strava connect -DB for UUID",uuid)
      console.error(err.message);
      return res.status(500).send("Error Occured while Strava connect -DB for UUID ",uuid)
    }   
      
      console.log("Strava Connected for UUID =",uuid,"AthleteId =",oAuthRes.athlete.id)
      return oAuthRes.athlete.id;
    })
  } 
  

  connectStrava = async (req, res, next) => {
    const { code, uuid, email } = req.body;

    db.all(`SELECT * FROM users WHERE uuid = ? AND email = ?;`, [uuid,email], async (err, data, fields) => {
        if (err) {
          console.log("Error Occured while Strava connect -DB for UUID",uuid)
          console.error(err.message);
          return res.status(500).send("Error Occured while Strava connect -DB for UUID ",uuid)
        }
        if(data.length == 0) {
          console.log("No User Found with UUID =",uuid,"Email =",email)
          return res.status(400).send("USER NOT FOUND!")
        }
        else if(data[0].athlete_id == null) {
            await strava(code, uuid, email, req, res);
            console.log("Strava Connected for UUID =",uuid,"Email =",email)
            return res.status(200).json({"msg": "Strava Connected Successfully!", "athlete_id": athlete_id});
        } else {
          console.log("Strava Already Connected for UUID =",uuid,"Email =",email)
          return res.status(400).send("Strava Already Connected!")
        }
    })
  }


  module.exports = {connectStrava};
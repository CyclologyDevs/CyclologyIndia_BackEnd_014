const express = require('express');
const router = express.Router();
const db = require('../config/database');   //For DataBase Connection
const path = require('path');
require("dotenv").config();
const {fork} = require('child_process');   //For using Child Process


const jointEventList = async (req, res, next) => {
  let { uuid, athlete_id } = req.body;

  db.all(`SELECT * from event WHERE uuid = ? `,[uuid], (err, data) => {
    if (err) {
      console.log("Error Occured while JointEventList -DB for UUID",uuid);
      console.error(err.message);
      return res.status(500).send("Error Occured while IsInEvent -DB for UUID",uuid)
    } 
      
    if(data.length == 0) {
        console.log("UUID",uuid, "is NOT in ANY Event");
        return res.status(400).send(data);
    }
    else {
      console.log("UUID",uuid, "is in SOME Events");
      return res.status(200).send(data);
    }
})

}

const isInEvent = async (req, res, next) => {
    let { uuid, athlete_id, event_name } = req.body;


    db.all(`SELECT * from event WHERE uuid = ? AND athlete_id = ? AND event_name = ?`,[uuid, athlete_id, event_name], (err, data) => {
        if (err) {
          console.log("Error Occured while IsInEvent -DB for UUID",uuid," Event Name",event_name);
          console.error(err.message);
          return res.status(500).send("Error Occured while IsInEvent -DB for UUID",uuid," Event Name",event_name)
        } 
          
        if(data.length == 0) {
            console.log("UUID",uuid, "is NOT in Event",event_name);
            return res.status(400).send("NOT in EVENT");
        }
        else {
          console.log("UUID",uuid, "is in Event",event_name);
            return res.status(200).send("In EVENT");
        }
    })
}

const joinEvent = async (req, res, next) => {
    let { uuid, athlete_id, event_start_date, event_end_date, event_name } = req.body;

  const sql = `INSERT INTO event(uuid, athlete_id, event_start_date, event_end_date, event_name) VALUES(?,?,?,?,?);`;
  let params = [uuid, athlete_id, event_start_date, event_end_date,event_name];

  db.all(`SELECT * from event WHERE uuid = ? AND athlete_id = ? AND event_name = ?`,[uuid, athlete_id, event_name], (err, data) => {
    if (err) {
      console.log("Error Occured while check Join Event -DB for UUID",uuid," event name",event_name)
      console.error(err.message);
      return res.status(500).send("Error Occured while check Join Event -DB for UUID",uuid," event name",event_name)
    }

    
    if (data.length == 0){
      db.all(sql,params, (err, data, fields) => {
        if (err) {
          console.log("Error Occured while Joining Event -DB for UUID",uuid," event name",event_name)
          console.error(err.message);
          return res.status(500).send("Error Occured while Joining Event -DB for UUID",uuid," event name",event_name)
        }
        

        const childProcess = fork('./controllers/fetchOldActivities.js');
        childProcess.send(JSON.stringify({uuid, athlete_id, event_start_date, event_end_date, event_name}));
        childProcess.on("Message", function (Message)  {console.log("ok " + Message);})

          console.log("UUID",uuid," JOINT Event",event_name);
          return res.status(200).send("EVENT JOINT SUCCESSFULLY!");
        })
    } else {
      console.log("UUID",uuid," ALREADY present in Event",event_name);
      return res.status(400).json({ "error": "user alredy have joint the event" });
    }

  })
}

const leaveEvent = async (req, res, next) => {

    let { uuid, athlete_id, event_start_date, event_end_date, event_name } = req.body;
    let params = [uuid, event_name];


    db.all(`SELECT * from event WHERE uuid = ? AND athlete_id = ? AND event_name = ?`,[uuid, athlete_id, event_name], (err, data) => {
      if (err) {
        console.log("Error Occured while check Leave Event -DB for UUID",uuid," event name",event_name)
        console.error(err.message);
        return res.status(500).send("Error Occured while check Leave Event -DB for UUID",uuid," event name",event_name)
      }
             
      if (data.length != 0){

        sql = 'DELETE FROM event WHERE uuid = ? and event_name = ?;';
        db.run(sql, params, err => {
          if (err) {
            console.log("Error Occured while delete Leave Event -DB for UUID",uuid," event name",event_name)
            console.error(err.message);
            return res.status(500).send("Error Occured while delete Leave Event -DB for UUID",uuid," event name",event_name)
          }
        
            console.log("UUID",uuid," Left Event",event_name);
            return res.status(200).send("Event Left!");
        })

        /*
        let sql = 'DELETE FROM strava WHERE uuid = ?;';
        db.run(sql, params, err => {
          if (err)
            return console.error(err.message);
        
            console.log("Data Deleted from Strava Table DB!!");
        })
    
        sql = 'DELETE FROM webhook WHERE owner_id = ?;';
        params = [athlete_id]
        db.run(sql, params, err => {
          if (err)
            return console.error(err.message);
        
            console.log("Data Deleted from Webhook Table DB!!");
        })
        */
        
      } else {
        console.log("UUID",uuid," NOT present in Event",event_name);
        return res.status(400).json({ "error": "user alredy have left the event" });
      }

})
}



module.exports = {
    jointEventList,
    isInEvent,
    joinEvent,
    leaveEvent
};
const db = require('../config/database');   //For DataBase Connection
const {fork} = require('child_process');   //For using Child Process

const router = require('express').Router()


// Inserting Webhook Values into DB
const sql = 'INSERT INTO webhook (aspect_type, object_id, object_type, owner_id, authorized, UTC_timing, IST_timing) VALUES(?,?,?,?,?,?,?)';
let params;

async function webhook(reqJson)
{
  var time = new Date();
  var GMT_time = time.toUTCString();
  var IST_time = time.toString();
  params = [reqJson.aspect_type, reqJson.object_id, reqJson.object_type, reqJson.owner_id, reqJson.updates.authorized, GMT_time, IST_time];
    db.run(sql, params, err => {
      if (err) {
        console.log("Error Occured in webhook func where athleteId",reqJson.owner_id);
        console.error(err.message);
        return res.status(500).send("Error Occured in webhook func where athleteId",reqJson.owner_id);
      }
      
          console.log("Webhook Responds Inserted where athleteId",reqJson.owner_id);
      })
}


router.post('/', (req, res) => {

  if(req.body.aspect_type == 'create')
  {
    webhook(req.body); // Inserting Webhook Values into DB

    //Working with Child Process for Multi-ThreadingDefining Child Process
    const childProcess = fork('../webhookToStrava.js');
    childProcess.send(JSON.stringify(req.body));
    childProcess.on("Message", function (Message)  {console.log("ok " + Message);})
    //childProcess.on("Message", (Message) => {console.log("ok " + Message);})

    console.log("Data created in strava where athleteId",req.body.owner_id)
  }
  else if(req.body.aspect_type == 'delete')
  {
     webhook(req.body);
    const sql = 'DELETE FROM strava WHERE activity_id = ?;';
    let params = [req.body.object_id];

    db.run(sql, params, err => {
      if (err) {
        console.log("Error Occured in webhook delete where athleteId",req.body.owner_id);
        console.error(err.message);
        return res.status(500).send("Error Occured in webhook delete where athleteId",req.body.owner_id);
      }
    
        console.log("Data deleted from strava where athleteId",req.body.owner_id)
    })
  } 
  else if(req.body.aspect_type == 'update')
  {
     webhook(req.body);
    //Working with Child Process for Multi-ThreadingDefining Child Process
    const childProcess = fork('../webhookTostravaUpdate.js');
    childProcess.send(JSON.stringify(req.body));
    childProcess.on("Message", function (Message)  {console.log("ok " + Message);})
    //childProcess.on("Message", (Message) => {console.log("ok " + Message);})

    console.log("Data updated in strava where athleteId",req.body.owner_id)

  }
  
  console.log("webhook event received!", req.body.owner_id);
  return res.status(200).send('EVENT_RECEIVED');
});


router.get('/', (req, res) => {
  const VERIFY_TOKEN = "STRAVA";
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
      console.log('WEBHOOK_VERIFIED');
      res.json({"hub.challenge":challenge});  
    } else {
      res.sendStatus(403);      
    }
  }
});

module.exports = router;
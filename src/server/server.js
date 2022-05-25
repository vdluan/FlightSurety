import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 2;

let config = Config.network;
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));

let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

var accounts;

//flightSuretyApp.methods.REGISTRATION_FEE.call().then(result=>{let fee=result;console.log(result);});
var oracleIndexes;
web3.eth.getAccounts().then(accs => {  
    web3.eth.defaultAccount = accs[0];
    accounts=accs;
    let fee=web3.utils.toWei("1","ether");
    
    flightSuretyApp.methods.registerOracle().send({from: accounts[0], value: fee,  gas: 300000 }, (error, result)=>{
        if(error) console.log(error);       
    });

});



 
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) {
        console.log(error);
      }
      else {        
        let index = event.returnValues.index;
        let airline = event.returnValues.airline;
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp;
        let status = 20;
  
        console.log(` Event Values : 
                  index: ${index} ,
                  airline: ${airline} ,
                  flight: ${flight} ,
                  timestamp: ${timestamp} ,
                  status: ${status}
                   `);

        flightSuretyApp.methods.getMyIndexes().call({from: accounts[0]}).then((result)=>{            
          console.log(result);
          oracleIndexes=result;
          for(let idx=0;idx<3;idx++) {          
            flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE)
            .send({from: accounts[0]},(error, result=>{
              if(error) console.log(error);
              /*
              if(idx==2){
                flightSuretyApp.methods.viewFlightStatus(airline,flight, timestamp).call({from : accounts[0]}).then((result)=>{
                  console.log(result);
                });
              }
              */
            }));                 
              
              
          }
        });
       

    }
            
     
                
    

});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;



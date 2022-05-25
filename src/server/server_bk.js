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

const TEST_ORACLES_COUNT = 1;

let config = Config.network;
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));

let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

var accounts;

//flightSuretyApp.methods.REGISTRATION_FEE.call().then(result=>{let fee=result;console.log(result);});

web3.eth.getAccounts().then(accs => {  
    web3.eth.defaultAccount = accs[0];
    accounts=accs;
    let fee=web3.utils.toWei("1","ether");
    //registerOracle(accounts,fee);
    for(let a=1; a<=TEST_ORACLES_COUNT; a++) {      
      flightSuretyApp.methods.registerOracle().call({ from: accs[a], value: fee,  gas: 30000000000 }).then(()=>
          {
            console.log("Register success!");
            
          });   
    }
  
 });

//function registerOracle(accounts, fee){
  
//}
 
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

        flightSuretyApp.methods.getMyIndexes().call({from: accounts[a], gas: 30000000000}).then((error, result)=>{    
          console.log(error);
          console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);               
        });          
         /*         
        flightSuretyApp.methods.getMyIndexes().call({from: accounts[0]},
                        (error, result) => {
                          console.log("result :" + result);
                          if (error) {
                            console.log("submitOracleResponse error");
                            console.log(error);
                          }
                          else {
                            console.log("submitOracleResponse success");
                            console.log(`${JSON.stringify(oracles[idxOracle])}: Status code ${_status}`);
                          }
                        }  
                     );
                    
                    
                     flightSuretyApp.methods.registerAirline(airline,"Hello World").call({from: accounts[0]},
                      (error, result) => {
                        console.log("result :" + result);
                        if (error) {
                          console.log("submitOracleResponse error");
                          console.log(error);
                        }
                        else {
                          console.log("submitOracleResponse success");
                          console.log(result);
                        }
                      }  
                   );
                   

        for(let a=1; a<TEST_ORACLES_COUNT; a++) {
            let oracleIndexes = flightSuretyApp.methods.getMyIndexes().send({ from: accounts[a]});
            for(let idx=0;idx<3;idx++) {        
                try {
                    flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE).send({ from: accounts[a] });
                
                }
                catch(e) {               
                    console.log(e.toString());
                }                
            }        
        }
        */
      }

});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;



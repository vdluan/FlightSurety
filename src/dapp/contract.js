import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config.network;
        //this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyApp.options.gas = 2000000;

        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyData.options.gas = 2000000;
       
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.timestamp = Math.floor(Date.now() / 1000);        

        /*--- for catching event from smart contract
        this.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: 0
          }, function (error, event) {
            if (error) {
                console.log(error);
              }
              else {        
                 this.airline = event.returnValues.airline;
                 this.flight = event.returnValues.flight;
                 this.timestamp = event.returnValues.timestamp;
                 this.status = event.returnValues.status;
              }
            });
            */
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {           
            this.owner = accts[0];
            let counter = 1;  
            /*          
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
*/
            callback();
        });
    }
   

    registerAirline(airline, airlineName, callback){
        let self = this;   
        self.flightSuretyApp.methods
        .registerAirline(airline, airlineName)
        .send({ from: self.owner}, (error, result) => {
            callback(error, result);
        });
      
    }

    fund(airline, fund, callback){
        let self = this;       
        self.flightSuretyData.methods
            .fund()
            .send({ from: airline, value:  this.web3.utils.toWei(fund, "ether")}, (error, result) => {
                callback(error, result);
            });
    }

    registerFlight(airline, flight, callback){
        let self = this;       
        self.flightSuretyApp.methods
            .registerFlight(airline, flight,this.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    buyInsurance(airline, flight, address, value, callback){
        let self = this;    
       
        self.flightSuretyApp.methods
        .buyInsurance(airline, flight,this.timestamp)
        .send({ from: address, value:  this.web3.utils.toWei(value, "ether") }, (error, result) => {
            callback(error, result);
        });
    }


    creditInsurance(airline, flight, callback){
        let self = this;       
        self.flightSuretyApp.methods
            .creditInsurees(airline, flight,this.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    claimInsurance(address, callback){
        let self = this;  
        self.flightSuretyApp.methods
        .payInsurance()
        .send({ from: address}, (error, result) => {
            callback(error, result);
        });
        
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(airline, flight, callback) {       
        let self = this;
        let payload = {
            airline: airline,
            flight: flight,
            timestamp: this.timestamp
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
      
    }

    viewFlightStatus(airline, flight, callback) {       
        let self = this;
        let payload = {
            airline: airline,
            flight: flight,
            timestamp: this.timestamp
        } 
        self.flightSuretyApp.methods
            .viewFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .call({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
      
    }
}
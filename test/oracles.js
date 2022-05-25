
//const truffleAssertions = require('truffle-assertions');
const { default: Web3 } = require('web3');
var Test = require('../config/testConfig.js');

//var BigNumber = require('bignumber.js');
  const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;
// ARRANGE
let flight = 'ND1309'; // Course number
let timestamp = Math.floor(Date.now() / 1000);


contract('Oracles', async (accounts) => {

  const TEST_ORACLES_COUNT = 10;
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);   

  });


  it('can register oracles', async () => {
   
    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

    // ACT
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
      await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });

  it('can register Flight', async () => { 
    let airline=config.firstAirline;
    let insuree=accounts[2];
    let value=100;
    // ARRANGE
    await config.flightSuretyApp.registerFlight(airline, flight, timestamp);
  });

  it('can buy Insurance', async () => { 
    let airline=config.firstAirline;
    let insuree=accounts[2];
    let value=100;
    // ARRANGE
    await config.flightSuretyApp.buyInsurance(airline, flight, timestamp,{from: insuree, value: value});

    let result=await config.flightSuretyApp.getInsurance.call(airline, flight, timestamp, insuree);
    
    assert.equal(result,value,"Wrong Value");    
    
  });

  it('can request flight status', async () => {
    
    let airline=config.firstAirline;

    // Submit a request for oracles to get status information for a flight
    await config.flightSuretyApp.fetchFlightStatus(airline, flight, timestamp);
    // ACT


    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {

      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
      for(let idx=0;idx<3;idx++) {

        try {
         // console.log('\nPost', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE, { from: accounts[a] });
         
         
        }
        catch(e) {
          // Enable this when debugging
           //console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
           console.log(e.toString());
        }
       

      }

    }

    let flightStatus = await config.flightSuretyApp.viewFlightStatus.call(airline,flight, timestamp);
    assert.equal(flightStatus, STATUS_CODE_LATE_AIRLINE, "Status must be on late");      

  });

  

  it('credit Insuree', async () => { 
    let airline=config.firstAirline;
    let insuree=accounts[2];
    
    // ARRANGE
    await config.flightSuretyApp.creditInsurees(airline, flight, timestamp);

    let result=await config.flightSuretyApp.getInsurance.call(airline, flight, timestamp, insuree);
    assert.equal(result,0,"Wrong Value");    
    
  });

  it('pay Insurance', async () => { 
    let insuree=accounts[2];    
    
    //let balanceBefore=await web3.eth.getBalance(insuree);
    //console.log(balanceBefore);
    let credit= await config.flightSuretyApp.payInsurance.call({from: insuree});    

    //let balanceAfter=await web3.eth.getBalance(insuree);
    //console.log(balanceAfter);

    
    
    assert.equal(credit,150,"Wrong Value");    
    
  });

});

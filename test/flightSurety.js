
var Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`FlightSuretyApp has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });


  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('Existing airlines can register an Airline using registerAirline() ', async () => {
    
    // ARRANGE
    let newAirline = accounts[1];

    // ACT
    
    await config.flightSuretyApp.registerAirline(newAirline, "No Fly Airline", {from: config.owner});
    let result = await config.flightSuretyData.IsExistingAirline.call(newAirline); 
    
    assert.equal(result,true, "Existing airlines can register an Airline using registerAirline() ");
    
  });

  it('Airline to fund', async () => {  
    
    let fund=10* config.weiMultiple;
    console.log("Funding: "+fund);

    await config.flightSuretyData.fund({from: accounts[1], value: fund});
    
    let balance=await config.flightSuretyData.getBalance({from: accounts[1]});
    assert.equal(balance, fund, "Balance must be equal to fund");
   
    
  });


  it('Add 2 more airlines: register an Airline using registerAirline() ', async () => {    
    
    
    await config.flightSuretyApp.registerAirline(accounts[2],"No Fly Airline 2", {from: accounts[1]});
    await config.flightSuretyApp.registerAirline(accounts[3],"No Fly Airline 3",{from: accounts[1]});
       
    
  });
 
  it('Add 5th airline: 1st vote, airline should not be added', async () => {  
   
    await config.flightSuretyApp.registerAirline(accounts[4],"No Fly Airline 4",{from: accounts[0]});
  
    const result = await config.flightSuretyData.IsExistingAirline.call(accounts[4]); 
    console.log(result);    
    assert.equal(result,false, "Add 5th airline: 1st vote, airline should not be added");  
    
    
  });

  it('Add 5th airline: 2nd vote, airline now is added', async () => {  
   
    await config.flightSuretyApp.registerAirline(accounts[4],"No Fly Airline 4",{from: accounts[1]});
  
    let result = await config.flightSuretyData.IsExistingAirline.call(accounts[4]); 
    console.log(result);    
    assert.equal(result,true, "Add 5th airline: 2nd vote, airline now is added");
    
    
    
  });

  
});


const fs = require('fs');

const Data = artifacts.require("FlightSuretyData");
const App = artifacts.require("FlightSuretyApp");

module.exports = async function(deployer, network, accounts) {
    //let firstAirline = accounts[0];
    
    await deployer.deploy(Data);
    const data = await Data.deployed();
    const app= await deployer.deploy(App, data.address);
    const oracle = await App.deployed();

    let config = {
        network: {
            url: 'http://localhost:8545',
            dataAddress: data.address,
            appAddress: app.address,
            oracleAddress: oracle.address
        }
    }
    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
}
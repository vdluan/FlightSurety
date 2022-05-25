# FlightSurety
This project is to manage airline and allow passenger to buy insurance. It allows:
 **** Airline:****
    . Register airline
    . After registering, airline must fund at least 10ETH to participate in the program: have rights to add other airlines (contract owner adds first 3     airline then from the fifth, all airlines have the right to vote, airline which has >=50% vote will be added to the program).
    . Register Flights
    . Credit Insurance: when a flight is late because of the airline fault, the airline must credit insurance for 1.5 times the price passenger paid for insurance of this flight.
  
  **Passenger:**
    . Buy insurace for a flight
    . Claim Insurance (after airline credit insurance)

**Design**
  Smart contracts:
    FlightSuretyData: data related to airline, flight, passenger and insurance are stored here
    FlightSuretyApp: for app logic and oracles
  Server:
    to simulate oracle: register oracle and waiting for request from smart contract about flight status and reply with status of the flight
    to run server: npm run server
  Dapp:
    to run: npm run dapp
    flow of program on dapp:
    Input ether address of Airline
    Input airline name
    Click "register airline"
    Input amount to fund for this airline. Click "Fund"! Please note, airline must fund at least 10 eth to participate in the program: voting and register flight
    Input ether address of passenger and amount to buy insurance. Click "Buy Insurance".
    
    Click on "Submit to oracle" to trigger event to oracle.
    To view flight status, click "View Flight Status"
    If status is airline late-> airline will click on "Credit Insurance" to credit insurance for passenger, it has not yet paid to passenger wallet.
    Passenger will click on "Claim Insurance" to receive eth in their wallet.
    It is the ending cycle of the program.
    
    System requirement:
    Truffle v5
    Solidity v0.5.16
    Node v16.14.12
    Web3.js v1.2.6
    
    
    

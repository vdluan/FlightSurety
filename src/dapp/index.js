
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('http://127.0.0.1:8545', () => {

        //register flight
        DOM.elid('registerAirline').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let airlineName = DOM.elid('airlineName').value;

            // Write transaction
            contract.registerAirline(airline, airlineName, (error,result) => {
                display('Airline', 'Register', [ { label: 'Register Status', error: error, value: 'success'} ]);
                //displayMessage("Register Airline", error ? String(error) : String(result));
            });
        })

        DOM.elid('fund').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let fund = DOM.elid('airlineFund').value;

            // Write transaction
            contract.fund(airline, fund, (error,result) => {
                display('Airline', 'Fund', [ { label: 'Fund Status', error: error, value: 'success'} ]);                
            });
        })

        DOM.elid('registerFlight').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let flight = DOM.elid('flight').value;

            // Write transaction
            contract.registerFlight(airline, flight, (error,result) => {
                display('Airline', 'Register Flight', [ { label: 'Register Status', error: error, value: 'success'} ]);               
            });
        })

        DOM.elid('buyInsurance').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let flight = DOM.elid('flight').value;
            let address = DOM.elid('passengerAddress').value;
            let value = DOM.elid('insurance').value;

            // Write transaction
            contract.buyInsurance(airline, flight, address, value, (error,result) => {
                display('Passenger', 'Buy Insurance', [ { label: 'Status', error: error, value: 'success'} ]);                
            });
        })

        DOM.elid('creditInsurance').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let flight = DOM.elid('flight').value;

            // Write transaction
            contract.creditInsurance(airline, flight, (error,result) => {
                display('Airline', 'Credit Insurance', [ { label: 'Credit Status', error: error, value: 'success'} ]);                
            });
        })

       
        DOM.elid('claimInsurance').addEventListener('click', () => {           
            let address = DOM.elid('passengerAddress').value;
            contract.claimInsurance(address,(error,result) => {
                display('Passenger', 'Claim Insurance', [ { label: 'Claim Status', error: error, value: 'success'} ]);                
            });
        })


        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let flight = DOM.elid('flight').value;
            contract.fetchFlightStatus(airline, flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('viewFlightStatus').addEventListener('click', () => {
            let airline = DOM.elid('airlineAddress').value;
            let flight = DOM.elid('flight').value;
            contract.viewFlightStatus(airline, flight, (error, result) => {
                display('Flight', 'Get Flight Status', [ { label: 'Status', error: error, value: getFlightStatus(result) } ]);
            });
        })
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");    
    let section = DOM.section();
    
    section.appendChild(DOM.h4(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

function displayMessage(title,result){
    
    DOM.elid('status').text=title+' '+ result;
}

function getFlightStatus(statusCode){
    switch(statusCode){
        case "0":  return "Unknown";
        case "10": return "On Time";
        case "20": return "Airline late";
        case "30": return "Late because of weather";
        case "40": return "Late because of technical";
        case "50": return "Late";
    }
}


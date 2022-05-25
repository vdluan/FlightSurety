pragma solidity ^0.5.16;


import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

// Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Airline{
        address Address;
        string Name;
    }
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
   
    Airline[] private airlines;    //registered airlines
    
    mapping(address=>uint) balances; // airline deposit
    mapping(address=>bool) actives; //airline has been active?
    address[] multiCalls=new address[](0);  //registered airlines made call to add new airline
    
   
   //from APP
    struct Insurance{
       address insuree;
       uint value;
    }   

    struct Flight {
        string flightNumber; 
        uint8 status;           
        address airline;
        bool hasStatus;
        bool existed;
        Insurance[] insurances; //list of insurances
    }
  
    mapping(bytes32 => Flight) flights;
   
    mapping(address=>uint256) creditInsurances; //list of insurance payout


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public 
    {
        contractOwner = msg.sender;
        airlines.push(Airline({Address:msg.sender,Name:"Founder"})); //the initial contract is the first airline
        actives[msg.sender]=true;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public view requireContractOwner returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external  requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airline, string calldata name, address caller) external returns(bool)
    {
        bool success=false;
        //votes=0;
      
       require(IsExistingAirline(caller),"Only existing airline can register new airline");
       require(actives[caller],"Airline has not fund");
       require(!IsExistingAirline(airline),"This airline has already in the list");

        if(airlines.length<4){
             airlines.push(Airline({Address:airline,Name:name}));      
             success=true;     
        }else{
            bool isDuplicate = false;
            for(uint c=0; c<multiCalls.length; c++) {
                if (multiCalls[c] == caller) {
                    isDuplicate = true;
                    break;
                }
            }
            require(!isDuplicate, "Caller has already called this function.");

            multiCalls.push(caller);
            if (multiCalls.length >=airlines.length/2) {
                airlines.push(Airline({Address:airline,Name:name}));  
                success=true;                   
                multiCalls = new address[](0);      
            }
        }
      
        return success;
        
    }

    function IsExistingAirline(address airline) public returns(bool) {
        
        for(uint i=0; i<airlines.length; i++){
            if(airlines[i].Address==airline){
                return true;
            } 
        }
        return false;
        
    }

 
   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable
    {
       // require(msg.value>=10 ether, "You must fund atlest 10 ether");

        balances[msg.sender]+=msg.value;
        if(balances[msg.sender]>=10 ether){
            actives[msg.sender]=true;
        }

    }

    function getBalance() public view returns(uint)
    {
       return balances[msg.sender];
        

    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp)  pure internal  returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()external payable 
    {
        fund();
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(address airline, string calldata flight, uint256 timestamp) external 
    {
        require(actives[airline],"Airline has not fund");
        bytes32 key=getFlightKey(airline, flight, timestamp);
        require(!flights[key].existed, "Flight has been register");
        flights[key].flightNumber=flight;
        flights[key].airline=airline;
        flights[key].hasStatus=false;
        flights[key].existed=true;

    }

   

    function viewFlightStatus(address airline, string calldata flight, uint256 timestamp) external view returns(uint8)
    {
        bytes32 key=getFlightKey(airline, flight, timestamp);
        require(flights[key].hasStatus, "Flight status not available");        
        return flights[key].status;
    }


  /********************************************************************************************/
    /*                                     Passengers                            */
    /********************************************************************************************/
  // mapping(address=>mapping(string=>uint) ) insurances;
  

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buyInsurance(address airline, string calldata flight, uint256 timestamp, address  insuree, uint256 value) external payable
    {
        require(value<=1 ether, "Too much money");
        bytes32 key=getFlightKey(airline, flight, timestamp);
        require(flights[key].existed,"Flight has not been registered!");
        require(!flights[key].hasStatus,"Too late to buy insurance");
        Flight storage fl=flights[key];       
  
       
        fl.insurances.push(Insurance({insuree:insuree, value:value}));

    }

 //for testing only 
   function getInsurance(address airline, string calldata flight, uint256 timestamp, address insuree) external returns(uint256 v)
    {
        bytes32 key=getFlightKey(airline, flight, timestamp);
        Flight memory fl=flights[key];      
        uint256 i=0;
        v=0;
        while(i<fl.insurances.length){
            if(fl.insurances[i].insuree==insuree){
                v=fl.insurances[i].value;
                break;
            }
            i++;
        }
        return v;

    }


    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(address airline, string calldata flight, uint256 timestamp) external 
    {
        bytes32 key=getFlightKey(airline, flight, timestamp);
        Flight memory fl=flights[key];    
        require(fl.hasStatus,"Flight has not has status");
        require(fl.status==STATUS_CODE_LATE_AIRLINE, "Wrong Status code! No credit");
        for(uint256 i; i<fl.insurances.length;i++){
            uint256 v=fl.insurances[i].value;
            v=v+v/2;
            flights[key].insurances[i].value=0;

            creditInsurances[fl.insurances[i].insuree]+=v;
        }
    
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function payInsurance(address payable insuree) external payable returns(uint)
    {
        uint256 v=creditInsurances[insuree];
        require(v>0, "You do not have any insurance!");       
        creditInsurances[insuree]=0;       
        return v;
    }

/**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(address airline, string calldata flight, uint256 timestamp, uint8 status)  external
    {
          bytes32 key=getFlightKey(airline, flight, timestamp);
          flights[key].hasStatus= true;
          flights[key].status=status;
    }



}


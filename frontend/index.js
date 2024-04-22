import { initializeBlock, useCursor, useLoadable, useWatchable,useBase ,useRecordQueryResult, RecordCard} from '@airtable/blocks/ui';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios directly
import { Button, Dialog, Heading, Text ,Loader} from "@airtable/blocks/ui";

import "./DialerPage.css"
import './login.css'; // Import CSS file for styling

import VehicleRecommendationComponent from '../Components/VehicleRecommendationComponent';
import LoginComponents  from '../Components/LoginComponents';
import HeaderComponent from '../Components/HeaderComponents';
import BuyerContactComponents from '../Components/BuyerInfoComponents';
import ShowContactComponents from '../Components/ContactsSpecificComponents';
import PastNotesParentComponent from '../Components/PreviewNotesComponents';

import { Variables,SendRequest ,Airtable_Update_Request } from './Requester.js';
import { FetchIds } from './fetchMethods';
import { Incoming } from './incoming.js';

import { CallBackUtility } from "./callback.js"

const fetcher = new FetchIds();
const callback = new CallBackUtility()

let calls_count=0;
var userIdentifier;

// Define a cancel token source
var server_url;

// handler is used to handle request related to incomings
var IncomingHandler;
// requester has various method that send reuqest to backend with different payloads 
var Requester; 

var airtable_update_requester;


var Notes=''
var isPaushed=false;
let end_all=false;

function isPhoneNumber(phoneNumber) {
  // Regular expression to match a phone number in the format (XXX) XXX-XXXX
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
  
  // Test if the phoneNumber matches the regular expression
  return phoneRegex.test(phoneNumber);
}

// /////////////////////////////// Incoming Call Connect /////////////////////////////////////////////////

async function ConnectAgentWithIncoming(setDialerurl,incoming_number,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle){
  try{
  // to uniquely identify incomings if there are more than one in queue
  const num_connect="+11234567890"
  const dummy_buyer = `Caller${incoming_number}`;
  console.log("setting up caller",num_connect,dummy_buyer)
  const url_call = `${server_url}/call?dealer_number=` + num_connect + '&dealer_name=' + dummy_buyer + '&channel_type=call&username='+userIdentifier;
  const response=await axios.post(url_call);
  var BuyerData;
  var VehicleData;
  BuyerData = response.data.BuyerMetaData;
  VehicleData = response.data.Recommendation;
  if (BuyerData!=undefined) {
    console.log(BuyerData);
    console.log(VehicleData);
    setCurrentVehicle("Incoming Call From "+BuyerData.buyer_name);
    setBuyerDetails(BuyerData);
    setVehicleRecommendation(VehicleData);
  }else{
      const caller_number=response.data.caller_number
      const caller_from=response.data.caller_city;
      const caller_state=response.data.caller_state;
      const UnkownBuyerDetail={
        "clients_id":'',
        "buyer_id":'',
        "contact_number":caller_number,
        "caller_from":caller_from,
        "caller_state":caller_state,
        "buyer_name": '-',
        "buyer_avg_price": '-',
        "buyer_address": '-',
        "buyer_category": '-',
      }
      setBuyerDetails(UnkownBuyerDetail)
      setVehicleRecommendation({})
      setCurrentVehicle("Incoming Call From Unkown "+caller_number)
      
    }


    const url = isPhoneNumber(num_connect) ? `${server_url}/dialer?name=${num_connect}&number=${dummy_buyer}&username=${userIdentifier}` : `${server_url}/lobby`;
    setDialerurl(url); 
    return BuyerData;
  }
catch(error){
    console.log("Error coming from ConnectAgentWithIncoming",error)
  }
 return {}
  }
  
async function start_incoming_call(setDialerurl,incoming_number,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle) {
  calls_count=calls_count+1;
  console.log("Starting to call incoming callers")
 
  // for(let i=0;i<queue_length;i++){
    var iscallOngoing=true;
    await ConnectAgentWithIncoming(setDialerurl,incoming_number,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle).then( async(response) => {
      const current_date=new Date().toISOString();
      const BuyerData= response; // Destructure BuyerData and VehicleData from the response
      var BuyerId;
      var ContactId;
      if(BuyerData!=undefined){
      console.log("Buyerdata",BuyerData);
       BuyerId=BuyerData.buyer_id;
      console.log("Incoming BUyer ID",BuyerId)
      ContactId=BuyerData.clients_id;
      console.log("incoming Contact ID",ContactId);
      }else{
        BuyerId=[];
         ContactId=[];
      }
      while (iscallOngoing && !end_all) {
        console.log("Checking call status...");
        try {
          const call_response = await axios.post(`${server_url}/Check-Call-State`,{
            username:userIdentifier,
            call_type:"Incoming",
       
          });
          const call_data = call_response.data;
          const call_check = call_data.status;
          const recording_link=call_data.recording_link;
          console.log(call_check);
          console.log("Incoming Response check",call_response);

          if (call_check === "Disconnected") {
        
            console.log("cleaning call status");
            await check_paused_pressed();
            console.log("recording url",recording_link)
            if(recording_link!='' && recording_link){
              
              await airtable_update_requester.append_call_record(BuyerId, ContactId, recording_link,current_date,"Phone call",Notes,'','')

            }
            // else{
            //   await append_call_record(BuyerId, ContactId, '',current_date,"Phone call",Notes,'','')

            // }
            console.log("clear the queue details")
            await axios.post(`${server_url}/refresh-queue`,{
              username:userIdentifier
            })
            iscallOngoing = false;
            console.log("Call ended");
            break;
          }
     
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 6000));
      }});
    }


    // contiously check if there are more than one caller in queue or not
async function intitiate_incoming_call(initate_Incoming_Argument_Object){
  const {setDialerurl,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle,setCallBackTime,setLoadedContactsInfo,setNotesContent,setPastNotes} =initate_Incoming_Argument_Object;
  const result =await IncomingHandler.checkIncomingCall();
  var incoming_check=result.incoming_check;
  var incoming_number=0;
  while (incoming_check=="Yes"){

    // incoming_available=true;
  setCallBackTime('');
  setLoadedContactsInfo('')
  setNotesContent('')
  setPastNotes('')
  
  Notes=""
   await start_incoming_call(setDialerurl,incoming_number,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle).then(async() => {
    const result_next =IncomingHandler.checkIncomingCall();
    incoming_number=incoming_number+1
    console.log(result_next.incoming_check)
    incoming_check=result_next.incoming_check;
    
   })
  //  incoming_available=false;
 
}
}

// var incoming_available=false

async function check_paused_pressed(){
  while (isPaushed) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // check every 5sec is it still paushed 
  }

}

const intervalTime = 10000; // For example, check every minute

// ///////////////////////////// Call Connection and Wait function ////////////////////////////////////////////////////////
async function waiting_for_complete_call(setDialerurl,iscallOngoing,BuyerId, ContactId){

  while (iscallOngoing) {
    if(end_all){
      setDialerurl('')
      break
    }
    const current_date=new Date().toISOString();
    console.log("Checking call status...");

    try {
      const call_response = await axios.post(`${server_url}/Check-Call-State`,{
        username:userIdentifier,
        call_type:"Outgoing",
     
      });
      const call_data = call_response.data;
      const call_check = call_data.status;
      const recording_link=call_data.recording_link;
      console.log(call_check);

      console.log(call_response)
      if (call_check === "Disconnected") {
    
        console.log("cleaning call status");
        await check_paused_pressed();
        if(recording_link!='' && recording_link){
          
          await airtable_update_requester.append_call_record(BuyerId, ContactId, recording_link,current_date,"Phone call",Notes,'','')

        }
        
        iscallOngoing = false;
        console.log("Call ended");
        break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }
return false;
}

const CallBackOnClick={}
const CallSpecificContact={}
///////////////////////////BEGIN CALL AND WAIT UNTILL THE CALL HAS NOT ENDED

/////////////////////////////////////// Call Back And Call Contact Specific Function /////////////////////////////////////
async function CallBackfunction(Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific){
  if(Object.keys(CallBackOnClick).length>0){

    console.log(CallBackOnClick);
    CallBackOn=true;
    
    const buyer= Object.values(CallBackOnClick)[0];
    // Accessing the values from the first key-value pair
    const callBackBuyerId = buyer.buyerid;
    const callBackClientId = buyer.Clientid;
    console.log("callClientId",callBackClientId);
    var recordID='';
    // check who we are calling a Buyer in general or a specific contact from the Company

    if (callBackClientId){
       isContactSpecific=true;
       recordID=callBackClientId;
    }else{
      isBuyerSpecific=true;
      recordID=callBackBuyerId;
    }
    console.log("Call Back Buyer Id",callBackBuyerId);
    await Begin_Call_And_Wait(Argument_Object,recordID,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific);
    // remove the call back from the list
      // Remove the first key-value pair from CallBackOnClick after the call is finished
    const firstKey = Object.keys(CallBackOnClick)[0];
    delete CallBackOnClick[firstKey];
  }
  // check if they paused while o
  return;
}

async function CallContactSpecificFunction(Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific){
  console.log("length of the callback dic",Object.keys(CallSpecificContact).length)
  if(Object.keys(CallSpecificContact).length>0){
    setNumRecomToShow(0);
    for(const [key,value] of Object.entries(CallSpecificContact)){
      console.log("calling the Specific COntact",key,value);
      const ContactId = value;
      isBuyerSpecific=false;
      isContactSpecific=true;
      await Begin_Call_And_Wait(Argument_Object,ContactId,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific);
      // Remove the CallBack Data data after the call is finished
      delete CallSpecificContact[key];
      console.log("length of the callback dic after removing",Object.keys(CallSpecificContact).length)

  }
  return;
}
}
////////////////////////////////// Connect to the  Outbounds Calls /////////////////////////////////////////////////////
const Begin_Call_And_Wait = async (Argument_Object, leadID, CurrentVehicle, CallBackOn = false, myUniqueBuyersID, isContactSpecific, isBuyerSpecific) => {
  const { 
    setDialerurl, 
    setVehicleRecommendation, 
    setBuyerDetails, 
    setBuyerNumber, 
    setCurrentVehicle, 
    setCallBackTime, 
    setLoadedContactsInfo, 
    setSkippingBuyer, 
    setNotesContent, 
    setPastNotes ,
    setNumRecomToShow
  } = Argument_Object;

  // Reset various state variables
  setNumRecomToShow(0);
  setCallBackTime('');
  setLoadedContactsInfo('');
  setNotesContent('');
  setPastNotes('');
  Notes = '';

  let isCallOngoing = true;
  calls_count++;

  while (isCallOngoing) {
    if (end_all) {
      setDialerurl('');
      break;
    }
    console.log(leadID);

    try {
      let BuyerData;
      let Recommendation;
      let BuyerId;
      let ContactId;
      console.log("Fetching data for lead");

      const fetchedData = await Requester.get_client_details(leadID, CurrentVehicle, isContactSpecific, isBuyerSpecific);
      
      if (fetchedData.Status === "Failed") {
        return;
      }

      console.log(fetchedData.Status);
      BuyerData = fetchedData.BuyerMetaData;
      Recommendation = fetchedData.Recommendation;
      BuyerId = BuyerData.buyer_id;
      ContactId = BuyerData.clients_id;

      // Skip Simon's Auto Groupe
      const buyerName = BuyerData.buyer_name;
      if (buyerName.includes("Simon's Auto Groupe")) {
        console.log("Skipping Simon's Auto Groupe");
        return;
      }

      console.log("BuyerID outbound Call or callback", BuyerId);
      console.log("ContactID outbound Call or callback", ContactId);

      // Get sorted leads
      BuyerData.Lead_ID = await Requester.sort_leads(BuyerData);

      if (myUniqueBuyersID.has(BuyerId) && !CallBackOn && !isContactSpecific) {
        setSkippingBuyer("Skipping Buyer", BuyerData.buyer_name);
        console.log("Not running ....................");
        break;
      } else {
        setSkippingBuyer("");
        myUniqueBuyersID.add(BuyerId);
      }

      console.log("Recommendation", Recommendation);
      setVehicleRecommendation(Recommendation);
      setBuyerDetails(BuyerData);

      console.log(BuyerData.buyer_name);
      console.log(BuyerData.contact_number);
      setBuyerNumber(BuyerData.contact_number);

      await Requester.MakeCall(BuyerData, setDialerurl).then(async () => {
        console.log("Call setup");
        console.log("endall", end_all);
        if (isPhoneNumber(BuyerData.contact_number) && !end_all) {
          console.log("Making call");
          const resp = await waiting_for_complete_call(setDialerurl, isCallOngoing, BuyerId, ContactId);
          console.log(resp.data);
          isCallOngoing = resp.data;
          console.log(isCallOngoing);
        } else {
          isCallOngoing = false;
          setDialerurl(`${server_url}/lobby`);
        }
      });
    } catch (error) {
      console.error('Error processing leads:', error);
    }
  }
}


////////////////////////////// The Automation Loop to connection inbound or outbound one after another//////////////////////////////////////////////
const startInterface = async (Argument_Object) => {
  try {
    // Destructure properties from Argument_Object
    const { 
      setDialerurl, 
      setVehicleRecommendation, 
      setBuyerDetails, 
      setBuyerNumber, 
      setCurrentVehicle, 
      VehicleTable, 
      setCallBackTime, 
      setTopOffer, 
      setLoadedContactsInfo, 
      setSkippingBuyer,
      interaction_table, 
      setNotesContent, 
      setNumRecomToShow, 
      setPastNotes 
    } = Argument_Object;
    
    // Create Argument Object for Initiating calls
    const initate_Incoming_Argument_Object = {
      setDialerurl,
      setBuyerDetails, 
      setVehicleRecommendation, 
      setCurrentVehicle,
      setCallBackTime,
      setLoadedContactsInfo,
      setNotesContent,
      setPastNotes
    };

    console.log("Fetching Vehicle Data...");
    const records = await fetcher.fetchVehicles(VehicleTable);
    console.log(records.length);

    for (let i = 0; i < records.length; i++) {
      await check_paused_pressed();
      if (end_all) {
        setDialerurl("");
        break;
      }

      const record = records[i];
      const is_vehicle = record.getCellValue("Dial Vehicle").name;
      const top_offer = record.getCellValue("Top Offer");

      if (is_vehicle === "Dialed" || is_vehicle === "Dial-In-Progess") {
        console.log("Potential Buyer for this vehicle has been Dialed before");
        continue;
      } else {
        await VehicleTable.updateRecordAsync(record, {
          "Dial Vehicle": { name: 'Dial-In-Progess' }
        });
      }

      console.log("Vehicle record", record);
      const data = await fetcher.fetchPotentialBuyersIds(record);
      
      if (!data || !data.leadIds || data.leadIds.length === 0) {
        console.log("No potential buyers... Moving to next vehicle");
        continue;
      }

      const { leadIds, currentVehicle } = data;
      const num_Buyers = leadIds.length;
      setCurrentVehicle(currentVehicle);
      setTopOffer(top_offer);

      for (let j = 0; j < num_Buyers; j++) {
        await check_paused_pressed();
        if (end_all) {
          setDialerurl('');
          break;
        }

        setNumRecomToShow(0);
        setNotesContent('');
        var CallBackOn = false;
        var isContactSpecific = false;
        var isBuyerSpecific = false;

        await intitiate_incoming_call(initate_Incoming_Argument_Object);
        setCurrentVehicle(currentVehicle);
        await check_paused_pressed();
        
        await CallBackfunction( Argument_Object, currentVehicle, CallBackOn, myUniqueBuyersID, isContactSpecific, isBuyerSpecific);

        await check_paused_pressed();
        await CallContactSpecificFunction( Argument_Object, currentVehicle, CallBackOn, myUniqueBuyersID, isContactSpecific, isBuyerSpecific);

        await check_paused_pressed();
        await CallBackfunction(Argument_Object, currentVehicle, CallBackOn, myUniqueBuyersID, isContactSpecific, isBuyerSpecific);

        await Begin_Call_And_Wait(Argument_Object, leadIds[j], currentVehicle, CallBackOn, myUniqueBuyersID, isContactSpecific, isBuyerSpecific);
        await intitiate_incoming_call(initate_Incoming_Argument_Object);
        setCurrentVehicle(currentVehicle);

        await VehicleTable.updateRecordAsync(record, {
          "Dial Vehicle": { name: 'Dial-In-Progess' }
        });
      }

      await VehicleTable.updateRecordAsync(record, {
        "Dial Vehicle": { name: 'Dialed' }
      });
    }
  } catch (error) {
    console.error('Error starting interface:', error);
  }
};

function HelloWorldApp() {
//// state variables for HelloWorldApp
  const base = useBase();
  /// get the vehicle table
  const VehicleTable = base.getTable("Vehicles");
  /// get the interaction table
  const interaction_table = base.getTable('Interactions');
  /// define the react hook using useState()
  const [dialerurl, setDialerurl] = useState("");
  const [VehicleRecommendation,setVehicleRecommendation]=useState([]);
  const [BuyerDetails,setBuyerDetails]=useState([]);
  const [BuyerNumber,setBuyerNumber]=useState();
  const [CurrentVehicle,setCurrentVehicle]=useState();
  const [callBackTime, setCallBackTime] = useState('');
  const [TopOffer ,setTopOffer]=useState('');
  const [LoadedContacts,setLoadedContactsInfo]=useState([]);
  const [showContacts,setShowContacts]=useState(false);
  const [Skipping,setSkippingBuyer]=useState('');
  const [NotesContent,setNotesContent]=useState('');
  const [NumRecomToShow,setNumRecomToShow]=useState(0);
  const [pastNotes, setPastNotes] = useState([]);

  //// function to start the Home interface from where the AGent is going to Make Calls

  /// pass arguments as object 
  const Argument_Object = {
    setDialerurl,
    setVehicleRecommendation,
    setBuyerDetails,
    setCurrentVehicle,
    setBuyerNumber,
    VehicleTable,
    setCallBackTime,
    setTopOffer,
    setLoadedContactsInfo,
    setSkippingBuyer,
    interaction_table,
    setNotesContent,setNumRecomToShow,
    setPastNotes

  }

  //// main starting point for our Dialer 
  useEffect(() => {
     startInterface(Argument_Object);
  },[])



const [inputValue, setInputValue] = useState('');
// set offer amount 
async function setofferamount(LeadID) {
  const response =await axios.post(`${server_url}/set-offer-amount`,{
    lead_ID:LeadID,
  offer_amount: inputValue
} )
}
// handle input change for each lead
const handleInputChange = (LeadID, value) => {
  console.log(`Input changed for ${LeadID}: ${value}`);
  setInputValue(prevInputValues => ({
    ...prevInputValues,
    [LeadID]: value
  }));
};

// Send SMS to the client
async function SendSMSVehicle(vehicle_name, vehicleId, leadid) {
  try {
    await axios.post(`${server_url}/message`, {
      "message": vehicle_name,
      "To": BuyerDetails.contact_number
    });
    // Append send SMS status in interaction table
    const current_time = new Date().toISOString();
    await airtable_update_requester.append_call_record(BuyerDetails.buyer_id, BuyerDetails.clients_id, '', current_time, "SMS", "", vehicleId, leadid);
  } catch (error) {
    console.log(error);
  }
}

///// handle update lead status change
const [leadStatus, setLeadStatus] = useState({});
async function update_lead_status(LeadID, value, VehicleID) {
  airtable_update_requester.recommendation_made_on_Call.add(LeadID);
  airtable_update_requester.recommendatedVehicle.add(VehicleID);
  const updatedLeadStatus = { ...leadStatus, [LeadID]: value };
  setLeadStatus(updatedLeadStatus);
  try {
    await axios.post(`${server_url}/set-progress-status`, {
      lead_ID: LeadID,
      progress: value
    });
  } catch (error) {
    console.error(error);
  }
}


//// store the entered note text in the  notes content
async function HandleNotes(text) {
  console.log(BuyerDetails.buyer_id,text)
  Notes=text;
  setNotesContent(text);
}


/// Set CallBack reminder 
const handleTimeChange = (event) => {
  // Extract the time value from the input
  const selectedTime = event.target.value;
  callback.set_call_back_reminder(selectedTime,BuyerDetails.buyer_name,BuyerDetails.contact_number,BuyerDetails.buyer_id,BuyerDetails.clients_id);
  setCallBackTime(selectedTime);
  console.log(`Selected time: ${selectedTime}`);
};

///////////////////////////////////////////////////////// click to view contacts info /////////////////////////////////////////////////////
const ShowContactInfo = async (Buyerid) => {
  try {
    const ViewContactButton = document.querySelector(".View-Contacts-button");
    
    if (!Buyerid) {
      return;
    }
    
    ViewContactButton.textContent = "Loading Contacts...";
    
    console.log("Clicked to see the buyer's contacts details:", Buyerid);
    const response = await axios.post(`${server_url}/get-contacts-for-buyer`, {
      BuyerID: Buyerid
    });
    
    const { data } = response;
    console.log("Show Contacts:", data);
    
    if (!data || data.length === 0) {
      setShowContacts(false);
      ViewContactButton.textContent = "No Contacts Found!";
      return;
    }
    
    setLoadedContactsInfo(data);
    setShowContacts(prevShowContacts => !prevShowContacts);
    
    if (Buyerid) {
      ViewContactButton.classList.add("hide");
    }
    
    console.log(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
};

///////////////////////////////////////////////////////////////////////////////
const [clickedContacts, setClickedContacts] = useState({});
// call the contact which was clicked on the UI
const ClickedOnContact = async (contacts, ContactID) => {
  var Cname=contacts.name;
  // var BuyerID=contacts.BuyerID;
  
  setClickedContacts(prevState => ({
    ...prevState,
    [Cname]: true
  }));
  CallSpecificContact[Cname]=ContactID;
  console.log("call specific contact",CallSpecificContact);

};

async function handleViewMore() {
  try {
    const leadId = BuyerDetails.Lead_ID;
    
    if (!leadId) {
      return;
    }

    const send_leadId = leadId.slice(NumRecomToShow, NumRecomToShow + 3);
    console.log("Next lead to get more recommendations:", send_leadId);

    setNumRecomToShow(NumRecomToShow + 3);

    const response = await axios.post(`${server_url}/get-more-recommendation`, {
      leadids: send_leadId,
    });

    const newRecommendation = response.data;
    console.log("New recommendation:", newRecommendation);

    const recommendationsArray = Object.values(VehicleRecommendation);
    const newRecommendationArray = Object.values(newRecommendation);

    setVehicleRecommendation([...recommendationsArray, ...newRecommendationArray]);
    console.log("Recommendation data after adding or combining:", VehicleRecommendation);
    console.log("Load more recommendations");
  } catch (error) {
    console.error('Error fetching more recommendations:', error);
  }
}


////////////////////////////////////////////////////Main Body of UI after Clicking On The Start Button
return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <HeaderComponent  
      TopOffer={TopOffer}
      handleTimeChange={handleTimeChange}
      CurrentVehicle={CurrentVehicle}
      callBackTime={callBackTime}
    />
    <div className="main-container">
      <div className="dialer-container">
        <iframe id="flex" src={dialerurl} allow="camera *; microphone *; speaker *" style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
      </div>
      <div className="recommendation-container">
        <VehicleRecommendationComponent 
          VehicleRecommendation={VehicleRecommendation}
          vehicleNameToMoveToTop={CurrentVehicle} 
          leadStatus={leadStatus}
          setLeadStatus={setLeadStatus}
          update_lead_status={update_lead_status}
          handleInputChange={handleInputChange}
          setofferamount={setofferamount}
          SendSMSVehicle={SendSMSVehicle}
          inputValue={inputValue}
          handleViewMore={handleViewMore}
        />
      </div>
    </div>
    <div className="show-contact-container-main">
      <button  className="View-Contacts-button" onClick={() => ShowContactInfo(BuyerDetails.buyer_id)}>Show Contacts</button>
      
      {showContacts && <ShowContactComponents LoadedContacts={LoadedContacts} clickedContacts={clickedContacts} ShowContactInfo={ShowContactInfo} ClickedOnContact={ClickedOnContact} showContacts={showContacts} />}
    </div>
    <div className="horizontal-container">
      <div className="buyer-info-container">
        <BuyerContactComponents 
          BuyerDetails={BuyerDetails}
          LoadedContacts={LoadedContacts} 
          clickedContacts={clickedContacts} 
          ShowContactInfo={ShowContactInfo} 
          ClickedOnContact={ClickedOnContact} 
          showContacts={showContacts}
        />
      </div>
      <div className="preview-notes-container">
        <PastNotesParentComponent pastNotes={pastNotes} setPastNotes ={setPastNotes} BuyerDetails={BuyerDetails} server_url={server_url} />
      </div>
      <div className="text-area-container">
        <textarea value={NotesContent} placeholder="Write notes here..." onChange={(e) => HandleNotes(e.target.value)}></textarea>
      </div>
    </div>
  </div>
);



}


//// Login Method 
function Login({ onSubmit }) {
  // State variables
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [alertActivity, setAlertActivity] = useState('');

  // Event handlers
  const handleUserIdChange = (event) => {
    setUserId(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Determine server URL based on userId
    if (userId === 'user2002') {
      server_url = 'server_url';
    } else if (userId === 'user2003') {
      server_url = 'server_url';
    }

    try {
      // Check if user is already logged in
      const activeUser = await axios.post(`${server_url}/incoming-assigned`);
      
      if (activeUser.data.isUserLogged) {
        setAlertActivity('User Already Logged In');
        return;
      }

      // Attempt login
      const response = await axios.post(`${server_url}/login`, {
        userId: userId,
        password: password,
        ngrok_url: server_url
      });

      const { login_status } = response.data;

      if (login_status === 'success') {
        // If login successful, set userIdentifier and initialize Requester
        userIdentifier = userId;
        const variables = new Variables(server_url, userIdentifier);
        Requester = new SendRequest(variables);
        airtable_update_requester = new Airtable_Update_Request(variables);
        IncomingHandler = new Incoming(server_url, userIdentifier);
        onSubmit(true);
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  // Render the LoginComponents with necessary props
  return (
    <LoginComponents 
      userId={userId} 
      password={password} 
      handleUserIdChange={handleUserIdChange} 
      handlePasswordChange={handlePasswordChange} 
      handleSubmit={handleSubmit}
      alertActivity={alertActivity} 
    />
  );
}

//// page render after sucessful login
function LoginSuccessBlock() {
  return (
    <div className="container">
    <h1>Hello! Welcome Back Let's Make More Calls Today?</h1>
    <div className="emoji">📞😊</div>
  </div>
  )
}

//// page render after logout
//jsx means javascript xml lets you draw hmtl compoenents within the javascript like how we define javascript code in html code
function LogoutBlock() {
  return (
    <div className="container">
      <h1>Thank You for Working Today! See you next time! <span className="goodbye-emoji">👋🏻</span></h1>
    </div>
  );
}

///// continuously check for incoming call to alert Agent that he is about to attend a incoming call
/// intervals vairable
let incomingInterval;
let reminderInterval;
let footprintUser;
//// start and Default page render
function LoginBlock() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoggedOut, setLoggedOut] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('LoginSuccessBlock');
  const [buttonState, setButtonState] = useState('Pause');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [incomingNotify, setIncomingNotify] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callBackCallerName, setCallBackCallerName] = useState('');
  const [callBackNumber, setCallBackNumber] = useState('');
  const [callBackBuyerID, setCallBackBuyerID] = useState('');
  const [callBackClientID, setCallBackClientID] = useState('');

  function handleStartBlock() {
    setButtonClicked(true);
    const incomingInterval = setInterval(() => {
      IncomingHandler.checkIncomingCall(setIncomingNotify);
    }, 12000);

    const reminderInterval = setInterval(() => {
      callback.check_the_system_time(setIsDialogOpen, setCallBackCallerName, setCallBackNumber, setCallBackBuyerID, setCallBackClientID);
    }, intervalTime);

    setCurrentPhase('HelloWorldApp');

    const footprintUser = setInterval(async () => {
      try {
        await axios.post(`${server_url}/last-request`);
      } catch (error) {
        console.error(error);
      }
    }, 900000);
  }

  async function handleLogOutBlock() {
    setLoggedOut(true);
    await axios.post(`${server_url}/logout`, {
      call_count: calls_count,
      userid: userIdentifier
    });

    calls_count = 0;
    clearInterval(reminderInterval);
    clearInterval(incomingInterval);
    clearInterval(footprintUser);
    end_all = true;
    setCurrentPhase('Login');
    console.log("Logout");
  }

  async function callBackClient() {
    const buyername = callBackCallerName;
    const buyerid = callBackBuyerID;
    const Clientid = callBackClientID;
    const callBackNumber = callBackNumber;
    CallBackOnClick[buyername] = { buyerid, Clientid };
    setIsDialogOpen(false);
  }

  function handlePauseResumeBlock() {
    if (buttonState === 'Pause') {
      setButtonState('Resume');
      isPaushed = true;
    } else if (buttonState === 'Resume') {
      setButtonState('Pause');
      isPaushed = false;
    }
  }

  const handleLogin = (isSuccess) => {
    setLoggedIn(isSuccess);
  };

  return (
    <div>
      {!loggedIn ? (
        <Login onSubmit={handleLogin} />
      ) : (
        <>
          {isLoggedOut ? (
            <LoginBlock />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button className="logout-button" onClick={handleLogOutBlock} icon="logout">Logout</button>
                  <button className='start-button' onClick={handleStartBlock} disabled={buttonClicked}>Start</button>
                  <button className='pause-resume-button' onClick={handlePauseResumeBlock}>
                    {buttonState === 'Pause' ? 'Pause' : 'Resume'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <span style={{ marginRight: '5px', fontWeight: 'bold', fontSize: '16px' }}>Incoming</span>
                  {/* Dynamic circle */}
                  <div className={`circle ${incomingNotify ? 'red' : 'green'}`}></div>
                </div>
              </div>

              {/* Dialog component */}
              {isDialogOpen && (
                <Dialog onClose={() => setIsDialogOpen(false)} width="320px">
                  <Dialog.CloseButton />
                  <Heading>CallBack Alert📞</Heading>
                  <Text variant="paragraph">
                    Reminder! Please Call Back the Buyer {callBackCallerName} at {callBackNumber}!!
                  </Text>
                  <Button onClick={() => callBackClient()}>Call Next</Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Ignore</Button>
                </Dialog>
              )}

              {/* Render different components based on the current phase */}
              <div className='Function-main-containers'>{currentPhase === 'LoginSuccessBlock' && <LoginSuccessBlock />}</div>
              <div className='Function-main-containers'>{currentPhase === 'HelloWorldApp' && <HelloWorldApp />} </div>
              <div className='Function-main-containers'>{currentPhase === 'LogoutBlock' && <LogoutBlock />}</div>
              <div className='Function-main-containers'>{currentPhase === 'LoginBlock' && <LoginBlock /> }</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

initializeBlock(() => <LoginBlock />);

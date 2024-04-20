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

import { SendRequest } from './function.js';
import { FetchIds } from './fetchMethods';

const fetcher = new FetchIds();

let calls_count=0;
var userIdentifier;

// Define a cancel token source
var ngrok_url_1;

// request has various method that send reuqest to backend
var Requester; 

function isPhoneNumber(phoneNumber) {
    // Regular expression to match a phone number in the format (XXX) XXX-XXXX
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    
    // Test if the phoneNumber matches the regular expression
    return phoneRegex.test(phoneNumber);
  }


var Notes=''
var isPaushed=false;


// async function FetchRecordDetails (ID,Currentvehicle,isContactSpecific,isBuyerSpecific) {

//   try {
//       const response = await axios.post(`${ngrok_url_1}/fetch-OutBound-Dealer-AirData`, {
//           RecordID: ID,
//           ContactSpecific : isContactSpecific,
//           BuyerSpecific : isBuyerSpecific,
//           CurrentVehicle:Currentvehicle
//       });
//       return response.data;
//   } catch (error) {
//       console.error('Error fetching record details:', error);
//       return {}; // Return an empty object or handle the error accordingly
//   }
// }

async function MakeCall(BuyerData, setDialerurl) {
  try{
  const { buyer_name: name, contact_number: number } = BuyerData;
  await Requester.send_call_details(number, name).then((response) => {
    const url = isPhoneNumber(number) ? `${ngrok_url_1}/dialer?name=${name}&number=${number}&username=${userIdentifier}` : `${ngrok_url_1}/lobby`;
    setDialerurl(url);
  
  })
}catch(error){
console.log("Error coming from MakeCall",error)
}
}


let end_all=false;
async function ConnectAgentWithIncoming(setDialerurl,incoming_number,setBuyerDetails,setVehicleRecommendation,setCurrentVehicle){
  try{
  // to uniquely identify incomings if there are more than one in queue
  const num_connect="+11234567890"
  const dummy_buyer = `Caller${incoming_number}`;
  console.log("setting up caller",num_connect,dummy_buyer)
  const url_call = `${ngrok_url_1}/call?dealer_number=` + num_connect + '&dealer_name=' + dummy_buyer + '&channel_type=call&username='+userIdentifier;
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


    const url = isPhoneNumber(num_connect) ? `${ngrok_url_1}/dialer?name=${num_connect}&number=${dummy_buyer}&username=${userIdentifier}` : `${ngrok_url_1}/lobby`;
    setDialerurl(url); 
    return BuyerData;
  }
catch(error){
    console.log("Error coming from ConnectAgentWithIncoming",error)
  }
 return {}
  }
  
  async function checkIncomingCall(setIncomingNotify = null) {
    try {
      const response = await axios.post(`${ngrok_url_1}/check-queue-for-incoming`);
      const incoming_check = response.data.incoming;
      const queue_length = response.data.queue_size;
  
      if (setIncomingNotify) {
        if (incoming_check === "Yes") {
          setIncomingNotify(true);
        } else {
          setIncomingNotify(false);
        }
      }
  
      return { incoming_check, queue_length };
    } catch (error) {
      console.error('An error occurred while checking for incoming call:', error);
      // If you don't want the error to propagate further, you can handle it here
      // For example, you can return a default value or an empty object
      console.log({ incoming_check: null, queue_length: null })
      return { incoming_check: null, queue_length: null };
    }
  }
  
const recommendation_made_on_Call= new Set()
const recommendatedVehicle = new Set()
async function append_call_record( buyerId, ContactId, recording_url,date,type,NotesContent,VehicleId,leadID) {
  console.log("NOts ",NotesContent)
  if( type=="Phone call"){
    console.log("append call record",buyerId,ContactId,recording_url,date,type,NotesContent,VehicleId,leadID)
  const recommendationArray = Array.from(recommendation_made_on_Call);
  const recommendationVehicleArray=Array.from(recommendatedVehicle);
  console.log(recommendationVehicleArray)
  console.log(recommendationArray)
  await axios.post(`${ngrok_url_1}/set-interaction-status`, {
    Type:"Phone call",
    Date:date,
    BuyerID:buyerId,
    ContactID:ContactId,
    LeadID:recommendationArray,
    Notes:NotesContent,
    VehicleID:recommendationVehicleArray,
    recording:recording_url
  })
}else if(type=="SMS"){

  await axios.post(`${ngrok_url_1}/set-interaction-status`, {
    Type:type,
    Date:date,
    BuyerID:buyerId,
    ContactID:ContactId,
    LeadID:[leadID],
    VehicleID:[VehicleId],
    recording:recording_url
  })
}
//refresh the set to hold new recommendation,vehicles made for each contact 
recommendation_made_on_Call.clear();
recommendatedVehicle.clear();

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
          const call_response = await axios.post(`${ngrok_url_1}/Check-Call-State`,{
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
              
              await append_call_record(BuyerId, ContactId, recording_link,current_date,"Phone call",Notes,'','')

            }
            // else{
            //   await append_call_record(BuyerId, ContactId, '',current_date,"Phone call",Notes,'','')

            // }
            console.log("clear the queue details")
            await axios.post(`${ngrok_url_1}/refresh-queue`,{
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
  const result =await checkIncomingCall();
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
    const result_next =await checkIncomingCall();
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

//////////// SET THE CALL BACK Time With Caller Data///////
const reminders = {};
async function set_call_back_reminder(reminder_time,BuyerName,Buyer_Number,BuyerID,ClientID) {
  if(reminder_time.trim() !== ''){  reminders[BuyerName] = {reminder_time,Buyer_Number,BuyerID,ClientID};
  }
  console.log("timer set")
  console.log(reminders)
  return;
}
///////////////////CHECK IF THE SET TIME HAS CAME/////////////////
async function check_the_system_time(setIsDialogOpen,setCallBackCallerName,setCallBackNumber,setCallBackBuyerID,setCallBackClientID) {
  for (const [BuyerName, reminder] of Object.entries(reminders)) {
    console.log("Checking and sending alert if matched for", BuyerName);
    const current_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const reminder_time = reminder.reminder_time;
    const BuyerID = reminder.BuyerID;
    const ClientID=reminder.ClientID;
    console.log("Reminder time:", reminder_time);
    console.log("Current time:", current_time);
    if (reminder_time === current_time) {
      const CallBackNumber = reminder.Buyer_Number;
      // alert(`Please Call Back Buyer: ${BuyerName} at ${CallBackNumber}`);
      // SET CALLBACK CALLER DETAILS
      setCallBackCallerName(BuyerName);
      setCallBackNumber(CallBackNumber);
      setCallBackBuyerID(BuyerID);
      setCallBackClientID(ClientID);
      setIsDialogOpen(true);
      delete reminders[BuyerName]; // Clear the reminder after alerting
      console.log("Reminder cleared:", BuyerName,reminder);
    }
  }
  return;
}

  const intervalTime = 10000; // For example, check every minute

  // Function to check reminder continuously
  // const reminderInterval = setInterval(() => {
  //   check_the_system_time();
  // }, intervalTime);

const CallBackOnClick={}
const CallSpecificContact={}
///////////////////////////BEGIN CALL AND WAIT UNTILL THE CALL HAS NOT ENDED

/// get hot vehicle at top ==> warm ===>cold
const sort_leads = async (BuyerData) => {
  await axios.post(`${ngrok_url_1}/arrange-lead-based-score`,{
    leadids:BuyerData.Lead_ID
  }).then((response) => {
    const sorted_leadid=response.data;
    console.log("SORTED LEADid",sorted_leadid)
    BuyerData.Lead_ID=sorted_leadid
  })
}

async function waiting_for_complete_call(setDialerurl,iscallOngoing,BuyerId, ContactId){

  while (iscallOngoing) {
    if(end_all){
      setDialerurl('')
      break
    }
    const current_date=new Date().toISOString();
    console.log("Checking call status...");

    try {
      const call_response = await axios.post(`${ngrok_url_1}/Check-Call-State`,{
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
          
          await append_call_record(BuyerId, ContactId, recording_link,current_date,"Phone call",Notes,'','')

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

const Begin_Call_And_Wait = async (Argument_Object,leadID,CurrentVehicle,CallBackOn=false,myUniqueBuyersID,isContactSpecific,isBuyerSpecific) => {
  const { setDialerurl, setVehicleRecommendation,setBuyerDetails,setBuyerNumber,setCurrentVehicle,VehicleTable,setCallBackTime,setTopOffer,setLoadedContactsInfo,setSkippingBuyer,
    interaction_table,setNotesContent,setPastNotes} = Argument_Object;
  setCallBackTime('');
  setLoadedContactsInfo('')
  setNotesContent('')
  setPastNotes('')
  Notes=""
  // const leadID = leadIds[j];
  var iscallOngoing = true;
  calls_count=calls_count+1;
  while (iscallOngoing ) {
    if(end_all){
      setDialerurl('');
      break;
    }
    console.log(leadID);

    try {
      var BuyerData;
      var Recommendation;
      var BuyerId;
      var ContactId;
      console.log("fetching data for lead")
 
      await Requester.get_client_details(leadID,CurrentVehicle,isContactSpecific,isBuyerSpecific).then((fetchedData) => {
        if (fetchedData.Status === "Failed") {
          return;
        }

        console.log(fetchedData.Status);
        BuyerData = fetchedData.BuyerMetaData;
        Recommendation = fetchedData.Recommendation;
        BuyerId = BuyerData.buyer_id;
        ContactId = BuyerData.clients_id;
      });
      /// skip the simon's Auto Groupe
      const buyerName = BuyerData.buyer_name;
      if (buyerName.includes("Simon's Auto Groupe")) {
        console.log("Skipping Simon's Auto Groupe");
          return;
      }
      console.log("BuyerID outbound Call or callback",BuyerId);
      console.log("ContactID outbound Call or callback",ContactId);
      sort_leads(BuyerData)
      if (myUniqueBuyersID.has(BuyerId) && !(CallBackOn) && !(isContactSpecific)) {
        setSkippingBuyer("Skipping Buyer",BuyerData.buyer_name);
        console.log("not runing ....................")
        break;
      }else{
        setSkippingBuyer("")
        myUniqueBuyersID.add(BuyerId);
      }
        
        console.log("recommendation",Recommendation);
        setVehicleRecommendation(Recommendation);
        setBuyerDetails(BuyerData);
      

      console.log(BuyerData.buyer_name);
      console.log(BuyerData.contact_number);
      setBuyerNumber(BuyerData.contact_number);
      await MakeCall(BuyerData, setDialerurl).then(async () => {
        console.log("Call setup");
        console.log("endall",end_all)
        if (isPhoneNumber(BuyerData.contact_number) && !end_all) {
          console.log("making call")
          const resp=await waiting_for_complete_call(setDialerurl,iscallOngoing,BuyerId, ContactId)
          console.log(resp.data)
          iscallOngoing=resp.data;
          console.log(iscallOngoing)
        } else {
          iscallOngoing = false;
          setDialerurl(`${ngrok_url_1}/lobby`);
        }
      });
    } catch (error) {
      console.error('Error processing leads:', error);
    }
  }
}

async function CallBackfunction(setNumRecomToShow,Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific){
  if(Object.keys(CallBackOnClick).length>0){
  
    setNumRecomToShow(0);
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

async function CallContactSpecificFunction(setNumRecomToShow,Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific){
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
  // Object.keys(CallSpecificContact).shift();
}
}
const startInterface = async (Argument_Object) => {
    // Extracting  properties from Argument_Object
  const { setDialerurl, setVehicleRecommendation,setBuyerDetails,setBuyerNumber,setCurrentVehicle,VehicleTable,setCallBackTime ,setTopOffer,setLoadedContactsInfo,setSkippingBuyer,
    interaction_table,setNotesContent,setNumRecomToShow,setPastNotes} = Argument_Object;
   // create Argument Object for Initating calls
  const initate_Incoming_Argument_Object={
    setDialerurl,
    setBuyerDetails, 
    setVehicleRecommendation, 
    setCurrentVehicle,
    setCallBackTime,
    setLoadedContactsInfo,
    setNotesContent,
    setPastNotes
   
  }/// close runinng 
  

  try {
    const myUniqueBuyersID = new Set();
    /// get vehicles details from Vehicle table
    console.log("Fetching Vehicle Data...")
    const records = await fetcher.fetchVehicles(VehicleTable);
    console.log(records.length);
     
    for (let i = 0; i < records.length; i++) {
      // check if paused before proceeding
      console.log(end_all);
      await check_paused_pressed();
      if(end_all){
        setDialerurl("")
        break;
      }
      const record = records[i];
      const is_vehicle = record.getCellValue("Dial Vehicle").name;
    
     console.log(is_vehicle);
      /// set the top offered for the running Vehicle
      const top_offer = record.getCellValue("Top Offer");
    
      // check if it is already dialed 
      // is_vehicle === "Dial-In-Progess"
      if (is_vehicle === "Dialed" || is_vehicle === "Dial-In-Progess") {
        console.log("Potential Buyer for this vehicle has been Dialed before");
        continue;
      }
    else{
      await VehicleTable.updateRecordAsync(record, {
        "Dial Vehicle": { name: 'Dial-In-Progess' }
      });
    }

      console.log("Vehicle record", record);
      /// get the rECORD iD for all potential buyers for that vehicle
      var leadIds;
      var currentVehicle;
      try {
      const data = await fetcher.fetchPotentialBuyersIds(record);
      if(data === null){
        console.log("No potential buyers...movving to next vehicle")
        continue;
      }
      leadIds = data.leadIds;
      currentVehicle = data.CurrentVehicle;
      } catch (error) {
        console.log("Error in fetchPotentialBuyersIds", error);
        continue;
      }
     if(leadIds.length==0){
       continue;
     }
      console.log("currentVehicle", currentVehicle);
      console.log("leadIds", leadIds);
      const num_Buyers=leadIds.length;
      setCurrentVehicle(currentVehicle);
      setTopOffer(top_offer);
      /// start looping through each potential buyers while considering incoming,callbacks and Buyer's specified calls
      for (let j = 0; j <num_Buyers; j++) {
        if(end_all){
          setDialerurl('')
          break;
        }
        /// set defaults 
        setNumRecomToShow(0);
        setNotesContent('');
        var CallBackOn=false;
        var isContactSpecific=false;
        var isBuyerSpecific=false;
        /// check paused before moving on
        await check_paused_pressed();
        /// check the incoming before making lead calls as we prior incoming calls
        await intitiate_incoming_call(initate_Incoming_Argument_Object);
        setCurrentVehicle(currentVehicle);
        /// Now set the current state of vairable so that we could render it on UI
        
        /// Check Again if paushed in case agent pasued when s/he on incoming calls 
        await check_paused_pressed();
        console.log("===========================callback 1==========================")
        
        await CallBackfunction(setNumRecomToShow,Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific)
       
        await check_paused_pressed();
        /////////////////////////Call Specific Contact Checks////////////////////
        /// check if the Agent has to call a specific contact from a specific Company as based on Previous call with Buyer or Company
        // console.log("call contact specified length",CallContactSpecificlength)
        console.log("=========================call contact specific============================")
        await CallContactSpecificFunction(setNumRecomToShow,Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific);
  
    
      console.log("========================call back 2===========================")
      await CallBackfunction(setNumRecomToShow,Argument_Object,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific)
   
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /// Check Again for Paush
    await check_paused_pressed();

    ////////////////////////////////Start the Call to the Potential Buyers or Leads////////////////////////////////////////////////
    const leadid=leadIds[j];
    // const BuyerRecord=await getBuyerDetails(leadid,base);
    // await new Promise(resolve => setTimeout(resolve, 100000));

    console.log("Initaing call to Lead",leadid);
    /// we are calling for leads not for any specific buyer and contact
    isBuyerSpecific=false;
    isContactSpecific=false;
    setNumRecomToShow(0);
    await Begin_Call_And_Wait(Argument_Object,leadid,currentVehicle,CallBackOn,myUniqueBuyersID,isContactSpecific,isBuyerSpecific);
    // new Promise (resolve => setTimeout(resolve, 1000000));
    await intitiate_incoming_call(initate_Incoming_Argument_Object);
    setCurrentVehicle(currentVehicle);
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        await VehicleTable.updateRecordAsync(record, {
          "Dial Vehicle": { name: 'Dial-In-Progess' }
        });
        
      }
      // after calling all dealer set the vehicle as Dialed
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
  const LeadTable = base.getTable("Leads");
  const VehicleTable = base.getTable("Vehicles");
  const interaction_table = base.getTable('Interactions');
  // const CompanyTable = base.getTable("Companies");
  const [dialerurl, setDialerurl] = useState("");
  const [VehicleRecommendation,setVehicleRecommendation]=useState([]);
  const [BuyerDetails,setBuyerDetails]=useState([]);

  const [BuyerNumber,setBuyerNumber]=useState();
  const [CurrentVehicle,setCurrentVehicle]=useState();

  const [callBackTime, setCallBackTime] = useState('');
  const [TopOffer ,setTopOffer]=useState('');
  const [LoadedContacts,setLoadedContactsInfo]=useState([]);
  const [showContacts,setShowContacts]=useState(false);
  const [IncomingNotify,setIncomingNotify]=useState(false);
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

//// set offer amount 
async function setofferamount(LeadID) {
    const response =await axios.post(`${ngrok_url_1}/set-offer-amount`,{
      lead_ID:LeadID,
    offer_amount: inputValue
  } )
}
const handleInputChange = (LeadID, value) => {
  console.log(`Input changed for ${LeadID}: ${value}`);
  setInputValue(prevInputValues => ({
    ...prevInputValues,
    [LeadID]: value
  }));
};
//// send sms 
async function SendSMSVehicle(vehicle_name,vehicleId,leadid){
  try{
  const response =await axios.post(`${ngrok_url_1}/message`,{
    "message":vehicle_name,
    "To":BuyerDetails.contact_number
  })
  const current_time=new Date().toISOString();
  // append send sms status in interaction table
  
  await append_call_record(BuyerDetails.buyer_id, BuyerDetails.clients_id,'', current_time, "SMS","",vehicleId,leadid)
}catch(error){
  console.log(error)
}
}

///// handle status change
const [leadStatus, setLeadStatus] = useState({});

async function handleLeadStatusChange(LeadID, value,VehicleID) {
  recommendation_made_on_Call.add(LeadID);
  recommendatedVehicle.add(VehicleID);
  console.log(`Select changed for ${LeadID}: ${value}`); 
  const updatedLeadStatus = { ...leadStatus, [LeadID]: value };
  setLeadStatus(updatedLeadStatus);
  const response =await axios.post(`${ngrok_url_1}/set-progress-status`,{
    lead_ID:LeadID,
    progress: value
  } )
 
}
//// handle  notes 
async function HandleNotes(text) {
  console.log(BuyerDetails.buyer_id,text)
  Notes=text;
  setNotesContent(text);
}


/// extract CallBack time from input
const handleTimeChange = (event) => {
  // Extract the time value from the input
  const selectedTime = event.target.value;
  set_call_back_reminder(selectedTime,BuyerDetails.buyer_name,BuyerDetails.contact_number,BuyerDetails.buyer_id,BuyerDetails.clients_id);
  setCallBackTime(selectedTime);
  console.log(`Selected time: ${selectedTime}`);
};

///////////////////////////////////////////////////////// click to view contacts info /////////////////////////////////////////////////////

const ShowContactInfo = async(Buyerid) => {
  const ViewContactButton = document.querySelector(".View-Contacts-button");
  
  if(!Buyerid){
    return;
  }
  ViewContactButton.textContent="Loading Contacts..."
 
  try {
    console.log("Clicked to see the buyer's contacts details:", Buyerid);
    const response = await axios.post(`${ngrok_url_1}/get-contacts-for-buyer`, {
      BuyerID: Buyerid
    });
    const { data } = response;
    console.log("Show Contacts:", data);
    if (data.length === 0 || !data) {
      setShowContacts(false)
      ViewContactButton.textContent="No Contacts Found!"
      return;
    }
    setLoadedContactsInfo(data);
    setShowContacts(showContacts=>!showContacts);
    if(Buyerid){
      ViewContactButton.classList.add("hide");
    }
    console.log(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }

}

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

/// handle to view more recommendation
async function handleViewMore ()  {
  const leadid=BuyerDetails.Lead_ID;
  console.log(leadid)
  if(leadid == null) {
    return;
  }
  // console.log(leadid)
  const send_leadid=leadid.slice(NumRecomToShow,NumRecomToShow+3);

  console.log("next lead send to get more recommendation",send_leadid)
  setNumRecomToShow(NumRecomToShow+3);
  const response=await axios.post(`${ngrok_url_1}/get-more-recommendation`, {
    leadids:send_leadid,

  })
  var newRecommendation=response.data;
  console.log("newRecommendation",newRecommendation)
     // Convert VehicleRecommendation to an array of recommendation objects
  const recommendationsArray = Object.values(VehicleRecommendation);
  const newRecommendationArray = Object.values(newRecommendation);
  console.log("newRecommendationArray",newRecommendationArray)
  await setVehicleRecommendation([...recommendationsArray , ...newRecommendationArray])
  console.log("Recommendation data after adding or combining",VehicleRecommendation)
  console.log("load more recommendation")
};
//////////////////////////////////////////////// Recommendation Ended Here////////////////////////////////////
const handleShowContacts = () => {
  console.log("clicked show contact")
  setShowContacts(showContacts=>!showContacts);
  console.log(showContacts)
  // Additional logic if needed
};

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
                handleLeadStatusChange={handleLeadStatusChange}
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
            <PastNotesParentComponent pastNotes={pastNotes} setPastNotes ={setPastNotes} BuyerDetails={BuyerDetails} ngrok_url_1={ngrok_url_1} />
        </div>
        <div className="text-area-container">
            <textarea value={NotesContent} placeholder="Write notes here..." onChange={(e) => HandleNotes(e.target.value)}></textarea>
        </div>
    </div>
</div>

  );
// 


}


//// Login Method 
function Login({ onSubmit }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [alertActivity,SetAlertActivity]=useState('');
  // SetAlertActivity('')
  /// set the input userid
  const handleUserIdChange = (event) => {
    setUserId(event.target.value);
  };

  /// set the input user password
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
/// check if the user exist in our databases
  const handleSubmit = async (event) => {
    event.preventDefault();
    if(userId === 'user2002') {
  
      ngrok_url_1="https://ec78-103-237-156-97.ngrok-free.app"
    }else if(userId === 'user2003') {

      ngrok_url_1="https://squirrel-darling-strangely.ngrok-free.app"
    }
    try {
      // console.log(active_user.data)
        await axios.post(`${ngrok_url_1}/confirm-user-state`)
      const active_user=await axios.post(`${ngrok_url_1}/incoming-assigned`,{
      })
      if (active_user.data.isUserLogged){
        console.log("User Already Logged In")
        SetAlertActivity("User Already Logged In");
        return
      }
    
      // Perform login authentication here
      console.log(userId, password);
      const response = await axios.post(`${ngrok_url_1}/login`, {
        userId: userId,
        password: password,
        ngrok_url: ngrok_url_1
      });
      const { login_status } = response.data;
      if (login_status === "success") {
        userIdentifier=userId
     
        // Call the onSubmit function passed from the parent component (LoginBlock)
        Requester= new SendRequest(ngrok_url_1, userIdentifier);
        onSubmit(true);
      } else {
        // Handle failed login
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };
  return (
    <LoginComponents userId={userId} 
                     password={password} 
                     handleUserIdChange={handleUserIdChange} 
                     handlePasswordChange={handlePasswordChange} 
                     handleSubmit={handleSubmit}
                     alertActivity={alertActivity} />
  )
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

let incoming;
let reminderInterval;
let footprint_user;
//// start and Default page render
function LoginBlock() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoggedOut, setLoggedOut] = useState(false);
  // deafult home page that will appear after login
  const [CurrentPhase,setCurrentUI]=useState('LoginSuccessBlock')
  const [buttonState, setButtonState] = useState('Pause');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [IncomingNotify,setIncomingNotify]=useState(false);

  //////////////////////////////////////////////////////////////////////////////////
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [CallBackCallerName, setCallBackCallerName] = useState('');
  const [CallBackNumber,setCallBackNumber]=useState('');
  const [callBackBuyerID,setCallBackBuyerID]=useState('');
  const [callBackClientID,setCallBackClientID]=useState('');

   


  // }, intervalTime);
  ////////////////////////////////////////////////////////////////////////////////////
  function HandleStartBlock() {
   
    setButtonClicked(true);
     incoming =setInterval(() => {
       checkIncomingCall(setIncomingNotify)
    }, 12000);
  
     reminderInterval = setInterval(() => {
      check_the_system_time(setIsDialogOpen,setCallBackCallerName,setCallBackNumber,setCallBackBuyerID,setCallBackClientID);
    }, intervalTime);
    end_all=false;
    setCurrentUI('HelloWorldApp');

    footprint_user=setInterval(async() => {
      try {
        await axios.post(`${ngrok_url_1}/last-request`);
      } catch (error) {
        console.error(error);
      }
     
    }, 900000);
    
  }

 
  async function HandleLogOutBlock(){
    setLoggedOut(true);
    axios.post(`${ngrok_url_1}/logout`,{
      call_count:calls_count,
      userid:userIdentifier
    })
    // stop process and reset values to default after logout
    calls_count=0
    clearInterval(reminderInterval);
    clearInterval(incoming);
    clearInterval(footprint_user);
    end_all=true
    setCurrentUI('Login')
    console.log("Logout")
  
    
  }

  async function CallBackClient(){
    console.log("CallBackClient")
    const buyername=CallBackCallerName;
    const buyerid=callBackBuyerID;
    const Clientid=callBackClientID
    const CallBackNumber=CallBackNumber;
    CallBackOnClick[buyername]={buyerid,Clientid};
    setIsDialogOpen(false);
 
  }
  
   function HandlePauseResumeBlock() {
    if (buttonState === 'Pause') {
      // setCurrentUI('PauseBlock');
      setButtonState('Resume');
      isPaushed=true;
    } else if (buttonState === 'Resume') {
      // setCurrentUI('HelloWorldApp');
      setButtonState('Pause');
      isPaushed=false;
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
                  <button className="logout-button" onClick={HandleLogOutBlock} icon="logout">Logout</button>
                  <button className='start-button' onClick={HandleStartBlock} disabled={buttonClicked}>Start</button>
                  <button className='pause-resume-button' onClick={HandlePauseResumeBlock}>
                      {buttonState === 'Pause' ? 'Pause' : 'Resume'}
                  </button>
              </div>
              {
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                      <span style={{ marginRight: '5px', fontWeight: 'bold', fontSize: '16px' }}>Incoming</span>
                      {/* Dynamic circle */}
                      <div className={`circle ${IncomingNotify ? 'red' : 'green'}`}></div>
                  </div>
              }
          </div>
      
          {/* Dialog component */}
          {isDialogOpen && (
              <Dialog onClose={() => setIsDialogOpen(false)} width="320px">
                  <Dialog.CloseButton />
                  <Heading>CallBack Alert📞</Heading>
                  <Text variant="paragraph">
                      Reminder! Please Call Back the Buyer {CallBackCallerName} at {CallBackNumber}!!
                  </Text>
                  <Button onClick={() => CallBackClient()}>Call Next</Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Ignore</Button>
              </Dialog>
          )}
      
          {/* Render different components based on the current phase */}
       
          <div className='Function-main-containers'>{CurrentPhase === 'LoginSuccessBlock' && <LoginSuccessBlock />}</div>
          <div className='Function-main-containers'>{CurrentPhase === 'HelloWorldApp' && <HelloWorldApp />} </div>
          <div className='Function-main-containers'>{CurrentPhase === 'LogoutBlock' && <LogoutBlock />}</div>
          <div className='Function-main-containers'>{CurrentPhase === 'LoginBlock' && <LoginBlock /> }</div>
      </div>
      
        )}
      </>
    )}
  </div>
  
  )
}

initializeBlock(() => <LoginBlock />);

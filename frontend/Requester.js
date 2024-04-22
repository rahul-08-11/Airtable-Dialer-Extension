import  axios  from "axios"

export class Variables {

  constructor (ngrok_url,useridentifier) {
    this.ngrok_url=ngrok_url
    this.useridentifier = useridentifier
  }

}

export class SendRequest {
    constructor (Variables) {
      this.ngrok_url =  Variables.ngrok_url;
      this.useridentifier = Variables.userIdentifier;
    }
    async  send_call_details(dealer_number, dealer_name) {
        try{
      
        const url = this.ngrok_url+'/call?dealer_number=' + dealer_number + '&dealer_name=' + dealer_name + '&channel_type=call&username='+ this.useridentifier;
        await axios.post(url).then((response) => {
          console.log(response.data);
          return response.data;
        })
      
      }catch(error){
        console.log("Error coming from send_call_details",error)
      }
        
      }

    async  get_client_details (ID,Currentvehicle,isContactSpecific,isBuyerSpecific) {

        try {
            const response = await axios.post(`${this.ngrok_url}/fetch-OutBound-Dealer-AirData`, {
                RecordID: ID,
                ContactSpecific : isContactSpecific,
                BuyerSpecific : isBuyerSpecific,
                CurrentVehicle:Currentvehicle
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching record details:', error);
            return {}; // Return an empty object or handle the error accordingly
        }
      }

    async  MakeCall(BuyerData, setDialerurl) {
        try{
        const { buyer_name: name, contact_number: number } = BuyerData;
        await this.send_call_details(number, name).then((response) => {
          const url = isPhoneNumber(number) ? `${ngrok_url_1}/dialer?name=${name}&number=${number}&username=${userIdentifier}` : `${ngrok_url_1}/lobby`;
          setDialerurl(url);
        
        })
      }catch(error){
      console.log("Error coming from MakeCall",error)
      }
      }

  /// get hot vehicle at top ==> warm ===>cold
     sort_leads = async (BuyerData) => {
      await axios.post(`${this.ngrok_url}/arrange-lead-based-score`,{
        leadids:BuyerData.Lead_ID
      }).then((response) => {
        const sorted_leadid=response.data;
        console.log("SORTED LEADid",sorted_leadid)
        return sorted_leadid;
      })
    }
        
}

export class Airtable_Update_Request {
  constructor (Variables) {
    this.ngrok_url = Variables.ngrok_url;
    this.userIdentifier = Variables.userIdentifier;
    this.recommendation_made_on_Call = new Set();
    this.recommendatedVehicle = new Set();
  }


  async append_call_record( buyerId, ContactId, recording_url,date,type,NotesContent,VehicleId,leadID) {
    console.log("NOts ",NotesContent)
    if( type=="Phone call"){
      console.log("append call record",buyerId,ContactId,recording_url,date,type,NotesContent,VehicleId,leadID)
    const recommendationArray = Array.from(this.recommendation_made_on_Call);
    const recommendationVehicleArray=Array.from(this.recommendatedVehicle);
    console.log(recommendationVehicleArray)
    console.log(recommendationArray)
    await axios.post(`${this.ngrok_url}/set-interaction-status`, {
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
  
    await axios.post(`${this.ngrok_url}/set-interaction-status`, {
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
  this.recommendation_made_on_Call.clear();
  this.recommendatedVehicle.clear();
  
  }


}

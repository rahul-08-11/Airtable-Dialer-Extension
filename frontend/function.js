import  axios  from "axios"

export class SendRequest {
    constructor (ngrok_url,useridentifier) {
        this.ngrok_url=ngrok_url
        this.useridentifier = useridentifier
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
}


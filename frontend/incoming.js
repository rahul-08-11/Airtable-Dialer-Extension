
import axios from "axios"

export class Incoming {
    constructor (ngrok_url,useridentifier) {
        this.ngrok_url=ngrok_url
        this.useridentifier = useridentifier
    }

    async  checkIncomingCall(setIncomingNotify = null) {
        try {
          const response = await axios.post(`${this.ngrok_url}/check-queue-for-incoming`);
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
    
}
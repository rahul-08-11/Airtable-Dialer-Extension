export class  CallBackUtility {

    constructor () {
        this.reminders = {}
        this.CallBackOnClick={}
    }


    async set_call_back_reminder(reminder_time,BuyerName,Buyer_Number,BuyerID,ClientID) {
        if(reminder_time.trim() !== ''){  this.reminders[BuyerName] = {reminder_time,Buyer_Number,BuyerID,ClientID};
        }
        console.log("timer set")
        console.log(this.reminders)
        return;
      }

    async  check_the_system_time(setIsDialogOpen,setCallBackCallerName,setCallBackNumber,setCallBackBuyerID,setCallBackClientID) {
        for (const [BuyerName, reminder] of Object.entries(this.reminders)) {
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
            delete this.reminders[BuyerName]; // Clear the reminder after alerting
            console.log("Reminder cleared:", BuyerName,this.reminders);
          }
        }
        return;
      }
   

}





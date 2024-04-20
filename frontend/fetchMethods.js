

export class FetchIds {
    constructor(ngrok) {
        this.data={}
    };
 
    async fetchVehicles(VehicletTable) {
        // const VehicletTable =base.getTable("Vehicles");
        try{
        const view = VehicletTable.getViewByName("All vehicles");
        const queryResult = view.selectRecords({
          fields: ["Vehicle","Dial Vehicle", "Top Offer","Potential Buyers"]}
        );
        await queryResult.loadDataAsync();
        return queryResult.records;
      }catch(error){
       console.log("Coming from fetchVehicles=>",error) 
      }
      }

    async  fetchPotentialBuyersIds (record) {
        const potentialBuyers = record.getCellValue("Potential Buyers");
        if(!potentialBuyers){
          console.log("it is null")
          return null;
        }
        try{
        // console.log(potentialBuyers)
          // Initialize an array to store buyer IDs
          console.log(potentialBuyers)
      
        const leadIds = [];
      
          // Loop 
          for (const potentialBuyer of potentialBuyers) {
            console.log(potentialBuyer)
            const linkedRecordId = potentialBuyer["linkedRecordId"];
            // Push the ID 
            leadIds.push(linkedRecordId);
          }
        console.log(leadIds)
      
        const CurrentVehicle=record.getCellValue("Vehicle")
        return {leadIds,CurrentVehicle};
      }catch(error){
        console.log("Error Coming From fetchPotentialBuyersIds=>",error)
        return {};
      
      }
      
      }


}



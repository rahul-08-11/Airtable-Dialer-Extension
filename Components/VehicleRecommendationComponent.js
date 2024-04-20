import React from 'react';
import { Button} from "@airtable/blocks/ui";
import "../CSS/VehicleRecommendation.css"

function VehicleDetialsComponent({ recommendation }){
  return (
    <div  className="VehicleDetials-container">
    <ul className="VehicleDetials-ul">
      <li>Recommendation Level: <span className={recommendation.score === 'Hot' ? 'hot-score' : recommendation.score === 'Warm' ? 'warm-score' : 'cold-score'}>{recommendation.score}</span></li>
      <li>Make: {recommendation.make}</li>
      <li>Year: {recommendation.year}</li>
      <li>Trim: {recommendation.trim}</li>
      <li>Progress Status: 
        <span style={{ fontWeight: 'bold', color: 
          recommendation.Progressstatus === 'To Be Contacted' ? 'black' :
          recommendation.Progressstatus === 'Contacted' ? 'black' :
          recommendation.Progressstatus === 'Offer Made' ? 'blue' :
          recommendation.Progressstatus === 'Negotiation' ? 'green' :
          recommendation.Progressstatus === 'Not Interested' ? 'red' :
          'inherit' // Default color if none of the above matches
        }}>
          {recommendation.Progressstatus}
        </span>
      </li>
    </ul>
    <ul className='VehicleDetials-ul'>
      <li>Mileage: {recommendation.mileage}</li>
      <li>Source: {recommendation.source}</li>
      <li style={{color: 'orange'}}>Price:${recommendation.price}</li>
      <li>Model: {recommendation.model}</li>
      <li>VIN: {recommendation.VIN}</li>
    </ul>
  </div>
  )
}

function SelectOptionComponent({setLeadStatus,handleLeadStatusChange,leadStatus,recommendation}){
  return (
    <select
    className='Select-Option'
    value={leadStatus[recommendation.leadId]}
    onChange={(e) => {
      const newLeadStatus = { ...leadStatus, [recommendation.leadId]: e.target.value };
      setLeadStatus(newLeadStatus);
      handleLeadStatusChange(recommendation.leadId, e.target.value,recommendation.vehicle_Id);
    }}
    size="small"
    >
    <option value="To Be Contacted" style={{ color: 'black' }}>To Be Contacted</option>
    <option value="Offer Made" style={{ color: 'blue' }}>Offer Made</option>
    <option value="Negotiation" style={{ color: 'green' }}>Negotiation</option>
    <option value="Not Interested" style={{ color: 'red' }}>Not Interested</option>
  </select>
  )
}

function InputOfferedAmountComponent({recommendation ,handleInputChange, inputValue}) {
  return (
    <input 
    type="text" 
    placeholder="Offered Amount" 
    value={inputValue[recommendation.leadId] || ""}
    onChange={(e) => handleInputChange(recommendation.leadId,e.target.value)}
    className='Input-offered-amount'   
  />
  )
}

function VehicleRecommendationComponent({ VehicleRecommendation, vehicleNameToMoveToTop, leadStatus, setLeadStatus, handleLeadStatusChange, handleInputChange, setofferamount, SendSMSVehicle, inputValue ,handleViewMore}) {
    return (
        <>
            {Object.keys(VehicleRecommendation).length !== 0 ? (
                <>
                    {Object.entries(VehicleRecommendation)
                        .sort(([aId, aRec], [bId, bRec]) => {
                            // Sorting logic
                            if (aRec.vehicle_name === vehicleNameToMoveToTop) return -1;
                            if (bRec.vehicle_name === vehicleNameToMoveToTop) return 1;
                            const scoreValues = { 'Hot': 3, 'Warm': 2, 'Cold': 1 };
                            const aScoreValue = scoreValues[aRec.score] || 0;
                            const bScoreValue = scoreValues[bRec.score] || 0;
                            return bScoreValue - aScoreValue;
                        })
                        .map(([leadId, recommendation]) => (
                            <div key={recommendation.leadId} className="VehicleRecommendation-container">
                              <h2 style={{ marginBottom: '10px' }}>{recommendation.vehicle_name}</h2>
                              < VehicleDetialsComponent recommendation={recommendation} />
    
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>      
                         
                                < SelectOptionComponent setLeadStatus={setLeadStatus} handleLeadStatusChange={handleLeadStatusChange} leadStatus={leadStatus} recommendation={recommendation} />
                             
                                < InputOfferedAmountComponent recommendation={recommendation} handleInputChange={handleInputChange} inputValue={inputValue} />

                                <button onClick={() => setofferamount(recommendation.leadId)} style={{ marginLeft: '10px', borderRadius: '5px', display: 'inline-block',border: 'none',height: '29px' ,width: '45px', backgroundColor: '#007bff', color: 'white', padding: '5px 10px' }}>Set</button>
                                <button  onClick={() => SendSMSVehicle(recommendation.vehicle_name,recommendation.vehicle_Id,recommendation.leadId)} style={{ marginLeft: '10px', borderRadius: '5px', display: 'inline-block',border: 'none',height: '29px' ,width: '120px', backgroundColor: '#007bff', color: 'white', padding: '5px 10px' }}>Send Vehicle</button>
                              </div>
                            </div>
                          )
                        )}
                    <Button onClick={handleViewMore}>View More</Button>
                </>
            ) : (
                <div>No vehicle recommendations found</div>
            )}
        </>
    );
}

export default VehicleRecommendationComponent;

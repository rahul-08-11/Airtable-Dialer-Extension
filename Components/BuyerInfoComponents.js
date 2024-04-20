import React, { useState } from 'react';
import "../CSS/BuyerInfo.css";
import "../CSS/ShowContacts.css";
import axios from 'axios';


function BuyerInfoComponents({ BuyerDetails }) {  
  return (
    <div className='BuyerBody'>
      <p className='p'>Client Info:</p>
      <ul className='ul'>
        {BuyerDetails && Object.keys(BuyerDetails).length !== 0 ? (
          <>
            <li className='li'>Buyer Name: {BuyerDetails.buyer_name}</li>
            <li className='li'>Buyer Address: {BuyerDetails.buyer_address}</li>
            <li className='li' style={{ color: 'red' }}>Category: {BuyerDetails.buyer_category}</li>
            <li className='li' style={{ color: 'red' }}>Average Purchase Price: {BuyerDetails.buyer_avg_price}</li>
          </>
        ) : (
          <li className='li'>No buyer information available</li>
        )}
      </ul>
    </div>
  );
}

function BuyerContactComponents({ BuyerDetails, LoadedContacts, clickedContacts, ShowContactInfo, ClickedOnContact, showContacts }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <BuyerInfoComponents BuyerDetails={BuyerDetails} />
      </div>
      </div>
  )
}

export default BuyerContactComponents;

import React  from "react";
import { useState } from 'react';
import { Button } from "@airtable/blocks/ui";
import axios from 'axios';
import "../CSS/PreviewNotes.css";


function FormateTheDate(date) {
        var date = new Date(date)
        // Use Date methods to extract the components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; 
        const day = date.getDate();
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

function PastNotesChildComponents({ PastNotes }){
    const PastNotesElemenets = Object.entries(PastNotes).map(([date, note]) => (
        <div key={date} className="past-notes-content">
          <p>{FormateTheDate(date)} : {note}</p>
        </div>
    
    ))
    
    return (
      <div>
        {PastNotes && Object.keys(PastNotes).length !== 0 ? (
          <>
          {PastNotesElemenets}
          </>
        )
        : 
        (<div>No Past Notes Found</div>)
        }
        </div>
    )
    }


function PastNotesParentComponent({pastNotes ,setPastNotes ,BuyerDetails ,ngrok_url_1}) {
  
    async function PreviewPastNotes() {
      // const buyername=BuyerDetails.buyer_name
      const previewButton=document.querySelector(".View-preview-notes-button")
      previewButton.textContent="Loading Notes..." 
      const buyername=BuyerDetails.buyer_name;
      console.log("preview past notes for",buyername)
      const resp=await axios.post(`${ngrok_url_1}/preview-past-notes`, {
        BuyerName:buyername
     })
     const res=resp.data
     if(!res){
      previewButton.textContent="No Past Notes Found" 
     }

     console.log(res)
     setPastNotes(res);
     previewButton.textContent="Preview Notes" 
    }

    return (
        <div className="past-notes-container-comp">
        <button onClick={PreviewPastNotes} className="View-preview-notes-button">Preview Notes</button>
        <PastNotesChildComponents PastNotes={pastNotes} /> 
    </div>
    )

}

export default PastNotesParentComponent
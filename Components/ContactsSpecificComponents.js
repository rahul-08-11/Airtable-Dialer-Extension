import React from "react";
import { Button } from '@airtable/blocks/ui';
import "../CSS/ShowContacts.css";

function ShowContactComponents({ LoadedContacts, clickedContacts, ShowContactInfo, ClickedOnContact, showContacts }) {
  const ContactsElements = Object.entries(LoadedContacts).map(([ContactID, Contacts]) => (
    <div key={ContactID} className="contacts-data-div" >
      <div>{Contacts.name}</div>
      <Button onClick={() => ClickedOnContact(Contacts, ContactID)} >
        {clickedContacts[Contacts.name] ? <span style={{ color: 'blue', fontSize: '16px' }}>✔️</span> : 'Call'}
      </Button>
    </div>
  ));

  return (
    <div className="show-contact-container-comp">
      {showContacts ? (
        <>
          {ContactsElements}
        </>
      ) : 
        <div>No Contacts Found</div>
      }
    </div>
  )
}

export default ShowContactComponents;

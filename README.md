# Airtable Dialer Extension ![alt text](https://img.shields.io/badge/Airtable-v1.8.0-FF4154) ![alt text](https://img.shields.io/badge/React-v16.13.0-61DAFB) ![alt text](https://img.shields.io/badge/Axios-v1.6.7-5A29E4) 

Welcome to the frontend repository for the Dialer Project!

## Table of Contents

- [Introduction](#introduction)
- [Purpose](#purpose)
- [Components](#frontend-components)
- [Woking With Auto-Dialer](#working-with-dialer)
- [Popup Integration](#popup-integration)
- [Status](#status)
- [References](#references)

## Introduction
This repository contains extension code which act as our frontend for creating a dialer system within the Airtable (CRM) UI, essentially an Airtable extension facilitating calls and text messages to clients integrated with other features.This extension aims to streamline communication processes for the given lead in the airtable, enabling agents to concentrate on interactions rather than navigating through various buttons.

## Purpose
The purpose of this extension is to increase the productivity of the Agent in making calls and setting offers by automating maximum work laod using various various integrated or built-in features.By providing seamless calls, text messaging, and other features, the system aims to efficiently connect agents with potential buyers, particularly for vehicle recommendations.

## Frontend Components

### Key Controllers
🔘 Main Button Components

- **Logout Button**: This button allow Agent or User to Leave the Dialing or exit the Dialer Completely.

> **Note** : User or Agent should logout only if there are no active call
> 
- **Start Dialer Button**:Once the Start button is clicked on it is going initiate call one by one to each potential buyers for specific vehicle based on the Arrangement of vehicles in the Vehicle Table.
- **Pause Call Button**: This heading would describe the purpose and functionality of the button used to temporarily pause ongoing calls, providing agents with control over their communication interactions.

> **Call Management Tips: Utilizing the Pause Functionality**
It's recommended that when initiating a new call, agents utilize the pause button. This ensures that after the current call ends and agents complete any necessary tasks or adjustments, they can seamlessly resume the process or proceed to the next call.
> 
### Dialer Header
This component is responsible for displaying crucial information that will be utilised by the Agent or User while making calls.The header contains various elements as displayed in the following image.
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/539cdcdd-1310-431b-83a7-927fa1531583" height="500px" width="800px">
<br>

- **Vehicle Name** : Shows the Name of vehicle for which we are calling contact or buyers
- **Top Offered Amount** : Shows the highest amount offered for the respective vehicle
- **Call-Back Scheduler** :  Input component integrated with [Call Back Feature](#callback-feature)<br><br>

> **To learn about code visit** : [HeaderComponents.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/HeaderComponents.js)<br><br>

### Soft-phone <br>
<img src = "https://github.com/rahul-08-11/Airtable-Dialer-Extension/assets/90087006/aa43dff3-2ad4-4a38-b8ea-03cc5275d26f" width="550px" height="300px"><br>
 -  **Displayed Contents** : The soft-phone display some texts which uniquely identify the Buyer's that are being connected.
 -  **Embedded Dial-pad** : Soft-phone is embedded with a dial pad that is use to send digits to the other end.
- **Muting**: The soft-phone comes with three buttons:
  - **Hangup**: Allows the user to cut or disconnect the active call.
  - **Mute**: Allows the user to mute the active call.
  - **Call**: Allows the user to re-dial the called number or buyer.

    
   **Calling Stages**
    ```
                +-------------------+
                |                   |
                |   Call Preparing  |------->This state indicates that the system is currently
                |                   |        configuring and setting up tokens for the new call.                   
                +-------------------+
                         |
                         v
                +-------------------+
                |                   |------->Once the call preparation is complete, the call is conside
                |    Call Ready     |        -red ready, meaning it has been successfully set up and 
                |                   |         configured.
                +-------------------+
                         |
                         v
                +-------------------+
                |                   |------->This state indicates that the connection to the other end 
                |  Call Connected   |        has been established. However, note that it doesn't
                |                   |        necessarily mean that the call has been received by the 
                +-------------------+        other end yet.
                         |
                         v
                +-------------------+
                |                   |
                | Call Disconnected |------->This state indicates that the connection has been cut out 
                |                   |        or closed from any of the respective ends, effectively 
                +-------------------+        ending the call.
     ```
    <br>
> **To learn about code visit** : [Dialer Backend Repo](https://github.com/rahul-08-11/Airtable-Dialer-Software) <br><br>


### Vehicle Recommendation <br>
This is a `click-on-load` Component.Vehicles to be presented or recommended during phone calls will be displayed or accessible through this component. By default, the first recommendation shown will be for the vehicle corresponding to the client we have called header.This component comes with numerous options that allow users to interact directly with the content of the Airtable and update respective data in the table. It is integrated with a various feature and functionality.<br><br>elem
There are various elements present on this component that agent could interact with and carry out updation on table as well as send **Text SMS** to client along with Vehicle Name.Below is the iamge that depict the interactive elements on this section.<br><br>
![2024-04-23_15-06](https://github.com/rahul-08-11/Airtable-Dialer-Extension/assets/90087006/95deff4b-0323-40f4-8001-02da5009e292)
### Features and Functionality <br>
### 1. View More Recommendations <br>
- **Description**: This feature utilizes the `click-on-load` logic to efficiently load necessary data during phone calls. It allows agents to dynamically load additional vehicle recommendations based on client conversations.
- **Usage**: Agents can load up to 3 recommendations, displayed below the existing recommendations. Hot recommendations are prioritized and shown at the top, while cold recommendations are displayed below.

### 2. Set Progress Status
- **Description**: Agents can update a lead's Progress status directly from the UI. The Progress status is a dropdown element with various update options:
  - `To be contacted`: Initial status indicating the lead has not been contacted yet.
  - `Contacted`: Lead has been reached out to, but no substantive conversation has occurred.
  - `Offer made`: A formal offer has been extended to the lead.
  - `Negotiation`: Ongoing dialogue with the lead to discuss terms, often following a counteroffer.
- **Usage**: Agents can select the appropriate status from the dropdown menu to update the lead's Progress status.

### 3. Set Offer Amount
- **Description**: After discussing pricing with the client, agents can directly set the offered amount into the Airtable database through the dialer UI. Agents can input the offered amount into the text box and click the 'Set' button to trigger an update request to the backend.
- **Usage**: Agents input the offered amount and click 'Set' to update the offer amount in the database.

### 4. Text SMS
- **Description**: This feature efficiently handles scenarios where clients or other parties prefer to receive vehicle details via text message. Agents can click the 'Send Vehicle' button for a specific vehicle, triggering an automatic text message sent to the client.
- **Usage**: Agents select the vehicle and click 'Send Vehicle' to automatically send a text message with vehicle details to the client.

<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/b9183e89-e738-4b07-9e0c-060ffa157f37"  width="900px" height="550px"><br><br><br>

> **To learn about code visit** : [vehicleRecommendation.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/VehicleRecommendationComponent.js)<br><br>

### Contact's Components
This is **load-on-click** component,meaning the data will be only presented if or only if the user want them to be displayed.<br><br>This component allows the user or agent to quickly have a look at other contacts related to the company for whom the dialer has initiated a call. All the employees working in the called company are displayed, and the agent can interact with buttons attached to each contact to make a call to them. This is helpful in scenarios when a buyer informs the agent to contact someone else within their specific company.<br><br>
**Before the Contacts are loaded**<br>
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/53f65d47-13f6-4fc0-87bd-7fd8d2d31a8d" alt="showcontactbefore" width="900px" height="550px"><br><br>

**After the Contacts are loaded and displayed**<br>
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/686e4719-bf10-4585-ab2a-208d3331e38b" alt="ShowContactAfterClick" width="900px" height="600px"><br><br>
> **To learn about code visit** : [ContactsSpecificComponents.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/ContactsSpecificComponents.js)


### Other Data View and Input Note <br>
**Buyer's Info**:
- This component displays information related to the buyer, such as their name, address, category, and purchase price.

**Past Notes Display**:
- This is a `load-on-click` component. It allows the agent to review past notes associated with the called company. This feature enables agents to revisit previous conversations and prepare deals based on historical information.

**Live Note Taking**:
- This feature consists of a text box element that enables agents to take notes during the call. The entered notes are appended to the Airtable "Interaction" table once the call is finished and the agent moves on to attend their next call.

<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/d0378d7b-4070-407f-ba8c-40612756263b" alt="Section4" width="900px" height="550px"><br>
<br>
<br>
## Working With Dialer
<br>

1. **Authentication**: Users authenticate themselves using their UserID and password to access the system.<br>
2. **Accessing Leads**: Upon login, the system retrieves lead data including LeadID and associated vehicles for calling.<br>
3. **Initiating Calls**: Users select a lead from the "Leads Table" and click the "Start Dialer" button to initiate calls.<br>
4. **Call Handling**: During the call, users update lead information in real-time based on the conversation.<br>
5. **Data Update**: After the call ends, users update the lead's information in the system, typically through form filling or field updates.<br>
6. **Automatic Progression**: Once the call is completed and the data is uploaded in the crm, the system automatically moves on to the next lead in the list.<br>
7. **Incoming Call Handling**: If an incoming call occurs while the system is connecting to the next lead, the system prioritizes the incoming call.<br>
8. **Pause and Resume**: Users can pause the system's execution at any time by clicking the "Pause Call" button and resume from where they left off.<br>
9. **Logout**: Users can log out of the system by clicking the "Logout" button, ending the session securely.<br>
<br>

## Popup Integration<br>
The integration allows agents to make manual calls or send text messages, simply by clicking on a button. <br>

[Screencast from 2024-04-28 08-12-52.webm](https://github.com/rahul-08-11/Airtable-Dialer-Extension/assets/90087006/bb1936f2-1a2d-48e5-8b24-fe23c47a5aad)

## Status
<br>
The project is currently under development.

## References <br>

### Resource and Documentation <br>

- [Twilio Voice SDK Docs](https://github.com/TwilioDevEd/voice-javascript-sdk-quickstart-python](https://www.twilio.com/docs/voice/sdks/javascript/twiliodevice))<br>
- [Twilio API Docs](https://www.twilio.com/docs/)<br>
- [Airtable API Docs](https://pyairtable.readthedocs.io/en/stable/api.html#api-pyairtable)<br>
- [Twilio SDK Quckstart Repository](https://github.com/TwilioDevEd/voice-javascript-sdk-quickstart-python)<br>
- [Airtable Block SDK](https://airtable.com/developers/extensions/api)<br>

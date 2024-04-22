# Airtable Dialer Extension ![alt text](https://img.shields.io/badge/Airtable-v1.8.0-FF4154) ![alt text](https://img.shields.io/badge/React-v16.13.0-61DAFB) ![alt text](https://img.shields.io/badge/Axios-v1.6.7-5A29E4) 

Welcome to the frontend repository for the Dialer Project!

## Table of Contents

- [Introduction](#introduction)
- [Purpose](#purpose)
- [Components](#frontend-components)
- [Execution and Workflow](#execution-and-workflow)
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
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/539cdcdd-1310-431b-83a7-927fa1531583" height="500px" width="850px">
<br>

- **Vehicle Name** : Shows the Name of vehicle for which we are calling contact or buyers
- **Top Offered Amount** : Shows the highest amount offered for the respective vehicle
- **Call-Back Scheduler** :  Input component integrated with [Call Back Feature](#callback-feature)<br><br>

> **To learn about code visit** : [HeaderComponents.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/HeaderComponents.js)<br><br>

### Soft-phone <br>
<img src = "https://github.com/rahul-08-11/Airtable-Dialer-Extension/assets/90087006/aa43dff3-2ad4-4a38-b8ea-03cc5275d26f" width="600px" height="300px"><br>
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
Vehicles to be presented or recommended during phone calls will be displayed or accessible through this component. By default, the first recommendation shown will be for the vehicle corresponding to the client we have called header.This component comes with numerous options that allow users to interact directly with the content of the Airtable and update respective data in the table. It is integrated with a feature **[View More Recommendation](#view-more-recommendation)**. <br><br>
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/b9183e89-e738-4b07-9e0c-060ffa157f37"  width="900px" height="600px"><br><br><br>

> **To learn about code visit** : [vehicleRecommendation.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/VehicleRecommendationComponent.js)<br><br>

### Contact's Components
This is **load-on-click** component,meaning the data will be only presented if or only if the user want them to be displayed.<br><br>This component allows the user or agent to quickly have a look at other contacts related to the company for whom the dialer has initiated a call. All the employees working in the called company are displayed, and the agent can interact with buttons attached to each contact to make a call to them. This is helpful in scenarios when a buyer informs the agent to contact someone else within their specific company.<br><br>
**Before the Contacts are loaded**<br>
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/53f65d47-13f6-4fc0-87bd-7fd8d2d31a8d" alt="showcontactbefore" width="900px" height="600px"><br><br>

**After the Contacts are loaded and displayed**<br>
<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/686e4719-bf10-4585-ab2a-208d3331e38b" alt="ShowContactAfterClick" width="900px" height="600px"><br><br>
> **To learn about code visit** : [ContactsSpecificComponents.js](https://github.com/rahul-08-11/Airtable-Dialer-Extension/blob/main/Components/ContactsSpecificComponents.js)

<!-- 


<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/d0378d7b-4070-407f-ba8c-40612756263b" alt="Section4" width="500px" height="250px"><br>

<img src="https://github.com/rahul-08-11/Airtable-Dialer-Extension-Frontend/assets/90087006/5fba0657-3243-4851-be59-2ae90ece152e" alt="section2" width="500px" height="250px"><br> -->






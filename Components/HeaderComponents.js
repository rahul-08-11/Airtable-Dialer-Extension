import React from "react";
import "../CSS/Header.css"; // Import CSS file

function HeaderComponent({ TopOffer, handleTimeChange, CurrentVehicle, callBackTime }) {
    return (
        <div className="header-container">
            <span className="CurrentVehicleName">{CurrentVehicle}</span>
            <span className="span1">
                <span className="TopOfferedSpan">Top Offered Amount: <span style={{ color: '#007bff' }}>${TopOffer}</span></span>
            </span>
            <input type="time" id="CallBackTime" name="CallBackTime" onChange={handleTimeChange} value={callBackTime}></input>
        </div>
    );
}

export default HeaderComponent;

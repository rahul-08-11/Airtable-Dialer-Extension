import React  from "react";
import '../CSS/Login.css'

function LoginComponents({ userId, password, handleUserIdChange, handlePasswordChange, handleSubmit ,alertActivity}) {

    return (
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID:</label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={handleUserIdChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-btn">Submit</button>
            {alertActivity && <p>{alertActivity}</p>} 
          </form>
        </div>
      );

}



export default LoginComponents 
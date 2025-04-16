// import React from "react";
// import { Link } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { useNavigate } from "react-router-dom";
// import cookies from "js-cookie"

// import "./index.css";

// const Navbar = () => {
//   const navigate = useNavigate()
//   const onClickLogout = () => {
//       cookies.remove("jwt_token")
//       navigate("/signin")
//   }
//   return (
//     <nav className="nav-header fixed-top">
//       <div className="nav-content">
//         <h1 style={{ color: "#1248EB" }}>Droadz Hall</h1>
//         <ul className="nav-menu">
//           <li>
//             <Link to="/home" className="nav-link">
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link to="/hall" className="nav-link">
//               Hall
//             </Link>
//           </li>
//           <li>
//             <Link to="/booking" className="nav-link">
//               Booking
//             </Link>
//           </li>
//         </ul>
//         <div>
//           <button onClick={onClickLogout} className="btn btn-primary">Logout</button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode"; // Install using: npm install jwt-decode

// import "bootstrap/dist/css/bootstrap.min.css";
// import "./index.css";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");

//   useEffect(() => {
//     const token = cookies.get("jwt_token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUsername(decoded.email || "User"); // Adjust the key based on your token payload
//       } catch (error) {
//         console.error("Invalid token", error);
//       }
//     }
//   }, []);

//   const onClickLogout = () => {
//     cookies.remove("jwt_token");
//     navigate("/signin");
//   };

//   return (
//     <nav className="nav-header fixed-top">
//       <div className="nav-content">
//         <div className="d-flex align-items-center">
//           <h1 style={{ color: "#1248EB", marginLeft: "10px" }}>Droadz Hall</h1>
//         </div>
//         <ul className="nav-menu">
//           <li>
//             <Link to="/home" className="nav-link">
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link to="/hall" className="nav-link">
//               Hall
//             </Link>
//           </li>
//           <li>
//             <Link to="/booking" className="nav-link">
//               Booking
//             </Link>
//           </li>
//         </ul>
//         <div className="d-flex align-items-center">
//           <span className="me-3 fw-bold">{username}</span>
//           <button onClick={onClickLogout} className="btn btn-primary">
//             Logout
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Install using: npm install jwt-decode

import Avatar from "@mui/material/Avatar";
import { blue } from "@mui/material/colors";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const token = cookies.get("jwt_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const email = decoded.email;

        const match = email.match(/^([a-zA-Z]+)/);
        const formattedName =
          match && match[1]
            ? match[1].charAt(0).toUpperCase() + match[1].slice(1)
            : "User"; // Capitalize first letter

        setFirstName(formattedName);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const onClickLogout = () => {
    cookies.remove("jwt_token");
    navigate("/signin");
  };

  return (
    <nav className="nav-header fixed-top">
      <div className="nav-content">
        <div className="d-flex align-items-center">
          <h1 style={{ color: "#1248EB", marginLeft: "10px" }}>Droadz Hall</h1>
        </div>
        <ul className="nav-menu">
          <li>
            <Link to="/home" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/hall" className="nav-link">
              Hall
            </Link>
          </li>
          <li>
            <Link to="/booking" className="nav-link">
              Booking
            </Link>
          </li>
        </ul>
        <div className="d-flex align-items-center">
          <button onClick={onClickLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <Avatar
          sx={{
            bgcolor: blue[500],
            height: "50px",
            width: "55px",
            fontSize: "15px",
            borderRadius: "100%",
            marginLeft: "35px",
          }}
        >
          {firstName}
        </Avatar>
      </div>
    </nav>
  );
};

export default Navbar;

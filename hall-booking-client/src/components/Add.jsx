import React from 'react'
import useBookingStore from './Store/useBookingStore'

const Add = () => {
    const {bookingItemData} = useBookingStore()
  return (
    <div>
        <h1>QWERTY</h1>
      {bookingItemData.map(item => (
        <p key={item._id}>{item.customerName}</p>
      ))}
    </div>
  )
}

export default Add

// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { CircularProgress, Typography } from "@mui/material";
// import axios from "axios";

// const getHallItem = async () => {
//   const response = await axios.get("http://localhost:8000/hall");
//   return response.data;
// };

// function Add() {
//   const { data, isLoading, isError, error, isSuccess , success} = useQuery({
//     queryKey: ["hall"],
//     queryFn: getHallItem,
//   });

//   if (isLoading) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <CircularProgress />
//         <Typography variant="h6" style={{ marginLeft: "1rem" }}>
//           Loading items...
//         </Typography>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <Typography variant="h6" color="error">
//           Failed to load items: {error.message}
//         </Typography>
//       </div>
//     );
//   }

//   if (isSuccess) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <Typography variant="h6" color="error">
//           success: {success.message}
//         </Typography>
//       </div>
//     )
//   }

//   return (
//     <div>
//       {/* Render your data once loaded */}
//       {data &&
//         data.map((item) => <Typography key={item.id}>{item.name}</Typography>)}
//     </div>
//   );
// }

// export default Add;

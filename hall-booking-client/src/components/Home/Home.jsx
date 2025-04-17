// import React, { useEffect, useState } from "react";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { Controller, useForm } from "react-hook-form";
// import Navbar from "../Navbar/Navbar";
// import {
//   Table,
//   TableCell,
//   TableBody,
//   TableRow,
//   TableHead,
//   TextField,
// } from "@mui/material";
// import dayjs from "dayjs";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// import useBookingStore from "../Store/useBookingStore";

// // Import necessary Day.js plugins
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// // Extend Day.js with the plugins
// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);

// const defaultValues = {
//   month: null,
// };

// const getDaysInMonth = (year, month) => {
//   return dayjs(new Date(year, month + 1, 0)).date();
// };

// const getFirstDayOfMonth = (year, month) => {
//   return dayjs(new Date(year, month, 1)).day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
// };

// const getDates = async () => {
//   const response = await axios.get("http://localhost:8000/booking");
//   return response.data;
// };

// const isDateInRange = (date, startDate, endDate) => {
//   return (
//     dayjs(date).isSameOrAfter(startDate, "day") &&
//     dayjs(date).isSameOrBefore(endDate, "day")
//   );
// };

// const Home = () => {
//   const {
//     control,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: defaultValues,
//   });

//   const { bookingItemData, setBookingItemData } = useBookingStore();

//   const selectedMonth = watch("month");
//   const [daysInMonth, setDaysInMonth] = useState([]);
//   const [bookedDates, setBookedDates] = useState([]);

//   useEffect(() => {
//     if (selectedMonth) {
//       const year = dayjs(selectedMonth).year();
//       const month = dayjs(selectedMonth).month();

//       const days = getDaysInMonth(year, month);
//       const firstDay = getFirstDayOfMonth(year, month);

//       // Prepare days array and pad empty slots for non-starting days
//       const daysArray = Array.from({ length: days }, (_, i) => i + 1);

//       const paddedDays = [...Array(firstDay).fill(null), ...daysArray];

//       setDaysInMonth(paddedDays); // Update the state with the selected month's days
//     }
//   }, [selectedMonth]);

//   const { data } = useQuery({
//     queryKey: ["date"],
//     queryFn: getDates,
//   });

//   useEffect(() => {
//     if (data?.length > 0) {
//       setBookingItemData(data);
//       setBookedDates(
//         data.map((item) => ({
//           startDate: dayjs(item.bStartDate),
//           endDate: dayjs(item.bEndDate),
//         }))
//       );
//     }
//   }, [data, setBookingItemData]);

//   return (
//     <div>
//       <Navbar />
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <h1
//           style={{
//             fontFamily: "Roboto",
//             fontSize: "36px",
//             fontWeight: "500",
//             color: "#143f4b",
//             marginTop: "100px",
//           }}
//         >
//           DASHBOARD
//         </h1>
//         <div>
//           <form>
//             {/* DatePicker for selecting month */}
//             <Controller
//               name="month"
//               control={control}
//               render={({ field: { onChange, value } }) => (
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   <DemoContainer components={["DatePicker"]}>
//                     <DatePicker
//                       label="Select Month"
//                       openTo="month"
//                       views={["month", "year"]}
//                       value={value}
//                       onChange={(newValue) => {
//                         onChange(newValue); // Updates react-hook-form state
//                       }}
//                       renderInput={(params) => <TextField {...params} />}
//                     />
//                   </DemoContainer>
//                 </LocalizationProvider>
//               )}
//             />
//           </form>

//           {/* Calendar Table */}
//           <div style={{ marginTop: "40px", width: "100vw" }}>
//             {daysInMonth.length > 0 && (
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//                       (day) => (
//                         <TableCell key={day} style={{ textAlign: "center" }}>
//                           {day}
//                         </TableCell>
//                       )
//                     )}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Array.from(
//                     { length: Math.ceil(daysInMonth.length / 7) },
//                     (_, rowIndex) => (
//                       <TableRow key={rowIndex}>
//                         {daysInMonth
//                           .slice(rowIndex * 7, rowIndex * 7 + 7)
//                           .map((day, index) => {
//                             const currentDate = dayjs(selectedMonth)
//                               .date(day)
//                               .toDate();
//                             const isBooked = bookedDates.some((booking) =>
//                               isDateInRange(
//                                 currentDate,
//                                 booking.startDate,
//                                 booking.endDate
//                               )
//                             );

//                             return (
//                               <TableCell
//                                 key={index}
//                                 style={{
//                                   textAlign: "center",
//                                   backgroundColor: isBooked
//                                     ? "#12EDE2" // Light green for booked dates
//                                     : "",
//                                 }}
//                               >
//                                 {day ? day : ""}
//                               </TableCell>
//                             );
//                           })}
//                       </TableRow>
//                     )
//                   )}
//                 </TableBody>
//               </Table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useEffect, useState } from "react";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { Controller, useForm } from "react-hook-form";
// import Navbar from "../Navbar/Navbar";
// import {
//   Table,
//   TableCell,
//   TableBody,
//   TableRow,
//   TableHead,
//   TextField,
// } from "@mui/material";
// import dayjs from "dayjs";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// import useBookingStore from "../Store/useBookingStore";

// // Import necessary Day.js plugins
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// // Extend Day.js with the plugins
// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);

// const getDaysInMonth = (year, month) => {
//   return dayjs(new Date(year, month + 1, 0)).date();
// };

// const getFirstDayOfMonth = (year, month) => {
//   return dayjs(new Date(year, month, 1)).day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
// };

// const getDates = async () => {
//   const response = await axios.get("http://localhost:8000/booking");
//   return response.data;
// };

// const isDateInRange = (date, startDate, endDate) => {
//   return (
//     dayjs(date).isSameOrAfter(startDate, "day") &&
//     dayjs(date).isSameOrBefore(endDate, "day")
//   );
// };

// const Home = () => {
//   const currentDate = dayjs(); // Get the current date
//   const defaultValues = {
//     month: currentDate, // Set the default value to the current date
//   };

//   const {
//     control,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: defaultValues,
//   });

//   const { bookingItemData, setBookingItemData } = useBookingStore();

//   const selectedMonth = watch("month");
//   const [daysInMonth, setDaysInMonth] = useState([]);
//   const [bookedDates, setBookedDates] = useState([]);

//   useEffect(() => {
//     if (selectedMonth) {
//       const year = dayjs(selectedMonth).year();
//       const month = dayjs(selectedMonth).month();

//       const days = getDaysInMonth(year, month);
//       const firstDay = getFirstDayOfMonth(year, month);

//       // Prepare days array and pad empty slots for non-starting days
//       const daysArray = Array.from({ length: days }, (_, i) => i + 1);

//       const paddedDays = [...Array(firstDay).fill(null), ...daysArray];

//       setDaysInMonth(paddedDays); // Update the state with the selected month's days
//     }
//   }, [selectedMonth]);

//   const { data } = useQuery({
//     queryKey: ["date"],
//     queryFn: getDates,
//   });

//   useEffect(() => {
//     if (data?.length > 0) {
//       setBookingItemData(data);
//       setBookedDates(
//         data.map((item) => ({
//           startDate: dayjs(item.bStartDate),
//           endDate: dayjs(item.bEndDate),
//         }))
//       );
//     }
//   }, [data, setBookingItemData]);

//   return (
//     <div>
//       <Navbar />
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <h1
//           style={{
//             fontFamily: "Roboto",
//             fontSize: "36px",
//             fontWeight: "500",
//             color: "#143f4b",
//             marginTop: "100px",
//           }}
//         >
//           DASHBOARD
//         </h1>
//         <div>
//           <form>
//             {/* DatePicker for selecting month */}
//             <Controller
//               name="month"
//               control={control}
//               render={({ field: { onChange, value } }) => (
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   <DemoContainer components={["DatePicker"]}>
//                     <DatePicker
//                       label="Select Month"
//                       openTo="month"
//                       views={["month", "year"]}
//                       value={value}
//                       onChange={(newValue) => {
//                         onChange(newValue); // Updates react-hook-form state
//                       }}
//                       renderInput={(params) => <TextField {...params} />}
//                     />
//                   </DemoContainer>
//                 </LocalizationProvider>
//               )}
//             />
//           </form>

//           {/* Calendar Table */}
//           <div style={{ marginTop: "40px", width: "100vw" }}>
//             {daysInMonth.length > 0 && (
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
//                       (day) => (
//                         <TableCell key={day} style={{ textAlign: "center" }}>
//                           {day}
//                         </TableCell>
//                       )
//                     )}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Array.from(
//                     { length: Math.ceil(daysInMonth.length / 7) },
//                     (_, rowIndex) => (
//                       <TableRow key={rowIndex}>
//                         {daysInMonth
//                           .slice(rowIndex * 7, rowIndex * 7 + 7)
//                           .map((day, index) => {
//                             const currentDate = dayjs(selectedMonth)
//                               .date(day)
//                               .toDate();
//                             const isBooked = bookedDates.some((booking) =>
//                               isDateInRange(
//                                 currentDate,
//                                 booking.startDate,
//                                 booking.endDate
//                               )
//                             );

//                             return (
//                               <TableCell
//                                 key={index}
//                                 style={{
//                                   textAlign: "center",
//                                   backgroundColor: isBooked
//                                     ? "#12EDE2" // Light green for booked dates
//                                     : "",
//                                 }}
//                               >
//                                 {day ? day : ""}
//                               </TableCell>
//                             );
//                           })}
//                       </TableRow>
//                     )
//                   )}
//                 </TableBody>
//               </Table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useState } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useForm } from "react-hook-form";
import Navbar from "../Navbar/Navbar";
import {
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableHead,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import useBookingStore from "../Store/useBookingStore";

// Import necessary Day.js plugins
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Extend Day.js with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const getDaysInMonth = (year, month) => {
  return dayjs(new Date(year, month + 1, 0)).date();
};

const getFirstDayOfMonth = (year, month) => {
  return dayjs(new Date(year, month, 1)).day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

const getDates = async () => {
  try {
    const token = Cookies.get("jwt_token");
    const response = await axios.get("http://localhost:8000/booking", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch {
    throw new Error("Failed to update item");
  }
};

const isDateInRange = (date, startDate, endDate) => {
  return (
    dayjs(date).isSameOrAfter(startDate, "day") &&
    dayjs(date).isSameOrBefore(endDate, "day")
  );
};

const Home = () => {
  const currentDate = dayjs(); // Get the current date
  const defaultValues = {
    month: currentDate, // Set the default value to the current date
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  const { bookingItemData, setBookingItemData } = useBookingStore();

  const selectedMonth = watch("month");
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    // Ensure selectedMonth is always a valid dayjs object
    if (selectedMonth && dayjs.isDayjs(selectedMonth)) {
      const year = selectedMonth.year();
      const month = selectedMonth.month();

      const days = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);

      // Prepare days array and pad empty slots for non-starting days
      const daysArray = Array.from({ length: days }, (_, i) => i + 1);
      const paddedDays = [...Array(firstDay).fill(null), ...daysArray];

      setDaysInMonth(paddedDays); // Update the state with the selected month's days
    }
  }, [selectedMonth]);

  const { data } = useQuery({
    queryKey: ["date"],
    queryFn: getDates,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data?.length > 0) {
      setBookingItemData(data);
      setBookedDates(
        data.map((item) => ({
          startDate: dayjs(item.bStartDate),
          endDate: dayjs(item.bEndDate),
        }))
      );
    }
  }, [data, setBookingItemData]);

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Roboto",
            fontSize: "36px",
            fontWeight: "500",
            color: "#143f4b",
            marginTop: "100px",
          }}
        >
          DASHBOARD
        </h1>
        <div>
          <form>
            {/* DatePicker for selecting month */}
            <Controller
              name="month"
              control={control}
              render={({ field: { onChange, value } }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="Select Month"
                      openTo="month"
                      views={["month", "year"]}
                      value={value}
                      onChange={(newValue) => {
                        // Ensuring newValue is a dayjs object
                        if (newValue && dayjs.isDayjs(newValue)) {
                          onChange(newValue); // Updates react-hook-form state
                        }
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              )}
            />
          </form>

          {/* Calendar Table */}
          <div style={{ marginTop: "40px", width: "100vw" }}>
            {daysInMonth.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <TableCell key={day} style={{ textAlign: "center" }}>
                          {day}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(
                    { length: Math.ceil(daysInMonth.length / 7) },
                    (_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {daysInMonth
                          .slice(rowIndex * 7, rowIndex * 7 + 7)
                          .map((day, index) => {
                            const currentDate = dayjs(selectedMonth).date(day);
                            const isBooked = bookedDates.some((booking) =>
                              isDateInRange(
                                currentDate,
                                booking.startDate,
                                booking.endDate
                              )
                            );

                            return (
                              <TableCell
                                key={index}
                                style={{
                                  textAlign: "center",
                                  backgroundColor: isBooked
                                    ? "#12EDE2" // Light green for booked dates
                                    : "",
                                }}
                              >
                                {day ? day : ""}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

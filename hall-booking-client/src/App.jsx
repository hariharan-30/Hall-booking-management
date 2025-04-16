import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import HallBookingForm from "./components/HallBookingForm";
import GlobalSnackbar from "./components/GlobalSnackbar";
import AdditionalFeatures from "./components/AdditionalFeatures";
import Home from "./components/Home/Home";
import Signup from "./components/Signup/signup";
import SignIn from "./components/SignIn/signin";
import BookingForm from "./components/Booking/BookingForm";
import BookingItems from "./components/BookingItems/BookingItems";
import Navbar from "./components/Navbar/Navbar";
import Add from "./components/Add";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
      <BrowserRouter>
        <GlobalSnackbar />
        <Routes>
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/navbar" element={<Navbar />} />
          <Route exact path="/signin" element={<SignIn />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/hall" element={<HallBookingForm />} />
          <Route exact path="/booking" element={<BookingForm />} />
          <Route exact path="/addFeature" element={<AdditionalFeatures />} />
          <Route exact path="/bookingItems" element={<BookingItems />} />
          <Route exact path="/add" element={<Add />} />
          
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

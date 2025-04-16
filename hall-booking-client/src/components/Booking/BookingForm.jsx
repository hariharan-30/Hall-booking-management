import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  FormHelperText,
  Autocomplete,
  Paper,
} from "@mui/material";
import BookingItems from "../BookingItems/BookingItems";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import "bootstrap/dist/css/bootstrap.min.css";
import { Box, CircularProgress } from "@mui/material";
import Cookies from "js-cookie";
import useSnackbarStore from "../SnackbarStore/useSnackbarStore";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import Navbar from "../Navbar/Navbar";
import BookingReport from "../BookingReport/BookingReport";

const payMode = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
];

const payType = ["UPI", "NEFT"];

// Fetch available hall names from API
const getHallName = async () => {
  try {
    const response = await axios.get("http://localhost:5004/hall");
    return response.data;
  } catch (error) {
    console.error(
      "Error updating hall item:",
      error.response?.data || error.message
    );
    throw new Error("Something went wrong");
  }
};

// Create a new booking item using the API
const postBookingItem = async (data) => {
  try {
    const token = Cookies.get("jwt_token");
    const response = await axios.post("http://localhost:5004/booking", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating hall item:",
      error.response?.data || error.message
    );
    throw new Error("Failed to add item");
  }
};

// Update a  booking item using the API
const updateBookingItem = async (data) => {
  try {
    const token = Cookies.get("jwt_token");
    const response = await axios.put(
      `http://localhost:5004/booking/${data._id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating hall item:",
      error.response?.data || error.message
    );
    throw new Error("Failed to update item");
  }
};

// Delete a booking item by ID using the API
const deleteBookingItem = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:5004/booking/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete item");
  }
};

const getFilterItems = async (page, limit) => {
  try {
    const response = await axios.get(
      "http://localhost:5004/api/filteredItems",
      {
        params: { page, limit },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to filter item");
  }
};

// Validation schema using Yup for booking form

const bookingValidation = yup.object().shape({
  date: yup
    .date()
    .required("Date is required")
    .typeError("Invalid date format"),
  customerName: yup.string().max(200).required("Customer name is required"),
  mobileNo: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  bStartDate: yup
    .date()
    .required("Booking start date is required")
    .typeError("Invalid date format")
    .test("Start date must be less than end date", function (value, context) {
      const { bEndDate } = context.parent;
      return value <= bEndDate;
    }),
  bStartTime: yup.string().required("Booking start time is required"),
  bEndDate: yup
    .date()
    .required("Booking end date is required")
    .typeError("Invalid date format"),
  bEndTime: yup.string().required("Booking end time is required"),
  advance: yup
    .object()
    .shape({
      totalAmt: yup
        .number()
        .typeError("Total amount must be a number")
        .positive("Amount must be a positive number")
        .required("Total Amount is required"),
      returnAmount: yup
        .number()
        .typeError("Total amount must be a number")
        .positive("Amount must be a positive number"),
      payMode: yup.string().required("Pay mode is required"),
      payType: yup
        .string()
        .test(
          "payType-required-if-bank",
          "Pay type is required for bank payments",
          function (value, context) {
            const { payMode } = context.parent;
            if (payMode === "bank") {
              return !!value;
            }
            return true;
          }
        ),
    })
    .nullable()
    .default(null),
});

// Default form values with current date and time
const defaultValues = {
  date: dayjs().format("YYYY-MM-DD"),
  customerName: "",
  mobileNo: "",
  bStartDate: dayjs().format("YYYY-MM-DD"),
  bStartTime: dayjs().set("hour", 0).set("minute", 0).format("HH:mm"), // 12:00 AM
  bEndDate: dayjs().format("YYYY-MM-DD"),
  bEndTime: dayjs().set("hour", 23).set("minute", 59).format("HH:mm"), // 11:59 PM
  totalAmt: "",
  returnAmount: "",
  payMode: "",
  payType: "",
};

const BookingForm = () => {
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [totalDays, settotalDays] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  // React Hook Form setup with validation and default values
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookingValidation),
    defaultValues: defaultValues,
  });

  const startDate = watch("bStartDate");
  const endDate = watch("bEndDate");
  const startTime = watch("bStartTime");
  const endTime = watch("bEndTime");

  const selectHallName = watch("hallName");

  const selectedPayMode = watch("payMode");

  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      const startday = dayjs(startDate);
      const endDay = dayjs(endDate);
      const totalDay = endDay.diff(startday, "day");
      settotalDays(totalDay >= 1 ? totalDay : 1);

      if (startTime < endTime) {
        const startDateTime = dayjs(`${startDate}T${startTime}`);
        const endDateTime = dayjs(`${endDate}T${endTime}`);

        const hoursDifference = endDateTime.diff(startDateTime, "hour", true);

        // const hours = Math.round(hoursDifference);

        setTotalHours(hoursDifference.toFixed(2));
      } else {
        setTotalHours(0);
      }
    }
  }, [startDate, endDate, startTime, endTime]);

  const { data: hallData } = useQuery({
    queryKey: ["hallNames"],
    queryFn: getHallName,
    staleTime: 1000 * 60 * 5,
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["filterItems", page],
    queryFn: () => getFilterItems(page, limit),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: filteredData,
    totalPages,
    totalItems,
    currentPage,
  } = data || {};

  const queryClient = useQueryClient();

  // Mutation to post new booking details
  const postBookingDetails = useMutation({
    mutationFn: postBookingItem,
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries(["filteredData"]); // Invalidate the bookingItems query to refetch data
      reset(defaultValues);
      showSnackbar("Your data has been successfully submitted!", "success");
    },
    onError: () => {
      showSnackbar("Something went wrong", "error");
    },
  });

  const isPostPending = postBookingDetails.isPending;

  // Mutation to update a booking details
  const updateBookingDetails = useMutation({
    mutationFn: updateBookingItem,
    onSuccess: () => {
      setEditingId(null);
      setItems([]);
      reset(defaultValues);
      queryClient.invalidateQueries(["filteredData"]);
      showSnackbar("Your data has been updated successfully!", "success");
    },
    onError: () => {
      showSnackbar("Something went wrong", "error");
    },
  });

  const isEditPending = updateBookingDetails.isPending;

  // Mutation to delete a booking item
  const deleteBookingDetails = useMutation({
    mutationFn: deleteBookingItem,
    onSuccess: () => {
      setItems([]);
      queryClient.invalidateQueries(["filteredData"]); // Invalidate and refetch booking items after deletion
      reset(defaultValues);
      showSnackbar("Your data has been deleted successfully!", "success");
    },
    onError: () => {
      showSnackbar("Something went wrong", "error");
    },
  });

  const isDeletePending = deleteBookingDetails.isPending
    ? deleteBookingDetails.variables
    : null;

  const specificItem = async (id) => {
    const response = await axios.get(`http://localhost:5004/booking/${id}`);
    const {
      date,
      hallName,
      customerName,
      mobileNo,
      bStartDate,
      bEndDate,
      items,
      advance,
    } = response.data;

    const formattedTime = dayjs(bStartDate).format("HH:mm:ss");
    const formattedEndTime = dayjs(bEndDate).format("HH:mm:ss");

    setEditingId(id);
    setItems(items);

    reset({
      date: dayjs(date).format("YYYY-MM-DD"), // Format to YYYY-MM-DD
      hallName,
      customerName,
      mobileNo,
      bStartDate: dayjs(bStartDate).format("YYYY-MM-DD"), // Format to YYYY-MM-DD
      bStartTime: formattedTime,
      bEndDate: dayjs(bEndDate).format("YYYY-MM-DD"), // Format to YYYY-MM-DD
      bEndTime: formattedEndTime,
      items,
      totalAmt: advance?.totalAmt,
      returnAmount: advance?.returnAmount,
      payMode: advance?.payMode,
      payType: advance?.payType,
    });
  };

  const onSubmitBooking = (formData) => {
    const isHallExist = items.some(
      (item) => item.name && item.name === selectHallName
    );
    if (!isHallExist) {
      alert("Booking must include at least one hall.");
      return;
    }
    const advance = {
      totalAmt: formData.totalAmt,
      returnAmount: formData.returnAmount,
      payMode: formData.payMode,
      payType: formData.payType,
    };

    const {
      totalAmt,
      returnAmount,
      payMode,
      payType,
      bEndTime,
      bStartTime,
      bEndDate,
      bStartDate,

      ...newFormData
    } = formData;

    const combineData = {
      ...newFormData,
      bStartDate: dayjs(`${startDate}T${startTime}`).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      bEndDate: dayjs(`${endDate}T${endTime}`).format("YYYY-MM-DD HH:mm:ss"),
      items,
      advance,
    };
    if (editingId) {
      updateBookingDetails.mutateAsync({ _id: editingId, ...combineData });
    } else {
      postBookingDetails.mutateAsync(combineData);
    }
    reset(defaultValues);
  };

  

  return (
    <div>
      <Navbar />
      <h1 style={{ textAlign: "center", marginTop: "100px" }}>Booking</h1>
      <div style={{ width: "100%", backgroundColor: "white", padding: "40px" }}>
        <form onSubmit={handleSubmit(onSubmitBooking)}>
          {/* Submit button */}
          <div style={{ textAlign: "right" }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isPostPending || isEditPending}
              startIcon={
                isPostPending || isEditPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {editingId ? "Update" : "Save"}
            </Button>
          </div>

          {/* Date input field */}
          <Controller
            name="date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Date"
                type="date"
                size="medium"
                value={value || ""}
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "450px" }}
              />
            )}
          />
          <br />
          {errors.date && (
            <FormHelperText error>{errors.date.message}</FormHelperText>
          )}

          {/* Hall name input field */}
          <Controller
            name="hallName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                size="medium"
                select
                label="Hall Name"
                onChange={onChange}
                value={value || ""}
                sx={{ marginTop: "20px", width: "450px" }}
              >
                {hallData?.map((option) => (
                  <MenuItem key={option.hallName} value={option.hallName}>
                    {option.hallName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <br />

          {/* Customer name input field */}
          <Controller
            name="customerName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Customer Name"
                size="medium"
                type="text"
                onChange={onChange}
                value={value || ""}
                sx={{ marginTop: "20px", width: "750px" }}
              />
            )}
          />
          <br />
          {errors.customerName && (
            <FormHelperText error>{errors.customerName.message}</FormHelperText>
          )}

          {/* Mobile number input field */}
          <Controller
            name="mobileNo"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Mobile Number"
                size="medium"
                onChange={onChange}
                value={value || ""}
                type="text"
                sx={{ marginTop: "20px", width: "450px" }}
              />
            )}
          />
          {errors.mobileNo && (
            <FormHelperText error>{errors.mobileNo.message}</FormHelperText>
          )}

          {/* Booking start date and time */}
          <div>
            <Controller
              name="bStartDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Start Date"
                  size="medium"
                  type="date"
                  onChange={onChange}
                  value={value || ""}
                  InputLabelProps={{ shrink: true }}
                  sx={{ marginTop: "20px", width: "450px" }}
                />
              )}
            />
            <Controller
              name="bStartTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="Start Time"
                  type="time"
                  size="medium"
                  onChange={onChange}
                  value={value || ""}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    marginTop: "20px",
                    marginLeft: "20px",
                    width: "250px",
                  }}
                />
              )}
            />
          </div>
          {errors.bStartDate && (
            <FormHelperText error>{errors.bStartDate.message}</FormHelperText>
          )}
          {errors.bStartTime && (
            <FormHelperText error>{errors.bStartTime.message}</FormHelperText>
          )}

          {/* Booking end date and time */}
          <div>
            <Controller
              name="bEndDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="End Date"
                  size="medium"
                  type="date"
                  onChange={onChange}
                  value={value || ""}
                  InputLabelProps={{ shrink: true }}
                  sx={{ marginTop: "20px", width: "450px" }}
                />
              )}
            />
            {errors.bEndDate && (
              <FormHelperText error>{errors.bEndDate.message}</FormHelperText>
            )}
            <Controller
              name="bEndTime"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="End Time"
                  type="time"
                  size="medium"
                  onChange={onChange}
                  value={value || ""}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    marginTop: "20px",
                    marginLeft: "20px",
                    width: "250px",
                  }}
                />
              )}
            />
          </div>
          {errors.bEndTime && (
            <FormHelperText error>{errors.bEndTime.message}</FormHelperText>
          )}

          {/* Display calculated booking details (total days and hours) */}
          <div>
            <BookingItems
              totalDays={totalDays}
              totalHours={totalHours}
              hallData={hallData}
              items={items}
              setItems={setItems}
              selectHallName={selectHallName}
            />
          </div>

          <div style={{ width: "100%", backgroundColor: "white" }}>
            <h1 style={{ fontSize: "32px", marginTop: "35px" }}>Advance</h1>
            <div>
              <Controller
                name="totalAmt"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    size="medium"
                    label="Total Amount"
                    onChange={onChange}
                    value={value || ""}
                    sx={{ marginBottom: "20px", width: "450px" }}
                  />
                )}
              />
              {errors.totalAmt && (
                <p style={{ color: "#9F0406" }}>{errors.totalAmt.message}*</p>
              )}
              <br />
              <Controller
                name="returnAmount"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    size="medium"
                    label="Returnable Amount"
                    onChange={onChange}
                    value={value || ""}
                    sx={{ marginBottom: "20px", width: "450px" }}
                  />
                )}
              />
              {errors.returnAmount && (
                <p style={{ color: "#9F0406" }}>
                  {errors.returnAmount.message}*
                </p>
              )}
              <br />
              <Controller
                name="payMode"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    select
                    size="medium"
                    label="Pay Mode"
                    onChange={onChange}
                    value={value || ""}
                    sx={{ marginBottom: "20px", width: "450px" }}
                  >
                    {payMode.map((eachMode) => (
                      <MenuItem value={eachMode.value} key={eachMode.value}>
                        {eachMode.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              {errors.payMode && (
                <p style={{ color: "#9F0406" }}>{errors.payMode.message}*</p>
              )}
              <br />

              <Controller
                name="payType"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    id="free-solo-demo"
                    freeSolo
                    options={payType}
                    value={value}
                    onChange={(event, newValue) => onChange(newValue)}
                    disabled={selectedPayMode === "cash"}
                    sx={{ marginBottom: "20px", width: "450px" }}
                    renderInput={(params) => (
                      <TextField
                        onChange={onChange}
                        {...params}
                        label="Pay Type"
                      />
                    )}
                  />
                )}
              />
              {errors.payType && (
                <p style={{ color: "#9F0406" }}>{errors.payType.message}</p>
              )}
            </div>
          </div>
        </form>
      </div>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "red" }}>{error.message}</p>
        </Box>
      ) : (
        <Table sx={{ marginTop: "50px" }} component={Paper}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1ad1ff" }}>
              {/* Table headers */}
              {[
                "Date",
                "Hall Name",
                "Customer Name",
                "Mobile Number",
                "Start Date",
                "End Date",
                "Edit",
                "Delete",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{ color: "white", fontSize: "17px" }}
                >
                  {header}
                </TableCell>            
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Rendering booking items from the API */}
            {filteredData?.map((item) => (
              <BookingReport
                key={item._id}
                item={item}
                deleteBookingDetails={() =>
                  deleteBookingDetails.mutateAsync(item._id)  
                }
                specificItem={specificItem}
                isDeletePending={isDeletePending}
              />
            ))}
          </TableBody>
        </Table>
      )}
      <div className="btn-container mt-3">
        <button
          className="btn btn-primary m-2"
          disabled={currentPage === 1 || totalItems === 0}
          onClick={() => setPage(currentPage - 1)}
        >
          <ArrowBackIosNewIcon />
        </button>
        <button
          className="btn btn-primary m-2"
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => setPage(currentPage + 1)}
        >
          <ArrowForwardIosIcon />
        </button>
      </div>
    </div>
  );
};

export default BookingForm;

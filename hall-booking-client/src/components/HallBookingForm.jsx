import React, { useState } from "react";
import {
  Button,
  MenuItem,
  TextField,
  Table,
  TableCell,
  Autocomplete,
  Chip,
  TableHead,
  TableRow,
  TableBody,
  Paper,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import Cookies from "js-cookie";
import { Box, CircularProgress } from "@mui/material";

import Navbar from "./Navbar/Navbar";
import AdditionalFeatures from "./AdditionalFeatures";
import Report from "./Report";
import useSnackbarStore from "./SnackbarStore/useSnackbarStore";

const defaultValues = {
  hallName: "",
  features: "",
  capacity: "",
  size: "",
  pricePerHour: "",
  pricePerDay: "",
};

const schemavalidation = yup
  .object()
  .shape({
    hallName: yup.string().max(200).required("Hall name is required"),
    features: yup
      .array()
      .of(
        yup
          .string()
          .max(100, "Each feature can be a maximum of 100 characters")
          .nullable(true)
          .notRequired()
      ),
    capacity: yup.string().max(50),
    size: yup.string().required("Size is required"),
    pricePerHour: yup
      .number()
      .typeError("Price per hour must be a number")
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .min(0, "Price per hour must be at least 0")
      .nullable(true)
      .notRequired()
      .test("pHourOrpDay", "Price per hour is required", function (value) {
        const { pricePerDay } = this.parent;
        return value !== undefined || pricePerDay !== undefined;
      })
      .test("bothNotZero", "Price per hour cannot be zero", function (value) {
        const { pricePerDay } = this.parent;
        return !(value === 0 && pricePerDay === 0);
      }),
    pricePerDay: yup
      .number("Price must be a number")
      .typeError("Price per day must be a number")
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .min(0, "Price per day must be at least 0")
      .nullable(true)
      .notRequired()
      .test("pDayOrpHour", "Price per day is required", function (value) {
        const { pricePerHour } = this.parent;
        return value !== undefined || pricePerHour !== undefined;
      })
      .test("bothNotZero", "Price per day cannot be zero", function (value) {
        const { pricePerHour } = this.parent;
        return !(value === 0 && pricePerHour === 0);
      }),
  })
  .test(
    "pHourOrpDayRequired",
    "At least one of price per hour or price per day is required",
    function (value) {
      return (
        value.pricePerHour !== undefined || value.pricePerDay !== undefined
      );
    }
  );

// Add Hall Item
const addHallItem = async (data) => {
  try {
    const token = Cookies.get("jwt_token");
    console.log("token", token);
    const response = await axios.post("http://localhost:8000/hall", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add item request failed:", error);
    throw new Error("Failed to post item");
  }
};

const getHallItem = async () => {
  try {
    const response = await axios.get("http://localhost:8000/hall");
    return response.data;
  } catch (error) {
    console.error("get item request failed:", error);
    throw new Error("Failed to get item");
  }
};

const updateHallItem = async (data) => {
  try {
    const token = Cookies.get("jwt_token");
    const response = await axios.put(`http://localhost:8000/hall/${data._id}`, data, {
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
    throw new Error("Failed to update item");
  }
};

const deleteReportItem = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:8000/hall/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting hall item:",
      error.response?.data || error.message
    );
    throw new Error("Failed to delete item");
  }
};

const sizeList = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const HallBookingForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemavalidation),
    defaultValues,
  });

  const [editingId, setEditingId] = useState(null);
  const [addnlFeatures, setAddnlFeatures] = useState([]);

  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["hallItem"],
    queryFn: getHallItem,
    staleTime: 1000 * 60 * 5,
    gcTime: 2000,
  });

  const postHallData = useMutation({
    mutationFn: addHallItem,
    onSuccess: () => {
      setAddnlFeatures([]);
      reset(defaultValues);
      queryClient.invalidateQueries(["hallItem"]);
      showSnackbar("Your data has been successfully submitted!", "success");
    },
    onError: (error) => {
      showSnackbar(
        error?.response?.data?.message ||
          "Hall name already exists please try another hall name",
        "error"
      );
    },
  });

  const isPending = postHallData.isPending;

  const updateHallData = useMutation({
    mutationFn: updateHallItem,
    onSuccess: () => {
      setAddnlFeatures([]);
      reset(defaultValues);
      setEditingId(null);
      queryClient.invalidateQueries(["hallItem"]);
      showSnackbar("Your data has been updated successfully!", "success");
    },
    onError: (error) => {
      showSnackbar(
        error?.response?.data?.message || "Something went wrong",
        "error"
      );
    },
  });

  const isEditPending = updateHallData.isPending;

  const deleteReport = useMutation({
    mutationFn: deleteReportItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["hallItem"]);
      reset({ defaultValues });
      setAddnlFeatures([]);
      showSnackbar("Your data has been deleted successfully!", "success");
    },
    onError: (error) => {
      showSnackbar(
        error?.response?.data?.message || "Something went wrong",
        "error"
      );
    },
  });

  const deletePending = deleteReport.isPending ? deleteReport.variables : null;

  const specificItem = async (id) => {
    const response = await axios.get(`http://localhost:8000/hall/${id}`);
    const {
      hallName,
      features,
      capacity,
      size,
      pricePerDay,
      pricePerHour,
      addnlFeatures,
    } = response.data;
    setEditingId(id);
    setAddnlFeatures(addnlFeatures);
    reset({
      hallName,
      features,
      capacity,
      size,
      pricePerDay,
      pricePerHour,
    });
  };

  const onSubmitForm = (formData) => {
    const combineData = {
      ...formData,
      addnlFeatures,
    };
    console.log('updating combineData',combineData)

    if (editingId) {
      updateHallData.mutateAsync({ _id: editingId, ...combineData });
    } else {
      postHallData.mutateAsync(combineData);
      reset(addnlFeatures);
    }
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar />
      <h1 style={{ textAlign: "center", marginTop: "100px" }}>Halls</h1>
      <div style={{ width: "100%", backgroundColor: "white", padding: "40px" }}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              <Controller
                name="hallName"
                control={control}
                render={({ field: { onChange, value = "" } }) => (
                  <TextField
                    size="medium"
                    label="Hall Name"
                    onChange={onChange}
                    value={value}
                    sx={{ width: "750px" }}
                  />
                )}
              />
              {errors.hallName && (
                <p style={{ color: "#9F0406" }}>{errors.hallName.message}*</p>
              )}
            </div>

            {/* save button */}
            <div style={{ marginLeft: "30px" }}>
              <Button
                variant="contained"
                type="submit"
                disabled={isPending || isEditPending}
                startIcon={
                  isPending || isEditPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </div>

          <Controller
            name="features"
            control={control}
            render={({ field: { onChange, value = [] } }) => (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={value}
                onChange={(event, newValue) => onChange(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Features"
                    placeholder="Add features"
                    sx={{ marginTop: "20px", width: "750px" }}
                  />
                )}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.target.value) {
                    event.preventDefault();
                    if (value.indexOf(event.target.value) === -1) {
                      onChange([...value, event.target.value]);
                    }
                    event.target.value = "";
                  }
                }}
              />
            )}
          />
          <br />
          <Controller
            name="capacity"
            control={control}
            render={({ field: { onChange, value = "" } }) => (
              <TextField
                size="medium"
                label="Capacity"
                onChange={onChange}
                value={value}
                sx={{ marginTop: "20px", width: "450px" }}
              />
            )}
          />

          <br />
          <Controller
            name="size"
            control={control}
            render={({ field: { onChange, value = "" } }) => (
              <TextField
                size="medium"
                select
                label="Size"
                onChange={onChange}
                value={value}
                sx={{ marginTop: "20px", width: "450px" }}
              >
                {sizeList.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {errors.size && (
            <p style={{ color: "#9F0406" }}>{errors.size.message}*</p>
          )}

          <div>
            <Controller
              name="pricePerDay"
              control={control}
              render={({ field: { onChange, value = "" } }) => (
                <TextField
                  size="medium"
                  label="Price Per Day"
                  type="number"
                  onChange={onChange}
                  value={value}
                  sx={{ marginTop: "20px", width: "450px" }}
                />
              )}
            />
            {errors.pricePerDay && (
              <p style={{ color: "#9F0406" }}>{errors.pricePerDay.message}</p>
            )}
            <br />
            <Controller
              name="pricePerHour"
              control={control}
              render={({ field: { onChange, value = "" } }) => (
                <TextField
                  size="medium"
                  type="number"
                  label="Price Per Hour"
                  onChange={onChange}
                  value={value}
                  sx={{ marginTop: "20px", width: "450px" }}
                />
              )}
            />
            {errors.pricePerHour && (
              <p style={{ color: "#9F0406" }}>{errors.pricePerHour.message}</p>
            )}
          </div>

          <div style={{ marginTop: "40px" }}>
            <AdditionalFeatures
              setAddnlFeatures={setAddnlFeatures}
              addnlFeatures={addnlFeatures}
            />
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
              {[
                "Hall Name",
                "Features",
                "Capacity",
                "Size",
                "Price Per Day",
                "Price Per Hour",
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
            {data?.map((eachData) => (
              <Report
                eachData={eachData}
                key={eachData._id}
                deleteReportItem={() => deleteReport.mutateAsync(eachData._id)}
                specificItem={specificItem}
                deletePending={deletePending}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default HallBookingForm;

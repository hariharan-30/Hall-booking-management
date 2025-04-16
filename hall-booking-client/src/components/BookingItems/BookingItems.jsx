import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import BookingDetailsRow from "../BookingDetailsRow/BookingDetailsRow";

const itemsValidation = yup.object().shape({
  name: yup.string().required("Feature is required"),
  bType: yup.string().required("Based on is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive()
    .integer(),
  qty: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive()
    .integer(),
});

const defaultValues = { name: "", bType: "", price: "", qty: 1 };

const basedOnList = [
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
];

const BookingItems = ({
  totalHours,
  totalDays,
  hallData,
  items,
  setItems,
  selectHallName,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(itemsValidation),
    defaultValues,
  });

  const [editId, setEditId] = useState(null);

  const selectedFeature = watch("name");
  const selectedBasedOn = watch("bType");

  const availableFeatures =
    hallData?.find((hall) => hall.hallName === selectHallName)?.addnlFeatures ||
    [];

  const calculateSelectedItemPrice = (bType, name) => {
    if (name === selectHallName) {
      const selectedHall = hallData?.find(
        (hall) => hall.hallName === selectHallName
      );
      return bType === "day"
        ? selectedHall?.pricePerDay
        : selectedHall?.pricePerHour;
    }
    const feature = availableFeatures.find((feature) => feature.name === name);
    return bType === "day" ? feature?.pricePerDay : feature?.pricePerHour;
  };

  const totalSum = items?.reduce((sum, item) => sum + item.amount, 0) || 0;

  useEffect(() => {
    if (selectedFeature && selectedBasedOn) {
      const price = calculateSelectedItemPrice(
        selectedBasedOn,
        selectedFeature
      );
      setValue("price", price);
    }
  }, [
    selectedFeature,
    selectedBasedOn,
    selectHallName,
    availableFeatures,
    hallData,
  ]);

  const onSubmitItems = (data) => {
    const { name, bType, qty } = data;
    const price = calculateSelectedItemPrice(bType, name);
    const amount =
      bType === "day" ? price * qty * totalDays : price * qty * totalHours;

    const isDuplicate = items.some(
      (item) => item.name === name && item.bType === bType && item.id !== editId
    );
    if (isDuplicate && !editId) {
      alert("This item has already been added.");
      return;
    }

    if (editId) {
      setItems(
        items.map((item) =>
          item.id === editId ? { ...item, ...data, price, amount } : item
        )
      );
      setEditId(null);
    } else {
      setItems([
        ...items,
        { id: uuidv4(), ...data, price, amount, totalDays, totalHours },
      ]);
    }

    reset();
  };

  const deleteBooking = (id) =>
    setItems(items.filter((item) => item.id !== id));

  const editItems = (id) => {
    const item = items.find((item) => item.id === id);
    setValue("name", item.name);
    setValue("bType", item.bType);
    setValue("price", item.price);
    setValue("qty", item.qty);
    setEditId(id);
  };

  return (
    <div>
      <div style={{ width: "100%", backgroundColor: "white" }}>
        <h1 style={{ fontSize: "32px", marginTop: "20px" }}>Items</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Feature Name"
                size="medium"
                sx={{ marginTop: "20px", width: "450px" }}
              >
                <MenuItem value={selectHallName}>Hall</MenuItem>
                {availableFeatures.length > 0 ? (
                  availableFeatures.map((feature, index) => (
                    <MenuItem key={index} value={feature.name}>
                      {feature.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No additional features available
                  </MenuItem>
                )}
              </TextField>
            )}
          />
          {errors.name && (
            <p style={{ color: "#9F0406" }}>{errors.name.message}*</p>
          )}
          <div>
            <p style={{ fontWeight: "600" }}>Total days: {totalDays}</p>
            <p style={{ fontWeight: "600" }}>Total hours: {totalHours}</p>
          </div>
        </div>
        <br />
        <Controller
          name="bType"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Based on"
              size="medium"
              sx={{ marginTop: "20px", marginRight: "20px", width: "450px" }}
            >
              {basedOnList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {errors.bType && (
          <p style={{ color: "#9F0406" }}>{errors.bType.message}*</p>
        )}
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Price"
              size="medium"
              type="number"
              disabled
              sx={{ marginTop: "20px", width: "450px" }}
            />
          )}
        />
        <br />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Controller
            name="qty"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantity"
                size="medium"
                type="number"
                disabled={selectedFeature === selectHallName}
                sx={{ marginTop: "20px", width: "450px" }}
              />
            )}
          />
          {errors.qty && (
            <p style={{ color: "#9F0406" }}>{errors.qty.message}*</p>
          )}
          {/* <p
            style={{ marginLeft: "25px", marginTop: "20px", fontWeight: "600" }}
          >
            Amount: RS. 
          </p> */}
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmitItems)}
            sx={{ marginLeft: "25px", backgroundColor: "green" }}
            startIcon={<AddIcon />}
          >
            {editId ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </div>
      {items?.length > 0 && (
        <>
          <Table
            sx={{ marginTop: "50px", width: "650px", borderRadius: "10px" }}
            component={Paper}
          >
            <TableHead
              sx={{
                marginTop: "50px",
                width: "670px",
                borderCollapse: "collapse",
              }}
              component={Paper}
            >
              <TableRow sx={{ backgroundColor: "#1ad1ff" }}>
                <TableCell>Feature Name</TableCell>
                <TableCell>Based on</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <BookingDetailsRow
                  key={item.id}
                  item={item}
                  editItems={editItems}
                  deleteBooking={deleteBooking}
                />
              ))}
            </TableBody>
          </Table>
          <p style={{ marginLeft: "310px", marginTop: "20px" }}>
            Total Amount: {totalSum}
          </p>
        </>
      )}
    </div>
  );
};

export default BookingItems;

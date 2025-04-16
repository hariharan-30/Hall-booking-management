import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AddIcon from "@mui/icons-material/Add";
import FeatureRow from "./FeatureRow";

// const yupValidation = yup.object().shape({
//   feature: yup.string().max(100).required(),
//   pHour: yup
//     .number()
//     .min(0, "Price per hour must be at least 0")
//     .test(
//       "pHourOrpDay",
//       "price per hour must be greater than 0",
//       function (value, context) {
//         const { pDay } = context.parent;
//         console.log('context', context)
//         return value >= 0 || pDay >= 0;
//       }
//     ).test(
//       function (context) {
//         const {pDay} = context.parent
//         return pDay >= 0

//       }
//     )
//     .required("Price per hour is required"),
//   pDay: yup
//     .number()
//     .min(0, "Price per day must be at least 0")
//     .test(
//       "pHourOrpDay",
//       "price per day must be greater than 0",
//       function (value) {
//         const { pHour } = this.parent;
//         return value >= 0 || pHour >= 0;
//       }
//     )
//     .required("Price per day is required"),
// });

const yupValidation = yup
  .object()
  .shape({
    name: yup.string().max(100).required(),
    pricePerHour: yup
      .number("price must be a number")
      .min(0, "Price per hour must be at least 0")
      .nullable(true)
      .typeError("price per hour must be a number")
      .notRequired()
      .test("pHourOrpDay", "Price per hour is required", function (value) {
        const { pricePerDay } = this.parent;
        return value !== undefined || pricePerDay !== undefined;
      })
      .test("bothNotZero", "price per hour cannot be zero", function (value) {
        const { pricePerDay } = this.parent;
        return !(value === 0 && pricePerDay === 0);
      }),
    pricePerDay: yup
      .number("price must be a number")
      .min(0, "Price per day must be at least 0")
      .nullable(true)
      .notRequired()
      .typeError("price per day must be a number")
      .test("pDayOrpHour", "Price per day is required", function (value) {
        const { pricePerHour } = this.parent;
        return value !== undefined || pricePerHour !== undefined;
      })
      .test("bothNotZero", "price per day cannot be zero", function (value) {
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

const AdditionalFeatures = (props) => {
  const { setAddnlFeatures, addnlFeatures } = props;
  const [editId, setEditId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(yupValidation),
  });

  const onSubmitFeature = (data) => {
    // const isDuplicate = addnlFeatures.some((item) => item.name === data.name);

    // if (isDuplicate) {
    //   alert("Already the item have been there");
    //   return;
    // }

    if (isEditing) {
      setAddnlFeatures((prevState) =>
        prevState.map((item) =>
          item.id === editId ? { ...item, ...data } : item
        )
      );
      setIsEditing(false);
      setEditId(null);
    } else {
      const newData = {
        id: uuidv4(),
        ...data,
      };
      setAddnlFeatures((prevState) => [...prevState, newData]);
    }
    reset();
  };
  const deleteItem = (id) => {
    const filterData = addnlFeatures.filter((item) => item.id !== id);
    setAddnlFeatures(filterData);
    reset();
  };

  const editItem = (id) => {
    const itemToEdit = addnlFeatures.find((item) => item.id === id);
    setValue("name", itemToEdit.name);
    setValue("pricePerHour", itemToEdit.pricePerHour);
    setValue("pricePerDay", itemToEdit.pricePerDay);
    setEditId(id);
    setIsEditing(true);
  };

  return (
    <div>
      <div>
        <h2>Additional Features</h2>
        <div>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                size="medium"
                label="Feature"
                type="text"
                onChange={onChange}
                value={value || ""}
                sx={{ width: "450px" }}
              />
            )}
          />
          <br />
          {errors.name && (
            <p style={{ color: "#9F0406" }}>{errors.name.message}*</p>
          )}
          <Controller
            name="pricePerHour"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                size="medium"
                label="Price Per Hour"
                type="number"
                onChange={onChange}
                value={value || ""}
                style={{ marginTop: "20px", width: "450px" }}
              />
            )}
          />
          {errors.pricePerHour && (
            <p style={{ color: "#9F0406" }}>{errors.pricePerHour.message}*</p>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
            }}
          >
            <div>
              <Controller
                name="pricePerDay"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    size="medium"
                    label="Price Per Day"
                    type="number"
                    onChange={onChange}
                    value={value || ""}
                    style={{ marginTop: "20px", width: "450px" }}
                  />
                )}
              />
              {errors.pricePerDay && (
                <p style={{ color: "#9F0406" }}>
                  {errors.pricePerDay.message}*
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmitFeature)}
              sx={{ marginLeft: "20px", backgroundColor: "green" }}
            >
              <AddIcon />
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
        {addnlFeatures?.length === 0 ? (
          <div>
            <p style={{ textAlign: "center", marginTop: "10px" }}>
              No Data Found
            </p>
          </div>
        ) : (
          <Table
            sx={{
              marginTop: "50px",
              width: "600px",
              borderCollapse: "collapse",
            }}
            component={Paper}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1ad1ff" }}>
                <TableCell>Feature Name</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  Price Per Hour
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>Price Per Day</TableCell>
                <TableCell style={{ textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addnlFeatures?.map((eachItem) => (
                <FeatureRow
                  eachItem={eachItem}
                  key={eachItem.id}
                  deleteItem={deleteItem}
                  editItem={editItem}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdditionalFeatures;

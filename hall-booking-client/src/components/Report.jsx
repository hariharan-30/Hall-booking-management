import React from "react";
import { Button, CircularProgress, TableCell, TableRow } from "@mui/material";

const Report = (props) => {
  const { eachData, deleteReportItem, specificItem, deletePending } = props;
  const { _id, hallName, features, capacity, size, pricePerHour, pricePerDay } =
    eachData;

  const onDeleteReportItem = () => {
    deleteReportItem(_id);
  };

  const onEditReportItem = () => {
    specificItem(_id);
  };

  return (
    <TableRow
      sx={{
        "&:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
        "&:hover": { backgroundColor: "#ddd" },
      }}
    >
      <TableCell>{hallName}</TableCell>
      <TableCell>
        <div style={{ display: "flex" }}>
          {features?.map((feature, index) => (
            <p key={index} style={{ marginRight: "10px" }}>
              {feature}
            </p>
          ))}
        </div>
      </TableCell>
      <TableCell>{capacity}</TableCell>
      <TableCell>{size}</TableCell>
      <TableCell>{pricePerDay}</TableCell>
      <TableCell>{pricePerHour}</TableCell>
      <TableCell>
        <Button
          variant="contained"
          type="button"
          onClick={onEditReportItem}
          sx={{ backgroundColor: " #FE9900" }}
        >
          Edit
        </Button>
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          type="button"
          onClick={onDeleteReportItem}
          sx={{ backgroundColor: " #ff0066" }}
          disabled={deletePending === _id}
          startIcon={
            deletePending === _id ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};




export default Report;

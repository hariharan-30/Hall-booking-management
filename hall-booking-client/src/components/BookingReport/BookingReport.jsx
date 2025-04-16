import React from "react";
import { Button, CircularProgress, TableCell, TableRow } from "@mui/material";
import dayjs from "dayjs";

const BookingReport = (props) => {
  const { item, deleteBookingDetails, specificItem, isDeletePending } =
    props;
  const { _id, date, customerName, mobileNo, hallName, bStartDate, bEndDate } =
    item;

  const finalDate = dayjs(date).format("YYYY-MM-DD");

  const finalStartDate = dayjs(bStartDate).format("YYYY-MM-DD");

  const finalEndDate = dayjs(bEndDate).format("YYYY-MM-DD");

  const onDeleteReportItem = () => {
    deleteBookingDetails(_id);
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
      <TableCell>{finalDate}</TableCell>
      <TableCell>{hallName}</TableCell>
      <TableCell>{customerName}</TableCell>
      <TableCell>{mobileNo}</TableCell>
      <TableCell>{finalStartDate}</TableCell>
      <TableCell>{finalEndDate}</TableCell>
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
          startIcon={
            isDeletePending === _id ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
          disabled={isDeletePending === _id}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default BookingReport;

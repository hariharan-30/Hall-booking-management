import React from "react";
import { Button, TableCell, TableRow } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BookingDetailsRow = (props) => {
  const { item, deleteBooking, editItems } = props;
  const { id, name, bType, price, qty, amount } = item;


  const onClickDelete = () => {
    deleteBooking(id);
  };

  const onClickEditItem = () => {
    editItems(id);
   
  };

  return (
    <TableRow
      sx={{
        "&:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
        "&:hover": { backgroundColor: "#ddd" },
      }}
    >
      <TableCell>{name}</TableCell>
      <TableCell>{bType}</TableCell>
      <TableCell>{price}</TableCell>
      <TableCell>{qty}</TableCell>
      <TableCell>{amount}</TableCell>
      <TableCell style={{ textAlign: "center", display: "flex" }}>
        <Button>
          <EditIcon onClick={onClickEditItem} />
        </Button>
        <Button type="button">
          <DeleteIcon onClick={onClickDelete} />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default BookingDetailsRow;

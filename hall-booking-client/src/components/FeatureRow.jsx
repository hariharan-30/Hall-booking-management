import React from "react";
import { Button, TableCell, TableRow } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const FeatureRow = (props) => {
  const { eachItem, deleteItem, editItem } = props;
  const { id, name, pricePerHour, pricePerDay } = eachItem;

  const onClickDelete = () => {
    deleteItem(id);
  };

  const onClickEditItem = () => {
   editItem(id)
  }

  return (
    <TableRow
      sx={{
        "&:nth-of-type(even)": { backgroundColor: "#f2f2f2" },
        "&:hover": { backgroundColor: "#ddd" },
      }}
    >
      <TableCell>{name}</TableCell>
      <TableCell sx={{textAlign: "right"}}>{pricePerHour}</TableCell>
      <TableCell sx={{textAlign: "right"}}>{pricePerDay}</TableCell>
      <TableCell style={{textAlign: "center"}}>
        <Button onClick={onClickEditItem}>
          <EditIcon />
        </Button>
        <Button type="button" onClick={onClickDelete}>
          <DeleteIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default FeatureRow;

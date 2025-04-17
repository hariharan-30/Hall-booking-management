import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, TextField } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// yup validation Schema

const schemaValidation = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email("Invalid Email Format").required(),
  password: yup.string().required(),
});

// Create User API

const createUser = async (data) => {
  const response = await axios.post("http://localhost:8000/signup", data);
  return response.data;
};

// Signup Component

const Signup = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const navigate = useNavigate();

  const { mutateAsync, isError } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      navigate("/signin");
    },
  });

  const onSubmitForm = (data) => {
    mutateAsync(data);
  };

  return (
    <div className="d-flex flex-row justify-content-center align-items-center pt-5 pb-5  ">
      <div className="card bg-white  p-5" style={{ width: "450px" }}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="d-flex flex-column "
        >
          <h1 className="heading text-center mb-5">Sign up Form</h1>
          <Controller
            name="firstName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="First Name"
                value={value || ""}
                onChange={onChange}
              />
            )}
          />
          {errors.firstName && (
            <p className="text-danger">{errors.firstName.message}*</p>
          )}
          <Controller
            name="lastName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                onChange={onChange}
                label="Last Name"
                value={value || ""}
                style={{ marginTop: "25px" }}
              />
            )}
          />
          {errors.lastName && (
            <p className="text-danger">{errors.lastName.message}*</p>
          )}
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="Email"
                value={value || ""}
                onChange={onChange}
                style={{ marginTop: "25px" }}
              />
            )}
          />
          {errors.email && (
            <p className="text-danger">{errors.email.message}*</p>
          )}

          {isError && <p className="text-danger">Email Id Already Exists</p>}

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="Password"
                value={value || ""}
                type="password"
                onChange={onChange}
                style={{ marginTop: "25px" }}
              />
            )}
          />
          {errors.password && (
            <p className="text-danger">{errors.password.message}*</p>
          )}

          <div style={{ marginTop: "25px" }}>
            <Button type="submit" variant="contained" className="w-100">
              Sign Up
            </Button>
          </div>
        </form>
        <p className="mt-3 text-center">
          Already Sign up<Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

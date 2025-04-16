import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie"; // Fixed import for js-cookie

// const role = [
//   { value: "admin", label: "Admin" },
//   { value: "user", label: "User" },
// ];

// Validation schema using yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
  // role: yup.string().required("Role is required"),
});

// Login API function

const loginUser = async (data) => {
  const url = "http://localhost:5004/signin";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(url, options);
  const result = await response.json();

  if (response.ok) {
    return result; // Return JWT token on success
  } else {
    throw new Error(result.message || "Login failed");
  }
};

const SignIn = () => {
  const navigate = useNavigate(); // useNavigate should be inside the component

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const signInData = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store JWT token in cookies and navigate to the expense tracker page
      Cookies.set("jwt_token", data.jwtToken, { expires: 30 });
      navigate("/home");
    },
    onError: (error) => {
      console.error("Error during login:", error.message);
      alert("Login failed. Please try again.");
    },
  });

  const onSubmitForm = (data) => {
    signInData.mutateAsync(data);
  };

  return (
    <div className="d-flex flex-row justify-content-center align-items-center pt-5 pb-5 vh-100 signup-bg-container">
      <div className="card bg-white p-5" style={{ width: "450px" }}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="d-flex flex-column"
        >
          <h1 className="heading text-center">Sign In Form</h1>

          {/* Email input */}
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="Email"
                value={value || ""}
                onChange={onChange}
                style={{ marginBottom: "25px" }}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ""}
              />
            )}
          />

          {/* Password input */}
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={value || ""}
                onChange={onChange}
                style={{ marginBottom: "25px" }}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
              />
            )}
          />
          {/* <Controller
            name="role"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                select
                size="medium"
                label="Role"
                onChange={onChange}
                value={value || ""}
                style={{ marginBottom: "25px" }}
              >
                {role.map((eachRole) => (
                  <MenuItem value={eachRole.value} key={eachRole.value}>
                    {eachRole.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          /> */}

          {/* Submit button */}
          <Button type="submit" variant="contained" className="w-100">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

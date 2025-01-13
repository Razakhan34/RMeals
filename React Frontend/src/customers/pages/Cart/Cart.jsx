import React, { useState, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Divider,
  Snackbar,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AddressAutofill } from "@mapbox/search-js-react";
import { createOrder } from "../../../State/Customers/Orders/Action";
import { findCart } from "../../../State/Customers/Cart/cart.action";
import { isValid } from "../../util/ValidToOrder";
import { cartTotal } from "./totalPay";
import AddressCard from "../../components/Address/AddressCard";
import CartItemCard from "../../components/CartItem/CartItemCard";
// import "mapbox-gl/dist/mapbox-gl.css";

// Initial Values and Validation Schema
const initialValues = {
  address_line1: "",
  state: "",
  pincode: "",
  city: "",
};

// const validationSchema = Yup.object().shape({
//   address-line1: Yup.string().required("Street Address is required"),
//   state: Yup.string().required("State is required"),
//   pincode: Yup.string()
//     .required("Pincode is required")
//     .matches(/^\d{6}$/, "Pincode must be 6 digits"),
//   city: Yup.string().required("City is required"),
// });

const Cart = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const { cart, auth } = useSelector((store) => store);

  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    dispatch(findCart(localStorage.getItem("jwt")));
  }, [dispatch]);

  const handleShowAddressForm = () => setShowAddressForm(!showAddressForm);
  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleSubmit = (values, { resetForm }) => {
    const data = {
      token: localStorage.getItem("jwt"),
      order: {
        restaurantId: cart.cartItems[0].food?.restaurant.id,
        deliveryAddress: {
          fullName: auth.user?.fullName,
          streetAddress: values["address-line1 address-search"],
          city: values.city,
          state: values.state,
          postalCode: values.pincode,
          country: "India",
        },
      },
    };

    if (isValid(cart.cartItems)) {
      dispatch(createOrder(data));
    } else {
      setOpenSnackbar(true);
    }
  };

  const createOrderUsingSelectedAddress = (deliveryAddress) => {
    const data = {
      token: localStorage.getItem("jwt"),
      order: {
        restaurantId: cart.cartItems[0].food.restaurant.id,
        deliveryAddress,
      },
    };

    if (isValid(cart.cartItems)) {
      dispatch(createOrder(data));
    } else {
      setOpenSnackbar(true);
    }
  };

  return (
    <Fragment>
      {cart.cartItems.length > 0 ? (
        <main className="lg:flex justify-between">
          {/* Left Section - Cart Items */}
          <section className="lg:w-[30%] space-y-6 lg:min-h-screen pt-10">
            {cart.cartItems.map((item) => (
              <CartItemCard item={item} key={item.id} />
            ))}

            <Divider />
            <div className="billDetails px-5 text-sm">
              <p className="font-extralight py-5">Bill Details</p>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <p>Item Total</p>
                  <p>₹{cartTotal(cart.cartItems)}</p>
                </div>
                <div className="flex justify-between text-gray-400">
                  <p>Delivery Fee</p>
                  <p>₹21</p>
                </div>
                <div className="flex justify-between text-gray-400">
                  <p>Platform Fee</p>
                  <p>₹5</p>
                </div>
                <div className="flex justify-between text-gray-400">
                  <p>GST and Restaurant Charges</p>
                  <p>₹33</p>
                </div>
                <Divider />
                <div className="flex justify-between text-gray-400">
                  <p>Total Pay</p>
                  <p>₹{cartTotal(cart.cartItems) + 33 + 5 + 21}</p>
                </div>
              </div>
            </div>
          </section>

          <Divider orientation="vertical" flexItem />

          {/* Right Section - Address Selection */}
          <section className="lg:w-[70%] flex justify-center px-5 pb-10 lg:pb-0">
            <div>
              <h1 className="text-center font-semibold text-2xl py-10">
                Choose Delivery Address
              </h1>
              <div className="flex gap-5 flex-wrap justify-center">
                {auth.user?.addresses.map((item) => (
                  <AddressCard
                    handleSelectAddress={createOrderUsingSelectedAddress}
                    item={item}
                    showButton={true}
                    key={item.id}
                  />
                ))}

                <Card className="flex flex-col justify-center items-center p-5 w-64">
                  <div className="flex space-x-5">
                    <AddLocationAltIcon />
                    <div className="space-y-5">
                      <p>Add New Address</p>
                      <Button
                        onClick={handleShowAddressForm}
                        sx={{ padding: ".75rem" }}
                        fullWidth
                        variant="contained"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Address Form */}
                {showAddressForm && (
                  <Box sx={{ marginTop: 2, width: "50%" }}>
                    <Formik
                      initialValues={initialValues}
                      // validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      <AddressAutofill accessToken={accessToken}>
                        <Form>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Field
                                name="address-line1"
                                as={TextField}
                                label="Street Address"
                                fullWidth
                                variant="outlined"
                                autoComplete="address-line1"
                                error={false}
                                helperText={
                                  <ErrorMessage name="address-line1">
                                    {(msg) => (
                                      <span className="text-red-600">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    padding: "12px", // Increase padding for all fields
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Field
                                name="state"
                                as={TextField}
                                label="State"
                                fullWidth
                                variant="outlined"
                                autoComplete="address-level1"
                                error={false}
                                helperText={
                                  <ErrorMessage name="state">
                                    {(msg) => (
                                      <span className="text-red-600">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    padding: "12px", // Increase padding for all fields
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Field
                                name="pincode"
                                as={TextField}
                                label="Pincode"
                                fullWidth
                                variant="outlined"
                                autoComplete="postal-code"
                                error={false}
                                helperText={
                                  <ErrorMessage name="pincode">
                                    {(msg) => (
                                      <span className="text-red-600">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    padding: "12px", // Increase padding for all fields
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Field
                                name="city"
                                as={TextField}
                                label="City"
                                fullWidth
                                variant="outlined"
                                autoComplete="address-level2"
                                error={false}
                                helperText={
                                  <ErrorMessage name="city">
                                    {(msg) => (
                                      <span className="text-red-600">
                                        {msg}
                                      </span>
                                    )}
                                  </ErrorMessage>
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    padding: "12px", // Increase padding for all fields
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                              >
                                Deliver Here
                              </Button>
                            </Grid>
                          </Grid>
                        </Form>
                      </AddressAutofill>
                    </Formik>
                  </Box>
                )}
              </div>
            </div>
          </section>
        </main>
      ) : (
        <div className="flex h-[90vh] justify-center items-center">
          <div className="text-center space-y-5">
            <RemoveShoppingCartIcon sx={{ width: "10rem", height: "10rem" }} />
            <p className="font-bold text-3xl">Your Cart Is Empty</p>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        severity="success"
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Please Add Items Only From One Restaurant At a Time"
      />
    </Fragment>
  );
};

export default Cart;

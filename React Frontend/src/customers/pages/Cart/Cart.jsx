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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
  Paper,
} from "@mui/material";

import StripeIcon from "../../../assets/stripe-icon.png";
import RazorpayIcon from "../../../assets/razorpay-icon.png";

import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AddressAutofill } from "@mapbox/search-js-react";
import { createOrder } from "../../../State/Customers/Orders/Action";
import { findCart } from "../../../State/Customers/Cart/cart.action";
import { isValid } from "../../util/ValidToOrder";
import { cartTotal } from "./totalPay";
import AddressCard from "../../components/Address/AddressCard";
import CartItemCard from "../../components/CartItem/CartItemCard";

import { api } from "../../../config/api";
import { AppConstants } from "../../../config/constant";

// Initial Values and Validation Schema
const initialValues = {
  address_line1: "",
  state: "",
  pincode: "",
  city: "",
  recipientName: "",
  recipientPhone: "",
  paymentMethod: "stripe",
};

// const validationSchema = Yup.object().shape({
//   "address-line1": Yup.string().required("Street Address is required"),
//   state: Yup.string().required("State is required"),
//   pincode: Yup.string()
//     .required("Pincode is required")
//     .matches(/^\d{6}$/, "Pincode must be 6 digits"),
//   city: Yup.string().required("City is required"),
//   recipientName: Yup.string().required("Recipient name is required"),
//   recipientPhone: Yup.string()
//     .required("Phone number is required")
//     .matches(/^\d{10}$/, "Phone number must be 10 digits"),
//   paymentMethod: Yup.string().required("Payment method is required"),
// });

const Cart = () => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showRecipientForm, setShowRecipientForm] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState({
    recipientName: "",
    recipientPhone: "",
    paymentMethod: "razorpay",
  });
  const dispatch = useDispatch();
  const { cart, auth } = useSelector((store) => store);

  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    dispatch(findCart(localStorage.getItem("jwt")));
  }, [dispatch]);

  const handleShowAddressForm = () => {
    setShowAddressForm(!showAddressForm);
    setSelectedAddress(null);
    setShowRecipientForm(false);
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleAddressSubmit = async (values, { resetForm }) => {
    const addressData = {
      fullName: auth.user?.fullName,
      streetAddress: values["address-line1"],
      city: values.city,
      state: values.state,
      postalCode: values.pincode,
      country: "India",
    };

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      values["address-line1"]
    )}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const geoLocationData = await response.json();

      if (geoLocationData.features && geoLocationData.features.length > 0) {
        const location = geoLocationData.features[0].center;
        addressData.latitude = location[1];
        addressData.longitude = location[0];
        setSelectedAddress(addressData);
        setShowRecipientForm(true);
        setShowAddressForm(false);
      } else {
        alert("Unable to find location. Please try again.");
      }
    } catch (error) {
      alert("Error occurred while finding location: " + error.message);
    }
  };

  const handleAddressSelect = (deliveryAddress) => {
    setSelectedAddress(deliveryAddress);
    setShowRecipientForm(true);
    setShowAddressForm(false);
  };

  const handleRecipientSubmit = (values) => {
    setRecipientDetails({
      recipientName: values.recipientName,
      recipientPhone: values.recipientPhone,
      paymentMethod: values.paymentMethod,
    });
  };

  // Razorpay Order Creation API Call
  const createRazorpayOrder = async (orderData) => {
    try {
      const { data } = await api.post("/api/order/razorpay", orderData.order, {
        headers: {
          Authorization: `Bearer ${orderData.token}`,
        },
      });

      // const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
    }
  };

  const handleProceedToPay = async () => {
    if (
      !selectedAddress ||
      !recipientDetails.recipientName ||
      !recipientDetails.recipientPhone
    ) {
      alert(
        "Please complete all required information before proceeding to payment."
      );
      return;
    }

    const orderData = {
      token: localStorage.getItem("jwt"),
      order: {
        restaurantId: cart.cartItems[0].food?.restaurant?.id,
        deliveryAddress: {
          ...selectedAddress,
          // recipientName: recipientDetails.recipientName,
          // recipientPhone: recipientDetails.recipientPhone,
        },
        paymentMethod: recipientDetails.paymentMethod,
      },
    };

    if (isValid(cart.cartItems)) {
      if (recipientDetails.paymentMethod === "stripe") {
        // Redirect to Stripe payment
        dispatch(createOrder(orderData));
      } else if (recipientDetails.paymentMethod === "razorpay") {
        // Handle Razorpay integration here
        //create razorpay order
        const razorpayResponse = await createRazorpayOrder(orderData);
        console.log("razorpay order response", razorpayResponse);
        const options = {
          key: AppConstants.RAZORPAY_KEY_ID,
          amount: razorpayResponse.amount,
          currency: razorpayResponse.currency,
          order_id: razorpayResponse.id,
          name: "RMeals",
          description: "Order payment",
          handler: async function (response) {
            // await verifyPaymentHandler(response, savedData);
            window.location.href = `http://localhost:3000/payment/success/${razorpayResponse.id}`;
          },
          prefill: {
            name: recipientDetails.recipientName,
            contact: recipientDetails.recipientPhone,
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: async () => {
              // await deleteOrderOnFailure(savedData.orderId);
              // toast.error("Payment cancelled");
              window.alert("Payment Cancelled");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on("payment.failed", async (response) => {
          // await deleteOrderOnFailure(savedData.orderId);
          // toast.error("Payment failed");
          window.alert("Payment Failed");
          console.error(response.error.description);
        });
        // alert("Razorpay integration coming soon!");
      }
    } else {
      setOpenSnackbar(true);
    }
  };

  const totalAmount = cartTotal(cart.cartItems) + 33 + 5 + 21;

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
                <div className="flex justify-between text-white font-semibold">
                  <p>Total Pay</p>
                  <p>₹{totalAmount}</p>
                </div>
              </div>
            </div>
          </section>

          <Divider orientation="vertical" flexItem />

          {/* Right Section - Checkout Process */}
          <section className="lg:w-[70%] flex justify-center px-5 pb-10 lg:pb-0">
            <div className="w-full max-w-4xl">
              <h1 className="text-center font-semibold text-2xl py-10">
                Checkout Process
              </h1>

              {/* Step 1: Address Selection */}
              <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AddLocationAltIcon sx={{ marginRight: 1 }} />
                  Step 1: Delivery Address
                </Typography>

                {selectedAddress ? (
                  <Box
                    sx={{
                      backgroundColor: "#f0f9ff",
                      padding: 2,
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: "#065f46" }}>
                      ✓ Address Selected: {selectedAddress.streetAddress},{" "}
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.postalCode}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedAddress(null);
                        setShowRecipientForm(false);
                      }}
                      sx={{ marginTop: 1 }}
                    >
                      Change Address
                    </Button>
                  </Box>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        flexWrap: "wrap",
                        justifyContent: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      {auth.user?.addresses.map((item) => (
                        <AddressCard
                          handleSelectAddress={handleAddressSelect}
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
                    </div>

                    {/* Address Form */}
                    {showAddressForm && (
                      <Box sx={{ marginTop: 2 }}>
                        <Formik
                          initialValues={initialValues}
                          //validationSchema={validationSchema}
                          onSubmit={handleAddressSubmit}
                        >
                          <AddressAutofill accessToken={accessToken}>
                            <Form
                            //initialValues={initialValues}
                            // validationSchema={validationSchema}
                            // onSubmit={handleAddressSubmit}
                            >
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
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                  >
                                    Use This Address
                                  </Button>
                                </Grid>
                              </Grid>
                            </Form>
                          </AddressAutofill>
                        </Formik>
                      </Box>
                    )}
                  </>
                )}
              </Paper>

              {/* Step 2: Recipient Details */}
              {showRecipientForm && (
                <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      marginBottom: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <PersonIcon sx={{ marginRight: 1 }} />
                    Step 2: Recipient Details & Payment Method
                  </Typography>

                  <Formik
                    initialValues={{
                      recipientName:
                        recipientDetails.recipientName ||
                        auth.user?.fullName ||
                        "",
                      recipientPhone: recipientDetails.recipientPhone || "",
                      paymentMethod: recipientDetails.paymentMethod || "stripe",
                    }}
                    validationSchema={Yup.object({
                      recipientName: Yup.string().required(
                        "Recipient name is required"
                      ),
                      recipientPhone: Yup.string()
                        .required("Phone number is required")
                        .matches(/^\d{10}$/, "Phone number must be 10 digits"),
                      paymentMethod: Yup.string().required(
                        "Payment method is required"
                      ),
                    })}
                    onSubmit={handleRecipientSubmit}
                    enableReinitialize
                  >
                    {({ values, setFieldValue }) => (
                      <Form>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Field
                              name="recipientName"
                              as={TextField}
                              label="Recipient Name"
                              fullWidth
                              variant="outlined"
                              helperText={
                                <ErrorMessage name="recipientName">
                                  {(msg) => (
                                    <span className="text-red-600">{msg}</span>
                                  )}
                                </ErrorMessage>
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Field
                              name="recipientPhone"
                              as={TextField}
                              label="Phone Number"
                              fullWidth
                              variant="outlined"
                              helperText={
                                <ErrorMessage name="recipientPhone">
                                  {(msg) => (
                                    <span className="text-red-600">{msg}</span>
                                  )}
                                </ErrorMessage>
                              }
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel
                                component="legend"
                                sx={{ marginBottom: 2 }}
                              >
                                <PaymentIcon sx={{ marginRight: 1 }} />
                                Select Payment Method
                              </FormLabel>
                              <RadioGroup
                                name="paymentMethod"
                                value={values.paymentMethod}
                                onChange={(e) =>
                                  setFieldValue("paymentMethod", e.target.value)
                                }
                                row
                              >
                                <FormControlLabel
                                  value="stripe"
                                  control={<Radio />}
                                  label={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <img
                                        src={StripeIcon}
                                        alt="Stripe"
                                        style={{
                                          width: "48px",
                                          height: "36px",
                                          marginRight: "8px",
                                          color: "white",
                                          backgroundColor: "white",
                                        }}
                                      />
                                      Stripe Pay
                                    </Box>
                                  }
                                />
                                <FormControlLabel
                                  value="razorpay"
                                  control={<Radio />}
                                  label={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <img
                                        src={RazorpayIcon}
                                        alt="Razorpay"
                                        style={{
                                          width: "48px",
                                          height: "36px",
                                          marginRight: "8px",
                                          color: "white",
                                          backgroundColor: "white",
                                        }}
                                      />
                                      Razorpay
                                    </Box>
                                  }
                                />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              type="submit"
                              variant="outlined"
                              color="primary"
                              size="large"
                            >
                              Confirm Details
                            </Button>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                </Paper>
              )}

              {/* Step 3: Proceed to Payment */}
              {selectedAddress &&
                recipientDetails.recipientName &&
                recipientDetails.recipientPhone && (
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 3,
                      marginBottom: 4,
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        marginBottom: 3,
                        textAlign: "center",
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      Order Summary
                    </Typography>

                    <Box sx={{ marginBottom: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#424242", marginBottom: 1 }}
                      >
                        <strong>Delivering to:</strong>{" "}
                        {recipientDetails.recipientName} (
                        {recipientDetails.recipientPhone})
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#424242", marginBottom: 1 }}
                      >
                        <strong>Address:</strong>{" "}
                        {selectedAddress.streetAddress}, {selectedAddress.city}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#424242" }}>
                        <strong>Payment Method:</strong>{" "}
                        {recipientDetails.paymentMethod === "stripe"
                          ? "Stripe Pay"
                          : "Razorpay"}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        sx={{
                          marginBottom: 3,
                          fontWeight: "bold",
                          color: "green",
                        }}
                      >
                        Total: ₹{totalAmount}
                      </Typography>
                      <Button
                        onClick={handleProceedToPay}
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{
                          paddingX: 4,
                          paddingY: 1.5,
                          background:
                            "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                          borderRadius: "25px",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          marginBottom: 2,
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #1976D2 30%, #1BA3D1 90%)",
                          },
                        }}
                      >
                        Proceed to Pay ₹{totalAmount}
                      </Button>
                    </Box>
                  </Paper>
                )}
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

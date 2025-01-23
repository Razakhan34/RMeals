import React, { useState } from "react";
import { useFormik } from "formik";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useDispatch } from "react-redux";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { createRestaurant } from "../../State/Customers/Restaurant/restaurant.action";
import CloseIcon from "@mui/icons-material/Close";
import { uploadToCloudinary } from "../utils/UploadToCloudnary";
import { CircularProgress, IconButton } from "@mui/material";
import { AddressAutofill } from "@mapbox/search-js-react";
const initialValues = {
  name: "",
  description: "",
  cuisineType: "",
  address_line1: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  email: "",
  mobile: "",
  twitter: "",
  instagram: "",
  openingHours: "Mon-Sun: 9:00 AM - 9:00 PM",
  images: [],
};

const CreateRestaurantForm = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("jwt");
  const [uploadImage, setUploadingImage] = useState("");

  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  const handleSubmit = async (values) => {
    const data = {
      name: values.name,
      description: values.description,
      cuisineType: values.cuisineType,
      address: {
        streetAddress: values["address-line1 address-search"],
        city: values.city,
        state: values.state,
        postalCode: values.zip,
        country: values.country,
      },
      contactInformation: {
        email: values.email,
        mobile: values.mobile,
        twitter: values.twitter,
        instagram: values.instagram,
      },
      openingHours: values.openingHours,
      images: values.images,
    };

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      values["address-line1 address-search"]
    )}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const geoLocationData = await response.json();

      if (geoLocationData.features && geoLocationData.features.length > 0) {
        const location = geoLocationData.features[0].center; // [longitude, latitude]
        data.address.latitude = location[1];
        data.address.longitude = location[0];
      } else {
        alert("Some Error Occured , try again...");
      }
    } catch (error) {
      alert("Some Error Occured , try again..." + error);
    }

    dispatch(createRestaurant({ data, token }));
    // console.log(data);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setUploadingImage(true);
    const image = await uploadToCloudinary(file);
    formik.setFieldValue("images", [...formik.values.images, image]);
    setUploadingImage(false);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formik.values.images];
    updatedImages.splice(index, 1);
    formik.setFieldValue("images", updatedImages);
  };

  return (
    <div className="py-10 px-5 lg:flex items-center justify-center min-h-screen">
      <div className="lg:max-w-4xl w-full">
        <h1 className="font-bold text-2xl text-center py-2">
          Add New Restaurant
        </h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Image Upload */}
            <div className="flex flex-wrap gap-5">
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="fileInput" className="relative">
                <span className="w-24 h-24 cursor-pointer flex items-center justify-center p-3 border rounded-md border-gray-600">
                  <AddPhotoAlternateIcon className="text-white" />
                </span>
                {uploadImage && (
                  <div className="absolute inset-0 w-24 h-24 flex justify-center items-center">
                    <CircularProgress />
                  </div>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {formik.values.images.map((image, index) => (
                  <div className="relative" key={index}>
                    <img
                      className="w-24 h-24 object-cover"
                      src={image}
                      alt={`ProductImage ${index + 1}`}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        outline: "none",
                      }}
                    >
                      <CloseIcon sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurant Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.name}
              />
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextField
                fullWidth
                id="cuisineType"
                name="cuisineType"
                label="Cuisine Type"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.cuisineType}
              />
              <TextField
                fullWidth
                id="openingHours"
                name="openingHours"
                label="Opening Hours"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.openingHours}
              />
            </div>

            {/* AddressAutofill */}
            <AddressAutofill accessToken={accessToken}>
              <div className="grid grid-cols-1 gap-6">
                <TextField
                  fullWidth
                  id="streetAddress"
                  name="address-line1"
                  label="Street Address"
                  variant="outlined"
                  InputProps={{ style: { padding: "10px" } }}
                  autoComplete="address-line1"
                  onChange={formik.handleChange}
                  value={formik.values["address-line1 address-search"]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  variant="outlined"
                  InputProps={{ style: { padding: "10px" } }}
                  autoComplete="address-level2"
                  onChange={formik.handleChange}
                  value={formik.values.city}
                />
                <TextField
                  fullWidth
                  id="state"
                  name="state"
                  label="State/Province"
                  variant="outlined"
                  InputProps={{ style: { padding: "10px" } }}
                  autoComplete="address-level1"
                  onChange={formik.handleChange}
                  value={formik.values.state}
                />
                <TextField
                  fullWidth
                  id="zip"
                  name="zip"
                  label="Postal Code"
                  variant="outlined"
                  InputProps={{ style: { padding: "10px" } }}
                  autoComplete="postal-code"
                  onChange={formik.handleChange}
                  value={formik.values.zip}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 mt-4">
                <TextField
                  fullWidth
                  id="country"
                  name="country"
                  label="Country"
                  variant="outlined"
                  InputProps={{ style: { padding: "10px" } }}
                  autoComplete="country-name"
                  onChange={formik.handleChange}
                  value={formik.values.country}
                />
              </div>
            </AddressAutofill>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0">
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              <TextField
                fullWidth
                id="mobile"
                name="mobile"
                label="Mobile"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.mobile}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextField
                fullWidth
                id="twitter"
                name="twitter"
                label="Twitter"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.twitter}
              />
              <TextField
                fullWidth
                id="instagram"
                name="instagram"
                label="Instagram"
                variant="outlined"
                InputProps={{ style: { padding: "10px" } }}
                onChange={formik.handleChange}
                value={formik.values.instagram}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <Button variant="contained" color="primary" type="submit">
              Create Restaurant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurantForm;

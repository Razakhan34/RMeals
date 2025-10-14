import React from "react";
import { Navigate, redirect, Route, Routes } from "react-router-dom";
import HomePage from "../customers/pages/Home/HomePage";
import Navbar from "../customers/components/Navbar/Navbar";
import Cart from "../customers/pages/Cart/Cart";
import Profile from "../customers/pages/Profile/Profile";
import PaymentSuccess from "../customers/pages/PaymentSuccess/PaymentSuccess";
import Search from "../customers/components/Search/Search";
import CreateRestaurantForm from "../Admin/AddRestaurants/CreateRestaurantForm";
import Restaurant from "../customers/pages/Restaurant/Restaurant";
import PasswordChangeSuccess from "../customers/pages/Auth/PasswordChangeSuccess";
import NotFound from "../customers/pages/NotFound/NotFound";
import TrackOrder from "../customers/pages/Orders/TrackOrder";
import ProtectedRoute from "./ProtectedRoutes";
import { useSelector } from "react-redux";
import PaymentFailed from "../customers/pages/PaymentFailed/PaymentFailed";
import DeliveryBoyApp from "../customers/components/DeliveryTracking/DeliveryBoyApp";
import CustomerTrackOrder from "../customers/components/DeliveryTracking/CustomerTrackOrder";

const CustomerRoutes = () => {
  const { auth } = useSelector((store) => store);
  if (
    auth?.user?.role === "ROLE_ADMIN" ||
    auth?.user?.role === "ROLE_RESTAURANT_OWNER"
  ) {
    return <Navigate to="/admin/restaurant/" replace />;
  }
  return (
    <div className="relative">
      <nav className="sticky top-0 z-50">
        <Navbar />
      </nav>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/account/:register" element={<HomePage />} />
        <Route
          exact
          path="/restaurant/:city/:title/:id"
          element={<ProtectedRoute element={<Restaurant />} />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment/success/:id" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route
          path="/my-profile/*"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/track-order/:id"
          element={<ProtectedRoute element={<TrackOrder />} />}
        />
        <Route path="/search" element={<Search />} />
        <Route
          path="/admin/add-restaurant"
          element={<CreateRestaurantForm />}
        />
        <Route
          exact
          path="/password-change-success"
          element={<PasswordChangeSuccess />}
        />
        <Route path="/delivery/track/:orderId" element={<DeliveryBoyApp />} />
        <Route
          path="/customer/track/:orderId"
          element={<CustomerTrackOrder />}
        />
        <Route exact path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default CustomerRoutes;

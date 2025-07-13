import { Card, Chip } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const OrderCard = ({ order, status, orderId }) => {
  console.log(order);
  return (
    <Card className="flex justify-between items-center p-5">
      <div className="flex items-center space-x-5">
        <img className="h-16 w-16" src={order.food.images[0]} alt="" />
        <div>
          <p>{order.food.name}</p>
          <p className="text-gray-400">₹{order.food.price}</p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="mr-10">
          <Chip
            sx={{
              color: "white !important",
              fontWeight: "bold",
              textAlign: "center",
            }}
            label={status}
            size="small"
            color={
              status === "PENDING"
                ? "info"
                : status === "DELIVERED"
                ? "success"
                : "secondary"
            }
            className="text-white"
          />
        </div>
        {/* Styled Track Order Link */}

        <Link
          to={`/track-order/${orderId}`}
          className="text-blue-500 font-semibold underline hover:text-blue-700 transition duration-300"
        >
          Track order
        </Link>
      </div>
    </Card>
  );
};

export default OrderCard;

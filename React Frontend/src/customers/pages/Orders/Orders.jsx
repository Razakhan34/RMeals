import React, { useEffect } from "react";
import OrderCard from "../../components/Order/OrderCard";
import { useDispatch, useSelector } from "react-redux";
import { getUsersOrders } from "../../../State/Customers/Orders/Action";

const Orders = () => {
  const { order, auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  console.log("Orders");
  console.log(order.orders);

  useEffect(() => {
    dispatch(getUsersOrders(jwt));
  }, [auth.jwt, dispatch, jwt]);
  return (
    <div className="flex items-center flex-col">
      <h1 className="text-xl text-center py-7 font-semibold">My Orders</h1>
      <div className="space-y-5 w-full lg:w-1/2">
        {[...order.orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sorting in descending order
          .map((order) =>
            order.items.map((item) => (
              <OrderCard
                key={item.id} // Key for optimization
                status={order.orderStatus}
                order={item}
                orderId={order.id}
              />
            ))
          )}
      </div>
    </div>
  );
};

export default Orders;

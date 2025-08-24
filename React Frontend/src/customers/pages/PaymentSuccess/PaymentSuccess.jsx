import React, { useEffect } from "react";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HomeIcon from "@mui/icons-material/Home";
import { Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCartAction } from "../../../State/Customers/Cart/cart.action";

// Custom green palette
const primaryColor = "#40916C";
const darkerColor = "#2D6A4F";
const gradientStart = "#52B788";
const gradientEnd = "#1B4332";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    dispatch(clearCartAction(jwt));
  }, [jwt, dispatch]);

  const navigateToHome = () => navigate("/");

  return (
    <div className="min-h-screen px-5" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="flex flex-col items-center justify-center h-[90vh]">
        <Paper
          elevation={3}
          className="box w-full lg:w-1/3 flex flex-col items-center rounded-md"
          sx={{
            padding: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #e9f5f0 0%, #f0fff4 100%)",
          }}
        >
          {/* Success Icon */}
          <Box sx={{ marginBottom: 2 }}>
            <TaskAltIcon sx={{ fontSize: "5rem", color: primaryColor }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              paddingY: 2,
              fontWeight: "bold",
              color: darkerColor,
              textAlign: "center",
            }}
          >
            Order Successful 🎉
          </Typography>

          {/* Main Message */}
          <Typography
            variant="body1"
            sx={{
              paddingY: 2,
              textAlign: "center",
              color: "#555",
              lineHeight: 1.6,
              maxWidth: "400px",
            }}
          >
            Thank you for choosing our restaurant! We truly appreciate your
            order and can’t wait to serve you again.
          </Typography>

          {/* Friendly Note */}
          <Typography
            variant="body2"
            sx={{
              paddingY: 1,
              textAlign: "center",
              color: "#777",
              fontSize: "1rem",
              fontStyle: "italic",
            }}
          >
            Have a great day ahead! 🌿
          </Typography>

          {/* Action Button */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginTop: 3,
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={navigateToHome}
              sx={{
                paddingX: 3,
                paddingY: 1.2,
                borderRadius: "25px",
                fontWeight: "bold",
                background: `linear-gradient(45deg, ${gradientStart} 30%, ${gradientEnd} 90%)`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${primaryColor} 30%, ${darkerColor} 90%)`,
                },
                minWidth: "180px",
              }}
            >
              Go to Home
            </Button>
          </Box>
        </Paper>

        {/* Additional Info Card */}
        <Paper
          elevation={1}
          sx={{
            marginTop: 3,
            padding: 2,
            borderRadius: 2,
            backgroundColor: "#e6f4ec",
            maxWidth: "500px",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: primaryColor,
              fontWeight: "medium",
            }}
          >
            💡 Tip: You can track your order from your profile dashboard.
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default PaymentSuccess;

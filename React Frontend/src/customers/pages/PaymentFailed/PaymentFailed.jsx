import { useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import { Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

// Black-gray theme with subtle teal/blue accent
const primaryColor = "#3A506B"; // Muted blue-gray
const darkerColor = "#1C2541"; // Dark navy-gray
const lighterColor = "#5BC0BE"; // Teal accent
const gradientStart = "#3A506B";
const gradientEnd = "#0B132B"; // Deep gray/black

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const reason =
    searchParams.get("reason") || location.state?.reason || "unknown";

  const navigateToCart = () => navigate("/cart");
  const navigateToHome = () => navigate("/");

  const getFailureMessage = (reason) => {
    switch (reason.toLowerCase()) {
      case "cancelled":
      case "user_cancelled":
        return {
          title: "Payment Cancelled",
          message:
            "You cancelled the payment process. Your order has not been placed.",
          icon: (
            <ErrorOutlineIcon sx={{ fontSize: "5rem", color: lighterColor }} />
          ),
        };
      case "failed":
      case "payment_failed":
        return {
          title: "Payment Failed",
          message:
            "Your payment could not be processed. Please check your payment details and try again.",
          icon: <PaymentIcon sx={{ fontSize: "5rem", color: primaryColor }} />,
        };
      case "timeout":
        return {
          title: "Payment Timeout",
          message: "The payment process timed out. Please try again.",
          icon: (
            <ErrorOutlineIcon sx={{ fontSize: "5rem", color: primaryColor }} />
          ),
        };
      case "network_error":
        return {
          title: "Network Error",
          message:
            "There was a network issue during payment. Please check your connection and try again.",
          icon: (
            <ErrorOutlineIcon sx={{ fontSize: "5rem", color: darkerColor }} />
          ),
        };
      default:
        return {
          title: "Something Went Wrong",
          message:
            "An unexpected error occurred during payment. Please try again or contact support.",
          icon: (
            <ErrorOutlineIcon sx={{ fontSize: "5rem", color: darkerColor }} />
          ),
        };
    }
  };

  const failureData = getFailureMessage(reason);

  useEffect(() => {
    console.log("Payment failed with reason:", reason);
  }, [reason]);

  return (
    <div className="min-h-screen px-5" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="flex flex-col items-center justify-center h-[90vh]">
        <Paper
          elevation={3}
          className="box w-full lg:w-1/3 flex flex-col items-center rounded-md"
          sx={{
            padding: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", // light gray bg
          }}
        >
          {/* Error Icon */}
          <Box sx={{ marginBottom: 2 }}>{failureData.icon}</Box>

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
            {failureData.title}
          </Typography>

          {/* Main Message */}
          <Typography
            variant="body1"
            sx={{
              paddingY: 2,
              textAlign: "center",
              color: "#444",
              lineHeight: 1.6,
              maxWidth: "400px",
            }}
          >
            {failureData.message}
          </Typography>

          {/* Additional Info */}
          <Typography
            variant="body2"
            sx={{
              paddingY: 1,
              textAlign: "center",
              color: "#666",
              fontSize: "0.9rem",
            }}
          >
            Don't worry, no amount has been deducted from your account.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              marginTop: 3,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {/* Retry Payment Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={navigateToCart}
              sx={{
                paddingX: 3,
                paddingY: 1.2,
                borderRadius: "25px",
                fontWeight: "bold",
                background: `linear-gradient(45deg, ${gradientStart} 30%, ${gradientEnd} 90%)`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${lighterColor} 30%, ${darkerColor} 90%)`,
                },
                minWidth: "160px",
              }}
            >
              Retry Payment
            </Button>

            {/* Go to Home Button */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              onClick={navigateToHome}
              sx={{
                paddingX: 3,
                paddingY: 1.2,
                borderRadius: "25px",
                fontWeight: "bold",
                borderColor: primaryColor,
                color: primaryColor,
                "&:hover": {
                  borderColor: darkerColor,
                  color: darkerColor,
                  backgroundColor: "rgba(58,80,107,0.08)",
                },
                minWidth: "160px",
              }}
            >
              Go to Home
            </Button>
          </Box>

          {/* Help Text */}
          <Typography
            variant="caption"
            sx={{
              marginTop: 3,
              textAlign: "center",
              color: "#555",
              fontSize: "0.8rem",
            }}
          >
            Need help? Contact our support team for assistance.
          </Typography>
        </Paper>

        {/* Additional Info Card */}
        <Paper
          elevation={1}
          sx={{
            marginTop: 3,
            padding: 2,
            borderRadius: 2,
            backgroundColor: "#f1f5f9",
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
            💡 Tip: Make sure you have sufficient balance and your payment
            method is valid before retrying.
          </Typography>
        </Paper>
      </div>
    </div>
  );
};

export default PaymentFailed;

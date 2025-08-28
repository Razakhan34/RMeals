import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Button,
} from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

const NearbyRestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <Card className="m-3 w-full md:w-[40rem]">
      {/* Header with Restaurant Name + Navigate Button */}
      <CardHeader
        className="text-sm"
        action={
          <IconButton
            onClick={() =>
              navigate(
                `/restaurant/${restaurant.address.city}/${restaurant.name}/${restaurant.id}`
              )
            }
          >
            <EastIcon />
          </IconButton>
        }
        title={<p className="text-lg font-semibold">{restaurant.name}</p>}
        subheader={
          <p className="text-gray-500 text-sm">
            {restaurant.cuisineType} • {restaurant.address.city}
          </p>
        }
      />

      {/* Body */}
      <CardContent>
        <div className="flex justify-between gap-4">
          {/* Left Info */}
          <div className="w-[70%] space-y-2">
            <p className="text-gray-700 text-sm">{restaurant.description}</p>
            <div className="flex items-center gap-2 text-yellow-500">
              <StarIcon fontSize="small" />
              <span className="text-sm">
                {restaurant.numRating || 0} Ratings
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              ⏰ {restaurant.openingHours}
            </p>
            <p className="text-gray-500 text-sm">
              📍 {restaurant.address.streetAddress}, {restaurant.address.city}
            </p>
          </div>

          {/* Right Image */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <img
              className="w-[6rem] h-[6rem] rounded-md object-cover"
              src={restaurant.images[0]}
              alt={restaurant.name}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                navigate(
                  `/restaurant/${restaurant.address.city}/${restaurant.name}/${restaurant.id}`
                )
              }
            >
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyRestaurantCard;

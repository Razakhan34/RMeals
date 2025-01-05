import { createTheme } from "@mui/material";

// Green color:- --nyanza: #d8f3dcff;
// --celadon: #b7e4c7ff;
// --celadon-2: #95d5b2ff;
// --mint: #74c69dff;
// --mint-2: #52b788ff;
// --sea-green: #40916cff;
// --dartmouth-green: #2d6a4fff;
// --brunswick-green: #1b4332ff;
// --dark-green: #081c15ff;

// Orange Color:-
// --pumpkin: #ff6d00ff;
// --safety-orange: #ff7900ff;
// --ut-orange: #ff8500ff;
// --princeton-orange: #ff9100ff;
// --orange-peel: #ff9e00ff;
// --russian-violet: #240046ff;
// --persian-indigo: #3c096cff;
// --tekhelet: #5a189aff;
// --french-violet: #7b2cbfff;
// --amethyst: #9d4eddff;
// #212529
const darkTheme = createTheme({
  palette: {
    mode: "dark", // This sets the theme to dark mode
    primary: {
      main: "#40916cff", // Customize the primary color to your preference
    },
    secondary: {
      // main: "#5A20CB", // Customize the secondary color to your preference
      main: "#3c096cff", // Customize the secondary color to your preference
    },
    black: {
      main: "#242B2E",
    },
    background: {
      main: "#000000",
      default: "#0D0D0D",
      paper: "#0D0D0D",
    },
    textColor: {
      main: "#111111",
    },
  },
});

export default darkTheme;

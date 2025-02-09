import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 py-10 flex flex-col justify-between min-h-[250px]">
      <div className="container mx-auto px-5 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Brand Section */}
        <div>
          <h2 className="text-4xl font-bold text-white">RMeals</h2>
          <p className="text-gray-400 mt-2 text-lg">
            Taste the Convenience: Food, Fast and Delivered.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-2xl font-semibold text-white">Quick Links</h3>
          <ul className="mt-2 space-y-2 text-lg">
            <li>
              <Link to="/" className="hover:text-[#40916c] transition-all">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-[#40916c] transition-all">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#40916c] transition-all">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-[#40916c] transition-all"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-2xl font-semibold text-white">Follow Us</h3>
          <div className="flex justify-center md:justify-start space-x-6 mt-3">
            <Link
              to="#"
              className="text-3xl transition-all hover:text-[#40916c]"
            >
              <Facebook fontSize="inherit" />
            </Link>
            <Link
              to="#"
              className="text-3xl transition-all hover:text-[#40916c]"
            >
              <Instagram fontSize="inherit" />
            </Link>
            <Link
              to="#"
              className="text-3xl transition-all hover:text-[#40916c]"
            >
              <Twitter fontSize="inherit" />
            </Link>
            <Link
              to="#"
              className="text-3xl transition-all hover:text-[#40916c]"
            >
              <LinkedIn fontSize="inherit" />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-700 mt-8 pt-5 text-center text-gray-500 text-lg">
        © {new Date().getFullYear()} RMeals. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

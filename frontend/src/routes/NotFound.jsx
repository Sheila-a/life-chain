import { Link } from "react-router-dom";
import { N404 } from "../assets";
import { motion } from "framer-motion";
import { Button } from "../components";

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen pb-10 bgg-[#030B1A] ntext-gray-100 px-4"
    >
      <img
        src={N404}
        alt="404 Illustration"
        className="w-2/3 md:w-1/2 lg:w-1/3 mb-8"
      />
      <h1 className="text-4xl text-sec-100 font-bold mb-4">
        Oops! Page Not Found
      </h1>
      <p className="text-lg text-sec-300 mb-6 text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button
        href="/dashboard"
        className={`w-[200px] flex items-center justify-center`}
      >
        Go to Home
      </Button>
    </motion.div>
  );
};

export default NotFound;

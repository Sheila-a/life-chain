/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { createHospital, loginUser } from "../services/auth/AuthService";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { LogoF } from "../assets";
import { Eye, EyeClosed, MapPin, Navigation } from "lucide-react";

function Button({ children, className = "", variant = "default", ...props }) {
  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none rounded-2xl";

  const variants = {
    default: "bg-emerald-500 hover:bg-emerald-600 text-white",
    outline:
      "border border-emerald-300 text-emerald-200 hover:bg-emerald-500 hover:text-white",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Input({ label, type, ...props }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="text-emerald-300 text-sm">{label}</label>
      <div className="relative">
        <input
          className="p-4 w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 focus:border-emerald-400 outline-none"
          type={type === "password" && isPasswordVisible ? "text" : type}
          {...props}
        />
        {type === "password" && (
          <span
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white"
          >
            {isPasswordVisible ? <Eye /> : <EyeClosed />}
          </span>
        )}
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-8">
      {children}
    </div>
  );
}

const HospitalRegister = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [mode, setMode] = useState("auto");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingLocation(false);
        toast.success("Location captured!");
      },
      (error) => {
        setGettingLocation(false);
        toast.error("Unable to fetch location");
      },
    );
  };

  const handleLogin = async () => {
    const req = { name, email, password, lat: latitude, long: longitude };

    if (!name) {
      toast.error("Enter hospital name");
      return;
    }

    if (!email) {
      toast.error("Enter email");
      return;
    }

    if (!password) {
      toast.error("Enter password");
      return;
    }

    if (!latitude || !longitude) {
      toast.error("Please capture hospital location");
      return;
    }

    const loadingId = toast.loading("Creating hospital...");

    try {
      const res = await createHospital(req);
      console.log(res);

      if (res) {
        toast.dismiss(loadingId);
        toast.success("Account created successfully!");
        navigate("/portal");
      }
    } catch (error) {
      console.log(error);

      toast.error(error?.message);
      toast.dismiss(loadingId);
      // toast.error("An error occurred. Try again!");
    }
  };
  console.log(latitude, longitude);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <Card>
          <Link to={`/`}>
            <img src={LogoF} alt="" className="w-44 -ml-4" />
          </Link>{" "}
          <h2 className="text-3xl font-bold mb-6">Register Hospital</h2>
          <div className="space-y-6">
            <Input
              label="Hospital Name"
              placeholder="City General Hospital"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="admin@citygeneral.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="StrongPass123!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex bg-white/10 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === "auto"
                    ? "bg-emerald-500 text-white"
                    : "text-emerald-200"
                }`}
              >
                <Navigation className="inline mr-2 w-4 h-4" />
                Auto
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === "manual"
                    ? "bg-emerald-500 text-white"
                    : "text-emerald-200"
                }`}
              >
                <MapPin className="inline mr-2 w-4 h-4" />
                Manual
              </button>
            </div>

            {mode === "auto" && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3"
                  onClick={handleGetLocation}
                >
                  {gettingLocation
                    ? "Fetching location..."
                    : "Use Current Location"}
                </Button>

                {latitude && longitude && (
                  <div className="text-sm text-emerald-200 bg-emerald-500/10 p-3 rounded-xl">
                    📍 Lat: {latitude}, Lng: {longitude}
                  </div>
                )}
              </div>
            )}

            {mode === "manual" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  type="number"
                  placeholder="e.g 9.0765"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                />
                <Input
                  label="Longitude"
                  type="number"
                  placeholder="e.g 7.3986"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                />
              </div>
            )}
            <Button className="w-full py-4" onClick={handleLogin}>
              Create Account
            </Button>
            <p className="text-sm text-emerald-300 text-center">
              Already registered?{" "}
              <Link to={`/portal`} className="cursor-pointer underline">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HospitalRegister;

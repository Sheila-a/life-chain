/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { loginUser } from "../services/auth/AuthService";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

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

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-emerald-300 text-sm">{label}</label>
      <input
        className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 focus:border-emerald-400 outline-none"
        {...props}
      />
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

const HospitalLogin = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const req = { email, password };

    if (!email) {
      toast.error("Enter email");
      return;
    }

    if (!password) {
      toast.error("Enter password");
      return;
    }

    const loadingId = toast.loading("Logging in...");

    try {
      const res = await loginUser(req);
      console.log(res);

      if (res) {
        toast.dismiss(loadingId);
      }
    } catch (error) {
      console.log(error);

      toast.error(error?.message);
      toast.dismiss(loadingId);
      // toast.error("An error occurred. Try again!");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <Card>
          <h2 className="text-3xl font-bold mb-6">Hospital Login</h2>
          <div className="space-y-6">
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
            <Button className="w-full py-4" onClick={handleLogin}>
              Login
            </Button>
            <p className="text-sm text-emerald-300 text-center">
              Don’t have an account?{" "}
              {/* <span
                className="cursor-pointer underline"
                onClick={() => navigate("/portal/new")}
              >
                Register
              </span> */}
              <Link
                to={`/portal/new`}
                className="cursor-pointer underline"
                // onClick={() => navigate("/portal")}
              >
                Register
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default HospitalLogin;

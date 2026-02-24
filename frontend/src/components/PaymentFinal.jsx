import React, { useEffect, useState } from "react";
import {
  Wallet,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import CustomModal from "./Modal";
import { formatAmount } from "../helpers/parishStats";
import Button from "./Button";
// import { Button, CustomModal, Input2, Select } from "../../components";

const PaymentFinal = ({
  open,
  handleClose,
  amount,
  type,
  auth,
  handlePay,
  setIsProcessing,
  isProcessing,
}) => {
  const [isAmountEditable, setIsAmountEditable] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [thetruebal, setTheTrueBal] = useState(0);
  const [balanceInput, setBalanceInput] = useState("");
  const [remark, setRemark] = useState("");
  const [showFundingDetails, setShowFundingDetails] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confir, setConfir] = useState(false);

  const walletBalance = auth?.balance;
  const totalRemittance = amount;

  const formatCurrencyInput = (value) => {
    if (value === "" || value === "-") return value;

    const isNegative = value.startsWith("-");
    const clean = isNegative ? value.slice(1) : value;

    const [intPart, decPart] = clean.split(".");
    const formattedInt = Number(intPart).toLocaleString();

    const formatted =
      decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;

    return isNegative ? `-${formatted}` : formatted;
  };

  const handlePayment = () => {
    setIsProcessing(true);
    if (type === "Collection") {
      handlePay(Number(thetruebal), isAmountEditable);
    } else {
      handlePay(Number(paymentAmount), isAmountEditable);
    }
    // Simulate API call
    // setTimeout(() => {
    //   setIsProcessing(false);
    //   setIsSuccess(true);
    // }, 2000);
  };

  useEffect(() => {
    if (type === "Collection") {
      setIsAmountEditable(true);
    }
  }, [type]);

  useEffect(() => {
    setPaymentAmount(amount);
  }, [amount]);

  if (isSuccess) {
    return (
      <CustomModal
        open={open}
        handleClose={handleClose}
        className="max-w-xl w-full"
      >
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Payment Successful
            </h2>
            <p className="text-slate-500 mb-6">
              Your transaction of ₦{Number(paymentAmount).toLocaleString()} has
              been processed.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </CustomModal>
    );
  }
  // console.log(confir);

  return (
    <CustomModal
      open={open}
      handleClose={handleClose}
      className="max-w-xl w-full p-0 rounded-[2rem]"
    >
      {/* Pop-out Layer Container */}
      <div className="bg-white rounded-[1rem] shadow-2xl w-full max-w-mdguj overflow-hidden border border-slate-100 flex flex-col">
        {/* Header Section */}
        <div className="bg-primary-500 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">
              Transaction Summary
            </span>
            <Lock className="w-4 h-4 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm">Total {type}</p>
          <h1 className="text-4xl font-bold mt-1">
            {formatAmount(totalRemittance)}
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Wallet Balance Card */}
          <>
            {auth?.bank ? (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Wallet className="w-5 h-5" />
                    <span className="font-semibold text-sm">
                      Wallet Balance
                    </span>
                  </div>
                  <span className="text-blue-900 font-bold">
                    ₦
                    {walletBalance?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <button
                  onClick={() => setShowFundingDetails(!showFundingDetails)}
                  className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight"
                >
                  Show Account Details to Fund Wallet
                  {showFundingDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showFundingDetails && (
                  <div className="mt-3 pt-3 border-t border-blue-200 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600/70">Bank Name</span>
                      <span className="font-medium text-blue-900">
                        {auth?.bank}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600/70">Account Name</span>
                      <span className="font-medium text-blue-900">
                        {auth?.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600/70">Account Number</span>
                      <span className="font-mono font-bold text-blue-900 tracking-widest">
                        {auth?.accountNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <p className="text-center text-red-500">
                  No wallet created. Contact support to create one.
                </p>
              </div>
            )}
          </>

          {/* Payment Amount Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">
                Payment Amount
              </label>
              {type === "Collection" || type === "Remittance" ? null : (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAmountEditable}
                    onChange={() => setIsAmountEditable(!isAmountEditable)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                    Change Amount
                  </span>
                </label>
              )}
            </div>
            <div
              className={`relative transition-all duration-200 ${
                isAmountEditable ? "scale-[1.02]" : "opacity-80"
              }`}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                ₦
              </span>
              <input
                type="text"
                disabled={!isAmountEditable}
                // value={paymentAmount}
                // onChange={(e) => setPaymentAmount(e.target.value)}
                value={type === "Collection" ? balanceInput : paymentAmount}
                onChange={(e) => {
                  let value = e.target.value;
                  if (type === "Collection") {
                    value = value.replace(/,/g, "");

                    value = value.replace(/[^0-9.-]/g, "");

                    if (value.indexOf("-") > 0) return;
                    if ((value.match(/-/g) || []).length > 1) return;

                    if ((value.match(/\./g) || []).length > 1) return;

                    const formatted = formatCurrencyInput(value);
                    setBalanceInput(formatted);

                    const num =
                      value === "" || value === "-" ? 0 : parseFloat(value);
                    setTheTrueBal(isNaN(num) ? 0 : num);
                  } else {
                    setPaymentAmount(e.target.value);
                  }
                }}
                className={`w-full pl-8 pr-4 py-4 rounded-xl border-2 text-lg font-bold transition-all
                  ${
                    isAmountEditable
                      ? "border-primary-500 bg-white text-slate-800 shadow-md"
                      : "border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10`}
              />
            </div>
          </div>

          {/* Payment Remark */}
          {/* <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Payment Remark
            </label>
            <textarea
              placeholder="e.g. Invoice #2034 - Office Supplies"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 resize-none h-24 outline-none"
            />
          </div> */}
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0 mt-auto">
          <button
            disabled={
              !auth?.bank ||
              isProcessing ||
              (!type === "Collection" && !paymentAmount) ||
              paymentAmount > walletBalance ||
              (type === "Collection" && thetruebal <= 0)
            }
            onClick={() => {
              if (type === "Collection") {
                setConfir(true);
              } else {
                handlePayment();
              }
            }}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${
                isProcessing
                  ? "bg-slate-100 text-slate-400 cursor-wait"
                  : paymentAmount > walletBalance ||
                      (type === "Collection" && thetruebal > walletBalance) ||
                      !auth?.bank ||
                      (type === "Collection" && !thetruebal)
                    ? "bg-red-50 text-red-500 cursor-not-allowed border border-red-100"
                    : "bg-primary-500 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-500/30"
              }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Processing...
              </>
            ) : paymentAmount > walletBalance ? (
              "Insufficient Balance"
            ) : type === "Collection" && thetruebal > walletBalance ? (
              "Insufficient Balance"
            ) : (
              <>
                Make Payment
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Secure SSL Encrypted Transaction
          </p>
        </div>
      </div>
      {confir && (
        <CustomModal
          open={confir}
          handleClose={() => setConfir(false)}
          className="max-w-lg w-full"
        >
          <div className="  ">
            <h3 className="text-xl font-semibold">Confirm amount</h3>{" "}
            <p className=" mb-5 text-sec-100 text-[17px]">
              Are you sure this is the collection amount?
            </p>
          </div>
          <h3 className="text-center text-4xl font-bold">
            {formatAmount(thetruebal)}
          </h3>
          <div className="flex justify-end gap-3 mt-10">
            <Button
              variant="outline"
              onClick={() => setConfir(false)}
              disabled={isProcessing}
              className={`text-sec-300  px-9 flex items-center justify-center w-fullb`}
            >
              No
              {/* I'm staying */}
            </Button>
            <Button
              onClick={handlePayment}
              loading={isProcessing}
              loadingText="Processing..."
              className={` px-9 flex items-center justify-center`}
            >
              Yes, Process payment
            </Button>
          </div>
        </CustomModal>
      )}
    </CustomModal>
  );
};

export default PaymentFinal;

import React, { useEffect, useState } from "react";
import { Button, CustomModal, Input2, Radio, Select } from "../../components";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { addBankAccount } from "../../services/BankAccountServices";
import { getParishById } from "../../services/userServices";
import { formatReadableDate } from "../../helpers/others";
import { buildReportTitle } from "../../helpers/reportHelper";
import { updateBalanceCo } from "../../services/ReportServices";

const AddBalance = ({ open, handleClose, getData, data }) => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState();
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState();
  const [repId, setReportId] = useState();
  const [filterVal, setfilterVal] = useState("");

  // console.log(data);

  const getTheReports = async () => {
    try {
      const res = await getParishById(auth?.token, data?.id);

      if (res) {
        const makeup = res?.reports.map((item) => {
          return {
            value: item?.id,
            label: buildReportTitle(item?.createdAt),
          };
        });
        setReports(makeup);
      }
    } catch (error) {
      if (error.status === 500) {
        toast.error("Something went wrong!");
      } else if (error.status === 401) {
        toast.error("Session expired");

        setTimeout(() => {
          setAuth({ success: false });
          sessionStorage.clear();
          navigate("/");
        }, 3000);
      } else if (error.status === 403) {
        navigate("/no-access");
      } else {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (data) {
      getTheReports();
    }
  }, [data]);

  const createNew = async () => {
    const loadId = toast.loading("Adding balance...");
    try {
      const req = {
        [filterVal]: Number(amount),
      };

      setLoading(true);
      const res = await updateBalanceCo(auth?.token, req, repId);

      if (res) {
        setLoading(false);
        toast.dismiss(loadId);
        toast.success("Balance added!");
        getData();
        handleClose();
      }
    } catch (error) {
      setLoading(false);
      toast.dismiss(loadId);
      if (error.status === 500) {
        toast.error("Something went wrong!");
      } else if (error.status === 401) {
        toast.error("Session expired");

        setTimeout(() => {
          setAuth({ success: false });
          sessionStorage.clear();
          navigate("/");
        }, 3000);
      } else if (error.status === 403) {
        navigate("/no-access");
      } else {
        toast.error(error?.response?.data?.message);
      }
    }
  };

  return (
    <CustomModal
      open={open}
      handleClose={handleClose}
      className="max-w-xl w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <h3 className="text-xl font-semibold">Add Balance</h3>
        <p className="text-sec-300 ">Add a new balance record</p>
      </motion.div>
      <motion.div
        className="text-sec-100 my-7 text-lg "
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {" "}
        <p className={`text-center ${!filterVal && "mt-20"}`}>
          Kindly indicate type of balance
        </p>
        <div className="flex items-center mx-auto justify-center gap-6 pb-10 mt-4">
          <Radio
            label={`Brought forward`}
            name={`balanceType`}
            value={`balanceBroughtForward`}
            checked={filterVal === "balanceBroughtForward"}
            onChange={(e) => {
              setfilterVal(e.target.value);
            }}
          />
          <Radio
            label={`Carried over`}
            name={`balanceType`}
            value={`balanceCarriedOver`}
            checked={filterVal === "balanceCarriedOver"}
            onChange={(e) => {
              setfilterVal(e.target.value);
            }}
          />
        </div>{" "}
        {filterVal && (
          <>
            <Input2
              label={`Amount`}
              value={amount}
              disabled={loading}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select
              label={`Select report`}
              value={repId}
              disabled={loading}
              onChange={(e) => setReportId(e.target.value)}
              options={reports}
            />
          </>
        )}
      </motion.div>{" "}
      <motion.div
        className="flex items-center mt-10 justify-end"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1 }}
      >
        <Button
          loading={loading}
          onClick={createNew}
          loadingText="Adding balancet..."
          disabled={!filterVal || !amount || !repId}
        >
          Add
        </Button>
      </motion.div>
    </CustomModal>
  );
};

export default AddBalance;

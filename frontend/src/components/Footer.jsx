import React from "react";

const Footer = ({ isExpanded }) => {
  return (
    <div
      className={`md:px-6 pl-[70px] fixed bottom-0 py-5 bg-gray-100 text-sec-300 text-center ${
        isExpanded
          ? "md:w-[calc(100vw-20rem)] w-[calc(100%-4px)]"
          : "md:w-[calc(100vw-6rem)] w-[calc(100%-4px)]"
      }`}
    >
      Built by{" "}
      <b className="text-blue-800">
        <a href="https://www.mogrex.com/" target="_blank">
          MogRex Limited
        </a>
      </b>{" "}
      | Powered by{" "}
      <b className="text-teal-600">
        <a href="http://catholicpay.net/" target="_blank">
          CatholicPay
        </a>
      </b>{" "}
      | Copyrights Abuja Archdiocesan Chancery Finance 2026
    </div>
  );
};

export default Footer;

import { CheckCircle, XCircle, FileText, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { MdPending } from "react-icons/md";

const ComplianceCard = ({ title, isCompliant, icon: Icon }) => {
  // const activeStyles = {
  //   wrapper: "border-green-500 bg-green-50",
  //   badge: "bg-green-500 text-white",
  //   text: "text-green-700",
  //   ring: "ring-green-200",
  //   status: "COMPLIANT",
  //   StatusIcon: CheckCircle,
  // };

  const activeStyles =
    isCompliant === true || isCompliant >= 75
      ? {
          wrapper: "border-green-500 bg-green-50",
          badge: "bg-green-500 text-white",
          text: "text-green-700",
          ring: "ring-green-200",
          status: "COMPLIANT",
          StatusIcon: CheckCircle,
        }
      : isCompliant >= 50 && isCompliant <= 74
        ? {
            wrapper: "border-yellow-500 bg-yellow-50",
            badge: "bg-yellow-500 text-white",
            text: "text-yellow-700",
            ring: "ring-yellow-200",
            status: "PARTIALLY-COMPLIANT",
            StatusIcon: MdPending,
          }
        : {
            wrapper: "border-red-500 bg-red-50",
            badge: "bg-red-500 text-white",
            text: "text-red-700",
            ring: "ring-red-200",
            status: "NON-COMPLIANT",
            StatusIcon: XCircle,
          };

  const StatusIcon = activeStyles.StatusIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2 }}
      className={`relative rounded-2xl border p-5 flex items-center justify-between shadow-lg ${activeStyles.wrapper}`}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ring-4 ${activeStyles.ring} bg-white`}>
          <Icon className={`w-6 h-6 ${activeStyles.text}`} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusIcon className={`w-4 h-4 ${activeStyles.text}`} />
            <span className={`text-sm font-bold ${activeStyles.text}`}>
              {activeStyles.status}
            </span>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div
        className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${activeStyles.badge}`}
      >
        STATUS
      </div>
    </motion.div>
  );
};

const ComplianceOverview = ({ auth }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 2 }}
    >
      <ComplianceCard
        title="Report Compliance"
        isCompliant={auth?.averageCompliance}
        icon={FileText}
      />

      <ComplianceCard
        title="Payment Compliance"
        isCompliant={auth?.isPaymentCompliant}
        icon={CreditCard}
      />
    </motion.div>
  );
};

export default ComplianceOverview;

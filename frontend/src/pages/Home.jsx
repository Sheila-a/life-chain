// /* eslint-disable no-unused-vars */
// import { motion } from "framer-motion";
// import {
//   Activity,
//   ShieldCheck,
//   Network,
//   Search,
//   ArrowRight,
// } from "lucide-react";
// import { Button } from "../components";
// import Card from "../partials/Card";
// import CardContent from "../partials/CardContent";
// import { LogoF } from "../assets";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white">
//       <nav className="bg-white p-3">
//         <img src={LogoF} alt="" className="w-44" />
//       </nav>
//       {/* Hero */}
//       <section className="px-8 py-24 text-center max-w-6xl mx-auto">
//         <motion.h1
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-5xl md:text-7xl font-extrabold leading-tight"
//         >
//           LifeChain
//         </motion.h1>
//         <motion.p
//           className="mt-6 text-xl md:text-2xl text-emerald-200 max-w-3xl mx-auto"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//         >
//           A National Emergency Intelligence Infrastructure.
//           <br /> Discover MRI, ICU, anti-venom & life-saving resources
//           instantly.
//         </motion.p>

//         <motion.div
//           className="mt-12 flex flex-col md:flex-row justify-center gap-6"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.9 }}
//         >
//           <Button
//             className="rounded-2xl px-10 py-7 text-xl bg-emerald-500 hover:bg-emerald-600 shadow-2xl"
//             icon={<Search className="mr-2" />}
//             href={"/search"}
//           >
//             Public Emergency Search
//           </Button>
//           <Button
//             variant="outline"
//             href={`/portal`}
//             className="rounded-2xl px-10 py-7 text-xl w-fit md:mx-0 mx-auto border-emerald-300 hover:scale-105 text-emerald-200"
//             icon={<ArrowRight className="ml-2" />}
//             iconPosBack={true}
//           >
//             Hospital Portal
//           </Button>
//         </motion.div>
//       </section>

//       {/* Highlights */}
//       <section className="px-8 pb-24 max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
//         {features.map((feature, index) => (
//           <Card key={index} className=" ">
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: `${index}` }}
//             >
//               <CardContent className="p-8">
//                 <feature.icon className="w-12 h-12 text-emerald-300" />
//                 <h3 className="text-2xl font-bold mt-6">{feature.title}</h3>
//                 <p className="mt-4 text-emerald-200">{feature.description}</p>
//               </CardContent>
//             </motion.div>
//           </Card>
//         ))}
//       </section>
//     </div>
//   );
// }

// const features = [
//   {
//     icon: Activity,
//     title: "Live Resource Registry",
//     description:
//       "Hospitals push real-time availability secured on Hedera Consensus Service.",
//   },
//   {
//     icon: Network,
//     title: "Equipment Sharing Network",
//     description:
//       "Cross-hospital MRI & ICU slot booking with verifiable transaction logs.",
//   },
//   {
//     icon: ShieldCheck,
//     title: "AfterLife Vault",
//     description:
//       "Encrypted medical disclosures timestamped immutably for controlled release.",
//   },
// ];

import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Network,
  Search,
  ArrowRight,
  MapPin,
  Lock,
  Cpu,
} from "lucide-react";
import { Button } from "../components";
import Card from "../partials/Card";
import CardContent from "../partials/CardContent";
import { LogoF } from "../assets";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white">
      {/* NAV */}
      <nav className="bg-white p-3 flex justify-between items-center">
        <img src={LogoF} alt="" className="w-44" />
        <div className="hidden md:flex gap-6 text-black font-medium">
          <span>How it Works</span>
          <span>Trust</span>
          <span>Vault</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-8 py-24 text-center max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight"
        >
          LifeChain
        </motion.h1>

        <motion.p
          className="mt-6 text-xl md:text-2xl text-emerald-200 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          A Trust Protocol for Emergency Healthcare.
          <br />
          Discover life-saving resources — MRI, ICU, anti-venom — with
          verifiable truth.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col md:flex-row justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Button
            className="rounded-2xl px-10 py-7 text-xl bg-emerald-500 hover:bg-emerald-600 shadow-2xl flex items-center justify-center w-fit mx-auto lg:mx-0"
            icon={<Search className="mr-2" />}
            href={"/search"}
          >
            Public Emergency Search
          </Button>
          <Button
            variant="outline"
            href={`/portal`}
            className="rounded-2xl px-10 py-7 text-xl w-fit md:mx-0 mx-auto border-emerald-300 hover:scale-105 text-emerald-200"
            icon={<ArrowRight className="ml-2" />}
            iconPosBack={true}
          >
            Hospital Portal
          </Button>
        </motion.div>
      </section>

      {/* PROBLEM STORY */}
      <section className="px-8 pb-20 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          This Should Not Happen
        </h2>
        <p className="text-emerald-200 leading-relaxed">
          People are dying not because treatment does not exist — but because
          systems do not communicate. No visibility into anti-venom. No shared
          MRI access. No real-time coordination. In emergencies, bad data is as
          dangerous as no data.
        </p>
      </section>

      {/* FEATURES */}
      <section className="px-8 pb-24 max-w-8xl mx-auto grid md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <Card key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 + index * 0.2 }}
            >
              <CardContent className="p-8">
                <feature.icon className="w-12 h-12 text-emerald-300" />
                <h3 className="text-2xl font-bold mt-6">{feature.title}</h3>
                <p className="mt-4 text-emerald-200">{feature.description}</p>
              </CardContent>
            </motion.div>
          </Card>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="px-8 pb-24 max-w-8xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          How LifeChain Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Card key={i}>
              <CardContent>
                <step.icon className="w-10 h-10 text-emerald-400" />
                <h3 className="text-xl font-bold mt-4">{step.title}</h3>
                <p className="text-emerald-200 mt-2">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="px-8 pb-24 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Built on Verifiable Trust</h2>
        <p className="text-emerald-200 leading-relaxed">
          Every update is cryptographically signed using AWS KMS and immutably
          recorded on Hedera. This ensures data is tamper-proof, timestamped,
          and auditable. In LifeChain, data is not trusted because it is
          reported — it is trusted because it is proven.
        </p>
      </section>

      {/* VAULT CTA */}
      <section className="px-8 pb-24 max-w-8xl mx-auto text-center">
        <Card>
          <CardContent>
            <Lock className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-bold mt-4">
              Beyond Access — Preserve Life-Saving Truth
            </h3>
            <p className="text-emerald-200 mt-3">
              Securely store critical medical information that can be released
              when it matters most.
            </p>
            <Button className="mt-6 px-8 py-4">
              Create Secure Vault Entry
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-emerald-300 text-sm">
        LifeChain — Trust Protocol for Emergency Healthcare
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Activity,
    title: "Real-Time Resource Discovery",
    description:
      "Locate MRI, ICU, and anti-venom instantly with distance-based search.",
  },
  {
    icon: Network,
    title: "Cross-Hospital Coordination",
    description:
      "Share equipment and availability across hospitals in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Medical Data",
    description:
      "Every update is signed, timestamped, and verifiable on Hedera.",
  },
];

const steps = [
  {
    icon: Cpu,
    title: "Hospital Updates",
    desc: "Hospitals update resources through a secure, verified system.",
  },
  {
    icon: ShieldCheck,
    title: "Verified on Hedera",
    desc: "Each update is cryptographically signed and recorded immutably.",
  },
  {
    icon: MapPin,
    title: "User Discovery",
    desc: "Users find the nearest verified life-saving resources instantly.",
  },
];

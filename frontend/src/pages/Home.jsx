/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Network,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components";
import Card from "../partials/Card";
import CardContent from "../partials/CardContent";
import { LogoF } from "../assets";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white">
      <nav className="bg-white p-3">
        <img src={LogoF} alt="" className="w-44" />
      </nav>
      {/* Hero */}
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
          A National Emergency Intelligence Infrastructure.
          <br /> Discover MRI, ICU, anti-venom & life-saving resources
          instantly.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col md:flex-row justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Button
            className="rounded-2xl px-10 py-7 text-xl bg-emerald-500 hover:bg-emerald-600 shadow-2xl"
            icon={<Search className="mr-2" />}
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

      {/* Highlights */}
      <section className="px-8 pb-24 max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <Card key={index} className=" ">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: `${index}` }}
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
    </div>
  );
}

const features = [
  {
    icon: Activity,
    title: "Live Resource Registry",
    description:
      "Hospitals push real-time availability secured on Hedera Consensus Service.",
  },
  {
    icon: Network,
    title: "Equipment Sharing Network",
    description:
      "Cross-hospital MRI & ICU slot booking with verifiable transaction logs.",
  },
  {
    icon: ShieldCheck,
    title: "AfterLife Vault",
    description:
      "Encrypted medical disclosures timestamped immutably for controlled release.",
  },
];

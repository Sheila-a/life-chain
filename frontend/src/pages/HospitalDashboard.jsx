import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  LogOut,
  ShieldCheck,
  Plus,
  Pencil,
} from "lucide-react";
import { Button, Card, Input } from "./HospitalLogin";
import { useNavigate } from "react-router-dom";
import {
  createEqSlot,
  listHospEqSlot,
  listResource,
  updateResource,
} from "../services/otherServices";
import { toast } from "sonner";
import { CustomModal } from "../components";
import useAuth from "../hooks/useAuth";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [teep, setTeep] = useState("");
  const { auth } = useAuth();
  const [resources, setResources] = useState([]);
  const [equipmentSlots, setEquipmentSlots] = useState([]);

  const handleLogout = async () => {
    sessionStorage.removeItem("lifaufethch");
    navigate("/portal");
  };

  const fetchData = useCallback(async () => {
    try {
      const [res, res2] = await Promise.all([listHospEqSlot(), listResource()]);
      if (res) setEquipmentSlots(res);
      if (res2) setResources(res2);
    } catch (err) {
      toast.error(err?.message || "An error occurred!");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };

    run();
  }, [fetchData]);

  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    resourceType: "",
    quantity: "",
  });

  const [form2, setForm2] = useState({
    slotType: "",
    slotTime: "",
  });

  const handleCreateResource = async () => {
    const loadId = toast.loading(
      `${teep == "createR" ? "Creating" : "Updating"} resource...`,
    );
    const newItem = {
      resourceType: form.resourceType,
      quantity: form.quantity,
    };
    try {
      const res = await updateResource(auth?.token, newItem);

      if (res) {
        toast.dismiss(loadId);
        await fetchData();
        setForm({ resourceType: "", quantity: "" });
        setOpenModal(false);
        toast.success("Resource updated successfully!");
      }
    } catch (error) {
      toast.dismiss(loadId);

      if (error?.response?.status === 401) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
      console.error(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCreateEqt = async () => {
    const loadId = toast.loading(
      `${teep == "createE" ? "Creating" : "Updating"} slot...`,
    );
    const newItem = {
      slotType: form2.slotType,
      slotTime: form2.slotTime,
    };
    try {
      const res = await createEqSlot(auth?.token, newItem);

      if (res) {
        toast.dismiss(loadId);
        await fetchData();
        setForm2({ slotType: "", slotTime: "" });
        setOpenModal(false);
        toast.success("Slot updated successfully!");
      }
    } catch (error) {
      toast.dismiss(loadId);

      if (error?.response?.status === 401) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
      console.error(error?.response);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-950 via-teal-900 to-slate-950 text-white">
      <CustomModal open={openModal} handleClose={() => setOpenModal(false)}>
        <h2 className="text-2xl font-bold mb-6">
          {teep == "createR" || teep == "createE" ? "Create" : "Update"}{" "}
          {teep == "createR" || teep == "updateR" ? "Resource" : "Slot"}
        </h2>

        <div className="space-y-4">
          {teep == "createR" || teep == "updateR" ? (
            <>
              {" "}
              <div>
                <label className="text-emerald-300 text-sm">
                  Resource Type
                </label>
                <Input
                  value={form.resourceType}
                  onChange={(e) =>
                    setForm({ ...form, resourceType: e.target.value })
                  }
                  placeholder="MRI / Anti-Venom / ICU Bed"
                />
              </div>
              <div>
                <label className="text-emerald-300 text-sm">Quantity</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="10"
                />
              </div>
            </>
          ) : (
            <>
              {" "}
              <div>
                <label className="text-emerald-300 text-sm">Slot Type</label>
                <Input
                  value={form2.slotType}
                  onChange={(e) =>
                    setForm2({ ...form2, slotType: e.target.value })
                  }
                  placeholder="MRI / Anti-Venom / ICU Bed"
                />
              </div>
              <div>
                <label className="text-emerald-300 text-sm">Slot time</label>
                <Input
                  type="datetime-local"
                  value={form2.slotTime}
                  onChange={(e) =>
                    setForm2({ ...form2, slotTime: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <Button
            className="w-full mt-4 px-3 rounded-lg py-3"
            disabled={
              teep == "createR" || teep == "updateR"
                ? !form.resourceType || !form.quantity
                : !form2.slotTime || !form2.slotType
            }
            onClick={
              teep == "createR" || teep == "updateR"
                ? handleCreateResource
                : handleCreateEqt
            }
          >
            {teep == "create" ? "Create" : "Update"}{" "}
            {teep == "createR" || teep == "updateR" ? "Resource" : "Slot"}
          </Button>
        </div>
      </CustomModal>
      <aside className="w-72 bg-black/40 backdrop-blur-xl p-8 space-y-6 border-r border-white/10">
        <h2 className="text-2xl font-bold text-emerald-400">Hospital Panel</h2>

        <nav className="space-y-2 text-lg">
          <SidebarItem
            label="Dashboard Overview"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />

          <SidebarItem
            label="Resource Registry"
            disabled={true}
            active={activeView === "resources"}
            onClick={() => setActiveView("resources")}
          />

          <SidebarItem
            label="Equipment Sharing"
            disabled={true}
            active={activeView === "equipment"}
            onClick={() => setActiveView("equipment")}
          />
        </nav>

        <Button
          variant="outline"
          className="mt-10 w-full py-3"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" /> Logout
        </Button>
      </aside>
      <main className="flex-1 p-10 space-y-10">
        {activeView === "dashboard" && (
          <>
            <h1 className="text-4xl font-bold">
              Hospital Operations Dashboard
            </h1>

            <div className="grid md:grid-cols-3 gap-8">
              <DashboardCard
                title="Available MRI Slots"
                value={equipmentSlots.length}
                icon={Calendar}
              />
              <DashboardCard
                title="Active Resources"
                value={resources.length}
                icon={Activity}
              />
              <DashboardCard
                title="Vault Submissions"
                value="75"
                icon={ShieldCheck}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-10">
              <ResourceRegistry
                resources={resources}
                setOpenModal={setOpenModal}
                setTeep={setTeep}
                setForm={setForm}
              />

              <EquipmentSharing
                equipmentSlots={equipmentSlots}
                setOpenModal={setOpenModal}
                setTeep={setTeep}
                setForm2={setForm2}
              />
            </div>
          </>
        )}

        {activeView === "resources" && (
          <ResourceRegistry resources={resources} setResources={setResources} />
        )}

        {activeView === "equipment" && (
          <EquipmentSharing
            equipmentSlots={equipmentSlots}
            setEquipmentSlots={setEquipmentSlots}
          />
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;

// eslint-disable-next-line no-unused-vars
function DashboardCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-emerald-300">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <Icon className="w-10 h-10 text-emerald-400" />
      </div>
    </Card>
  );
}

function SidebarItem({ label, onClick, active, disabled }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition p-2 py-3 rounded-lg ${disabled && "pointer-events-none opacity-50"}  ${
        active
          ? "text-white font-semibold bg-emerald-500 "
          : "text-emerald-300 hover:text-white "
      }`}
    >
      {label}
    </div>
  );
}

function ResourceRegistry({ resources, setOpenModal, setTeep, setForm }) {
  return (
    <Card>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Resource Registry</h2>

        <Button
          onClick={() => {
            setOpenModal(true);
            setTeep("createR");
            setForm({ resourceType: "", quantity: "" });
          }}
          className="px-3 rounded-lg py-2"
        >
          <Plus className="mr-2" />
          Create Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <EmptyState message="No resources registered yet." />
      ) : (
        <Table
          columns={["ID", "Resource Type", "Quantity", "Action"]}
          data={resources.map((r, i) => [
            i + 1,
            r.resource_type,
            r.quantity,
            <Pencil
              size={20}
              className="cursor-pointer"
              onClick={() => {
                setOpenModal(true);
                setTeep("updateR");
                setForm({
                  resourceType: r.resource_type,
                  quantity: r.quantity,
                });
              }}
            />,
          ])}
        />
      )}
    </Card>
  );
}

const formatSlotDateTime = (isoString) => {
  const date = new Date(isoString);

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const formattedDate = date.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    year: "numeric",
  });

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });

  return {
    date: formattedDate.replace(",", ` ${day}${suffix}`),
    time: time.replace(":00", ""), // removes :00 → 12PM instead of 12:00 PM
  };
};

const formatSlotDateTime = (isoString) => {
  const date = new Date(isoString);

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const formattedDate = date.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    year: "numeric",
  });

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });

  return {
    date: formattedDate.replace(",", ` ${day}${suffix}`),
    time: time.replace(":00", ""), 
  };
};

function EquipmentSharing({ equipmentSlots, setOpenModal, setTeep, setForm2 }) {
  return (
    <Card>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Equipment Sharing</h2>

        <Button
          onClick={() => {
            setOpenModal(true);
            setTeep("createE");
            setForm2({ slotType: "", slotTime: "" });
          }}
          className="px-3 rounded-lg py-2"
        >
          <Plus className="mr-2" />
          Create Slot
        </Button>
      </div>

      {equipmentSlots.length === 0 ? (
        <EmptyState message="No equipment slots available." />
      ) : (
        <Table
          columns={["ID", "Slot Type", "Slot Time", "Status"]}
          data={equipmentSlots.map((s, i) => [
            i + 1,
            s.slot_type,
            s.slot_time,
            s.status,
          ])}
        />
      )}
    </Card>
  );
}

function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border border-white/10 rounded-xl overflow-hidden">
        <thead className="bg-white/5">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="p-4 text-emerald-300 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-white/10">
              {row.map((cell, j) => (
                <td key={j} className="p-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 text-emerald-300">
      <p className="text-lg">{message}</p>
    </div>
  );
}

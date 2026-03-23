# 🏥 LifeChain — Trust Protocol for Emergency Healthcare

## 🚨 Overview

LifeChain is a **real-time, decentralized emergency healthcare coordination protocol** designed to solve a critical global problem:

> **People are dying because healthcare systems don’t communicate.**

LifeChain enables users to instantly discover life-saving resources (MRI, ICU beds, anti-venom) while ensuring that every piece of data is **cryptographically verified, timestamped, and immutable**.

Unlike traditional systems, **data is not trusted because it is reported — it is trusted because it is provably verified.**

---

## 💡 Core Idea

LifeChain combines:

- 🔍 **Discovery** — Find nearest medical resources
- 🔗 **Coordination** — Share capacity across hospitals
- 🔐 **Trust** — Verify every update using Hedera + AWS KMS

> A hospital resource is ONLY valid if it is verified on Hedera.

---

## 🧩 Key Features (MVP)

### 🏥 Hospital Portal

- Register and authenticate hospitals
- Create and manage resource registry (MRI, ICU, anti-venom)
- Create equipment slots (e.g., MRI booking slots)

### 🌍 Public Search Interface (PSI)

- Search for life-saving resources
- Map-based visualization of nearby hospitals
- Distance-based results
- Verified data indicators

### 🔄 Equipment Sharing

- Cross-hospital slot booking
- Transparent coordination

### 🔐 Trust Layer

- AWS KMS cryptographic signing
- Hedera Consensus logging (HCS)
- Immutable audit trail

### 💀 LifeVault (Concept + Phase Extension)

- Encrypted medical disclosures
- Time-triggered release
- Multi-signature verification

---

## 🔗 Architecture

```
Frontend (React)
      ↓
Backend (Node.js / Express)
      ↓
AWS KMS (Signing & Key Management)
      ↓
Hedera Network
   - HCS (Consensus Service)
   - HFS (File Service)
   - HTS (Token Service)
```

---

## ⚙️ Tech Stack

### Frontend

- React (JSX)
- Tailwind CSS

### Backend

- Node.js (Express)

### Blockchain (Hedera)

- Hedera Consensus Service (HCS)
- Hedera Token Service (HTS)
- Hedera File Service (HFS)

### Security

- AWS KMS (cryptographic signing, key management)

### Database

- PostgreSQL / SQLite (MVP)

---

## 🔥 Why Hedera?

LifeChain uses Hedera as a **trust infrastructure layer**, not just a blockchain:

- ✅ Immutable audit trail
- ✅ Consensus timestamps (prevents stale data)
- ✅ Verifiable medical data
- ✅ High throughput + low fees

> Hedera is the **source of truth** in LifeChain.

---

## 🔐 Security Model

Every critical action:

1. Payload is created
2. Signed using AWS KMS
3. Logged on Hedera (HCS)
4. Stored and displayed as **verified**

> Even the system itself cannot tamper with the data.

---

## 🌱 Sustainability Impact

- Optimizes use of existing healthcare resources
- Reduces emergency inefficiencies
- Enables equitable access to care
- Built on Hedera’s **low-energy network**

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Hedera Testnet credentials
- AWS KMS credentials

---

### Installation

```bash
git clone https://github.com/your-repo/lifechain.git
cd lifechain
npm install
```

For testing the live demo link, on first request kindly exercise patience as onrender first requests literally restarts the sleeping server.

---

### Run the App

#### Start Backend

```bash
npm run server
```

#### Start Frontend

```bash
npm run dev
```

---

## 🧪 Proof of Concept (PoC)

The MVP demonstrates:

- Hospital onboarding
- Resource registry updates
- Equipment slot creation
- Public resource search
- Hedera verification layer
- AWS KMS signing pipeline

> Focused on the **minimum features required for life-saving coordination**

---

## 📈 Roadmap

### Phase 2

- 🧠 AI routing engine (smart hospital suggestions)
- 📡 IoT integration (auto resource updates)
- 🏛 Government API integration
- ⚖️ Multi-signature death verification
- 💳 Insurance system integration

---

## 🎯 Go-To-Market Strategy

1. Onboard private hospitals
2. Expand to NGOs & emergency services
3. Integrate with government systems
4. Scale nationally → globally

---

## 🧪 Validation

- Early feedback from industry professionals:

  > “This is a massive idea”

- First hospital onboarding in progress

---

## 🌍 Vision

LifeChain is not just an application.

> It is a **global trust protocol for emergency healthcare coordination**.

---

## 📜 License

MIT License

---

## 🏁 Final Note

> In emergencies, trust is not optional.
> LifeChain ensures that life-saving decisions are based on **provable truth**.

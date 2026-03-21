# LifeChain Phase 1 Backend (NestJS)

## Run locally

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies: `npm install`
3. Start dev server: `npm run start:dev`

## Environment variables

- `PORT`: API port (Render sets this automatically)
- `NODE_ENV`: `development` or `production`
- `JWT_SECRET`: signing key for JWTs
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: optional comma-separated allowed origins
- `HEDERA_NETWORK`: `testnet` or `mainnet`
- `HEDERA_OPERATOR_ID`: optional for live Hedera mode
- `HEDERA_OPERATOR_KEY`: optional for live Hedera mode
- `HEDERA_HCS_TOPIC_ID`: optional fixed HCS topic id
- `AWS_REGION`: optional for live AWS KMS signing
- `AWS_ACCESS_KEY_ID`: optional for live AWS KMS signing
- `AWS_SECRET_ACCESS_KEY`: optional for live AWS KMS signing
- `AWS_KMS_KEY_ID`: optional asymmetric KMS signing key id
- `AWS_KMS_SIGNING_ALGORITHM`: optional, defaults to `ECDSA_SHA_256`
- `VAULT_MASTER_KEY`: 32+ character secret for vault key wrapping

## Render deployment

This repo includes a root `render.yaml` Blueprint that creates:

- `life-chain-db` (managed PostgreSQL)
- `life-chain-backend` (NestJS web service)

### Deploy steps

1. Push this repo to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select your repo and apply the blueprint.
4. Set these backend environment variables in Render:
   - `JWT_SECRET`
   - `VAULT_MASTER_KEY`
   - optional Hedera credentials for live mode
5. Render injects `DATABASE_URL` automatically from the linked Postgres service.

## Notes

- Uses PostgreSQL and auto-creates tables at startup.
- Hedera runs in mock mode when `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are missing.
- AWS KMS signing for resource updates and bookings runs in mock mode when AWS KMS credentials are missing.
- In live mode, startup creates or reuses an HCS topic for immutable logging.
- API base prefix is `/api`.
- Swagger UI is available at `/api/docs`.

## API Endpoints

- `POST /api/register-hospital`
  - required body fields: `name`, `email`, `password`, `lat`, `long`
- `POST /api/login`
- `POST /api/resource-updates`
  - creates a resource registry event and updates current inventory
- `PATCH /api/resources/:resourceType`
  - updates the current quantity for an existing hospital resource
- `GET /api/resources/search`
  - returns current hospital inventory
- `GET /api/resources/nearest`
  - returns nearby hospitals with positive stock for the requested resource
- `GET /api/resource-updates/search`
  - returns resource update history
- `POST /api/equipment/create`
- `GET /api/equipment/list`
- `POST /api/booking/create`
- `POST /api/vault/upload`
- `GET /api/vault/release/:id`
- `GET /api/audit/resources/:id`
  - returns explorer-ready resource audit data
- `GET /api/audit/bookings/:id`
  - returns explorer-ready booking audit data
- `GET /api/audit/vaults/:id`
  - returns explorer-ready vault audit data

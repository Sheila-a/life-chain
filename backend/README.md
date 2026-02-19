# LifeChain Phase 1 Backend (NestJS)

## Run

1. Copy `.env.example` to `.env` and set values.
2. Install dependencies: `npm install`
3. Start dev server: `npm run start:dev`

## Notes

- Uses SQLite (`lifechain.db`) for local prototype/hackathon flow.
- Hedera runs in mock mode when `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are missing.
- In live mode, startup creates or reuses an HCS topic for immutable logging.
- API base prefix is `/api`.

## API Endpoints

- `POST /api/register-hospital`
- `POST /api/login`
- `POST /api/resource/update`
- `GET /api/resources/search`
- `POST /api/equipment/create`
- `GET /api/equipment/list`
- `POST /api/booking/create`
- `POST /api/vault/upload`
- `GET /api/vault/release/:id`

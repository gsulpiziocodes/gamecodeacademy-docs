# Game Code Academy Docs Server

This app serves public + locked docs content for `docs.gamecodeacademy.com`.

## How access-code locking works

- Locked pages use a frontend `Lock` component that POSTs to `/verifyCode`.
- Backend checks the submitted code against `codes.js`.
- On success, backend sets a **signed HTTP-only cookie**:
  - cookie name: `gca_unlock`
  - cookie value: `verified`
- On each request:
  - valid signed cookie => serve `private/`
  - no valid cookie => serve `public/`

This is serverless-safe for Vercel (no in-memory sessions required).

## Important files

- `app.js` – Express app + lock middleware + cookie auth
- `codes.js` – allowed access codes
- `public/` – locked placeholders + public content
- `private/` – unlocked content
- `vercel.json` – routes all traffic through `app.js`

## Quick test (60 seconds)

1. Open `https://docs.gamecodeacademy.com/docs/intro`
2. Enter access code `838772`
3. Click **Access Content**
4. Confirm locked content unlocks
5. Refresh page — content should remain unlocked

## Relock test

Use endpoint to clear unlock cookie:

```bash
curl -X POST https://docs.gamecodeacademy.com/lock
```

Then refresh docs page; it should be locked again.

## Health check

```bash
curl https://docs.gamecodeacademy.com/health
```

Expected:

```json
{"ok":true}
```

## Local run

```bash
npm install
npm start
```

Default script starts `node ./bin/www`.

## Troubleshooting

### "Sorry, you've entered an invalid code"

Check browser DevTools Network for `POST /verifyCode`:
- `200` => code accepted; verify reload + cookie behavior
- `400` => code mismatch; check `codes.js`
- `500` => backend/runtime error (check Vercel logs)
- `404/405` => routing/deploy config issue (check `vercel.json`, project root)

### Vercel gotcha

Make sure Vercel project points to this app/repo path and deploys latest commit.
If wrong project/root is deployed, `/verifyCode` will fail even with a valid code.

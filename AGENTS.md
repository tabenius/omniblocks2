<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## TODO (maintained by Codex)
- [x] Complete `BackgroundField` integration for all blocks that expose a `background` prop.
- [x] Add `BackgroundField` token presets for `Surface`/`Muted` so defaults are not treated as custom.
- [x] Switch failed R2 uploads to preview-only (no block `src` mutation to local base64 data).
- [x] Add autosave capacity warning/error UI for large payloads or storage quota failures.
- [x] Centralize safe JSON parsing helper and apply it in editor API callers.
- [x] Run `npm run lint`, `npm test`, and `npm run build` after the integration pass.
- [x] Remove explicit `runtime = "edge"` from API routes so OpenNext runtime resolution does not crash with `reading 'default'`.
- [ ] Apply/verify D1 migration for `contacts` table in production (`/api/contacts` now returns SQLite missing-table error).
- [x] Add left-panel block tree tab with select, drag-drop reordering, and delete actions.
- [ ] Confirm editor behavior manually for updated blocks and preview-only upload UX.
- [x] Add admin login/session/logout API with signed `admin_session` cookie support.
- [x] Restrict contacts, R2 image APIs, and email send APIs to authenticated admin sessions.
- [x] Add top-right account menu with sign-in/sign-out and session status in editor UI.
- [x] Keep templates/examples accessible while logged out; mute save with `Login required` tooltip.
- [x] Save/load named documents in R2 via `/api/r2/pages` with mandatory file name.

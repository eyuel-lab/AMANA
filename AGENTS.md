# AGENTS.md

## Project Context

This is a  app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## References

If your agent supports Agent Skills, install or update  skills before specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend  SDK client.
- `vite.config.js`: Vite config and  Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local  backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the  project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted  backend.
- Prefer the existing  CLI workflow over adding new npm scripts for specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new  integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

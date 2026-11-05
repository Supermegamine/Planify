# Planify — Static Demo

This branch contains a database-free demo of Planify, deployed as a static site with GitHub Pages.

## Expected demo URL

https://supermegamine.github.io/Planify/

This URL becomes available after the first successful Pages deployment.

## Demo behavior

- Dashboard, task board, habit tracker, daily standups, weekly calendar, and analytics.
- Seeded fictional sample data is created locally in the browser.
- Create, edit, delete, complete, drag, and reschedule interactions update the local demo data.
- Changes are stored in the browser's `localStorage`; they are not sent to a server and are not shared with other visitors.
- Use **Reset demo data** in the banner to restore the sample dataset.

There is no database, API server, or runtime backend in this demo. The original application and its Prisma/SQLite implementation remain on `main`.

## Deploy

The GitHub Actions workflow at `.github/workflows/deploy-demo.yml` builds the Next.js app as a static export and deploys the `out/` directory to GitHub Pages whenever `demo/github-pages` is updated.

One-time repository setup, if Pages is not already enabled:

1. Open **Settings → Pages** in the repository.
2. Set the build and deployment source to **GitHub Actions**.
3. Allow the `demo/github-pages` branch in **Settings → Environments → github-pages → Deployment branches and tags** (or allow all branches). This is required if the environment currently restricts deployments to `main`.
4. Push a commit to `demo/github-pages` or run **Deploy Planify demo to GitHub Pages** from the Actions tab.

The Next.js configuration uses the repository base path `/Planify`, so the published URL works for a project page.

## Run locally

```bash
npm ci
npm run dev
```

The browser demo store is initialized with sample data on first visit. To verify the production export locally:

```bash 
npm run build
npx serve out
```

## Notes

- This branch removes the API route handlers from the demo build and replaces database reads/writes with a shared client-side data store.
- Demo data is fictional. Avoid entering personal or sensitive information.
- Clearing this site's browser storage will also reset the demo data.

# Daily SEO content automation (n8n → Claude → GitHub → Vercel)

This folder contains an **importable n8n workflow** that publishes one original,
SEO-optimised article to The Bournemouth Guide every day, on autopilot.

```
Schedule (daily 09:00)
  → List existing posts (GitHub)      # so it never repeats a topic
  → Pick next topic                    # from your content plan, first unused
  → Generate with Claude (Opus 4.8)    # structured output = always-valid fields
  → Build post                         # validate + assemble Markdown + hero image
  → Commit to GitHub                   # push src/content/blog/<slug>.md
      → Vercel auto-rebuilds and deploys the new page
```

Every article automatically:
- targets a keyword (title + first sentence + subheadings),
- links internally to your hub pages (SEO internal-linking),
- funnels to **/accommodation** and includes **one** contextual link to
  `https://flexiestays.com` (varied anchor text). The site's rehype plugin
  ([../astro.config.mjs](../astro.config.mjs)) auto-applies `rel="sponsored"` to
  that link — you get the referral traffic without any link-scheme footprint.
- emits `FAQPage` structured data for rich results / AI answers.

If Claude ever returns something malformed, the **Build post** node throws and
**nothing is committed** — a bad file can never break your live build.

---

## One-time setup

### 1. Put the repo on GitHub (delivery pipeline)

The site is now a git repo. Create an empty GitHub repo, then:

```bash
git remote add origin https://github.com/<YOUR_USER>/bournemouth-guide.git
git push -u origin main
```

### 2. Connect Vercel to the GitHub repo

In the Vercel dashboard → your `bournemouth-guide` project → **Settings → Git** →
connect it to the GitHub repo above. From then on, **every push auto-deploys**.
(The project is already linked locally via `.vercel/`.)

### 3. Import the workflow into n8n

n8n → **Workflows → Import from File** → select
[`n8n-workflow.json`](./n8n-workflow.json).

### 4. Create two credentials in n8n (both are "Header Auth")

| Credential (Header Auth) | Header name     | Header value              |
| ------------------------ | --------------- | ------------------------- |
| **Anthropic**            | `x-api-key`     | your Anthropic API key    |
| **GitHub**               | `Authorization` | `Bearer <github_token>`   |

- Anthropic key: <https://console.anthropic.com> → API Keys.
- GitHub token: a fine-grained PAT with **Contents: Read and write** on the repo.

Then open each HTTP node and select the matching credential:
- **Generate with Claude** → Anthropic
- **List existing posts** and **Commit to GitHub** → GitHub

### 5. Edit the **Config** node

Set `owner`, `repo`, `branch` to your GitHub username, repo name, and build branch.

### 6. Test it

Click **Execute Workflow** once. It should create a new file under
`src/content/blog/` on GitHub and trigger a Vercel deploy. Then **Activate** the
workflow for the daily schedule.

---

## Managing the content plan

Open the **Pick next topic** node and edit the `TOPICS` array — each row is
`{ slug, title, keyword, category }`. Rows are published top-to-bottom, one per
day, skipping any slug that already exists. `category` must be one of:

```
things-to-do | food-and-drink | beaches | events | seasonal | family | wellness | walking | guides
```

When the list runs dry the workflow simply does nothing that day (no error) —
just add more rows. You can also swap the topic source for a Google Sheet/Airtable
later; only the **Pick next topic** node needs to change.

---

## Notes / tuning

- **Model**: `claude-opus-4-8` (highest quality). To cut cost per article, change
  `model` in the **Pick next topic** node to `claude-sonnet-5`.
- **Cadence**: change the **Every day 09:00** Schedule Trigger. Publishing in
  small daily batches (rather than dumping everything at once) is healthier for a
  young domain's indexing.
- **Quality bar**: the prompt lives in the **Pick next topic** node (`SYSTEM`).
  Tighten tone, add rules, or add few-shot examples there.
- **Regenerate the workflow** from source if needed: the generator is
  `scratchpad/build-workflow.mjs` (kept out of the repo).

## How this was verified

The full pipeline was dry-run against a mock Claude response: the generated
Markdown passed the Astro content schema, built cleanly, the Flexiestays link
came out `rel="sponsored noopener"`, the page had exactly one `<h1>`, and
`FAQPage` JSON-LD was emitted.

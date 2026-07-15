# Daily SEO content automation (n8n → LLM → GitHub → Vercel)

Two importable n8n workflows that publish one original, SEO-optimised article to
The Bournemouth Guide every day, on autopilot:

- **`n8n-workflow.json`** — uses **Claude** (Anthropic, `claude-opus-4-8`)
- **`n8n-workflow-openai.json`** — uses **OpenAI** (`gpt-4o`)

Both are identical except the generation node.

```
Every day 09:00 (Schedule Trigger)
  → Config (Code)                      # your owner / repo / branch
  → List existing posts (GitHub node)  # native node, so it never repeats a topic
  → Pick next topic (Code)             # first unused topic from your content plan
  → Generate with Claude/OpenAI (HTTP) # structured JSON output = always-valid fields
  → Build post (Code)                  # validate + assemble Markdown + hero image
  → Commit to GitHub (GitHub node)     # native node writes src/content/blog/<slug>.md
      → Vercel auto-rebuilds & deploys the new page
```

### Why these node choices

- **GitHub steps use the native GitHub node** (v1.1), not raw HTTP. It handles auth,
  base64 encoding and the commit for you — you just pass the file path + raw content.
- **The generation step is an HTTP Request node on purpose.** It's the only way to force
  a **strict JSON schema** (`response_format` / `output_config.format`), which is what
  guarantees the frontmatter is always valid. It authenticates with n8n's **built-in
  OpenAI / Anthropic credential** (`predefinedCredentialType`), so no manual header setup.
- If the model ever returns something malformed, the **Build post** node throws and
  **nothing is committed** — a bad file can never break your live build.

Every article automatically: targets a keyword (title + first sentence + subheadings),
links internally to your hub pages, funnels to **/accommodation**, includes **one**
contextual link to `https://flexiestays.com` (the site's rehype plugin auto-applies
`rel="sponsored"`), and emits `FAQPage` structured data.

---

## One-time setup

### 1. Put the repo on GitHub (delivery pipeline)

```bash
git remote add origin https://github.com/<YOUR_USER>/bournemouth-guide.git
git push -u origin main
```

### 2. Connect Vercel to the GitHub repo

Vercel dashboard → `bournemouth-guide` project → **Settings → Git** → connect the repo.
From then on, **every push auto-deploys**.

### 3. Import the workflow into n8n

n8n → **Workflows → Import from File** → pick `n8n-workflow-openai.json` (OpenAI) or
`n8n-workflow.json` (Claude).

### 4. Create the credentials in n8n

**GitHub** (used by both GitHub nodes):
1. First make the token on GitHub: profile → **Settings → Developer settings →
   Personal access tokens → Fine-grained tokens → Generate new token**. Give it
   **Only select repositories → your repo**, and **Repository permissions → Contents:
   Read and write**. Copy the token.
2. In n8n → **Credentials → Add credential** → search **"GitHub API"** → paste the token
   in **Access Token** → Save.

**OpenAI** (or **Anthropic** for the Claude workflow):
- n8n → **Credentials → Add credential** → search **"OpenAI"** → paste your API key → Save.
  (For the Claude file, search **"Anthropic"** instead.)

### 5. Attach the credentials to the nodes

- **List existing posts** and **Commit to GitHub** → select your **GitHub API** credential.
- **Generate with OpenAI** (or **Generate with Claude**) → select your **OpenAI** (or
  **Anthropic**) credential.

### 6. Edit the **Config** node

Set `owner`, `repo`, `branch` to your GitHub username, repo name, and build branch. The
GitHub nodes read these automatically, so you only set them once, here.

### 7. Test it

Click **Execute Workflow** once → it should create a new `src/content/blog/*.md` on GitHub
and trigger a Vercel deploy. Then **Activate** the workflow for the daily schedule.

---

## Managing the content plan

Open the **Pick next topic** node and edit the `TOPICS` array — each row is
`{ slug, title, keyword, category }`. Rows publish top-to-bottom, one per day, skipping any
slug that already exists. `category` must be one of:

```
things-to-do | food-and-drink | beaches | events | seasonal | family | wellness | walking | guides
```

When the list runs dry, the workflow simply does nothing that day (no error) — add more rows.

---

## Tuning

- **Model**: Claude workflow uses `claude-opus-4-8`; OpenAI uses `gpt-4o`. Change `model`
  in the **Pick next topic** node (OpenAI reasoning models need `max_completion_tokens`
  instead of `max_tokens`).
- **Cadence**: change the **Every day 09:00** Schedule Trigger. Publishing in small daily
  batches (vs. dumping everything at once) is healthier for a young domain's indexing.
- **Quality/tone**: the prompt is the `SYSTEM` string in the **Pick next topic** node.

## Verified

Both workflows were dry-run against mock model responses: the generated Markdown passed the
Astro content schema, built cleanly, the Flexiestays link came out `rel="sponsored noopener"`,
each page had exactly one `<h1>`, and `FAQPage` JSON-LD was emitted.

> Note: the exported JSON leaves credentials unset (you pick them per node after import) and
> the GitHub node's owner/repo are driven by the Config node via expressions. If your n8n is
> older than the GitHub node v1.1, re-select **Owner/Repository** in the two GitHub nodes.

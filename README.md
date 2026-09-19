# Lalo Proxy

A one-file serverless backend so Lalo (in MindSwapped) can call OpenAI
without exposing your API key in the browser.

## Deploy it (takes about 3 minutes)

1. **Get the code onto your machine.** Unzip this folder, or `cd` into it.

2. **Install the Vercel CLI** if you don't have it:
   ```
   npm install -g vercel
   ```

3. **Deploy from inside this folder:**
   ```
   cd lalo-proxy
   vercel
   ```
   Follow the prompts — log in / sign up if asked, accept the defaults
   (link to a new project is fine). It'll give you a URL like:
   ```
   https://lalo-proxy-yourname.vercel.app
   ```

4. **Add your API key as an environment variable** (don't skip this —
   without it the function returns an error instead of calling OpenAI):
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Open the `lalo-proxy` project → **Settings → Environment Variables**
   - Add:
     - `OPENAI_API_KEY` = your real key (`sk-...`)
     - *(optional)* `OPENAI_MODEL` = e.g. `gpt-4o-mini` (defaults to this if unset)
   - Save

5. **Redeploy so the env var takes effect:**
   ```
   vercel --prod
   ```

6. **Copy your endpoint URL.** Your function lives at:
   ```
   https://YOUR-PROJECT-NAME.vercel.app/api/lalo
   ```

7. **Paste that URL into `mindswapped.html`** — find `LALO_CONFIG` near
   the top of the `<script>` block and set:
   ```js
   const LALO_CONFIG = {
     endpoint: 'https://YOUR-PROJECT-NAME.vercel.app/api/lalo',
     systemPrompt: "..."
   };
   ```

That's it — Lalo will now call your proxy, which calls OpenAI, and the
key never touches the browser.

## Testing it directly

```bash
curl -X POST https://YOUR-PROJECT-NAME.vercel.app/api/lalo \
  -H "Content-Type: application/json" \
  -d '{"systemPrompt":"You are Lalo.","messages":[{"role":"user","text":"hi"}]}'
```

You should get back `{"reply": "..."}`. If you get an error about
`OPENAI_API_KEY`, double check step 4 and make sure you redeployed after
adding it.

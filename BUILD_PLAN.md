# Magicthon — Build Plan & Cursor Checklist
> One phase at a time. Do not start Phase N+1 until Phase N is visually done and manually tested.
> Each phase has a "Gate" — a check you must pass before moving on.

---

## Pre-Build (Do This First, No Code Yet)

- [ ] Create accounts: Supabase, OpenAI, Vercel, Railway (or Render)
- [ ] Create Supabase project, note down URL + service key + anon key
- [ ] Scaffold folder structure manually (don't let Cursor invent it):
  ```
  magicthon/
    frontend/   (Vite + React)
    backend/    (Node.js + Express)
  ```
- [ ] Copy `.cursorrules` into the root of both `frontend/` and `backend/`
- [ ] Create `.env` files in both folders with empty keys filled in
- [ ] Install base dependencies manually:
  - Frontend: `vite react react-dom primereact primeicons framer-motion konva react-konva @reduxjs/toolkit react-redux react-router-dom`
  - Frontend devDeps: `@playwright/test`
  - Backend: `express cors dotenv openai @supabase/supabase-js multer uuid`
- [ ] Import Bebas Neue + DM Sans from Google Fonts in `index.html`
- [ ] Import PrimeReact base CSS in `main.jsx`:
  ```js
  import 'primereact/resources/themes/lara-dark-indigo/theme.css'
  import 'primereact/resources/primereact.min.css'
  import 'primeicons/primeicons.css'
  import './styles/primereact-theme.css'  // our overrides, always last
  import './styles/globals.css'
  ```
- [ ] Create `src/styles/globals.css` with all CSS custom properties from `.cursorrules`
- [ ] Create `src/styles/primereact-theme.css` as an empty file (fill as we go)

**Gate: Both servers run (`npm run dev`) with no errors. You see a blank dark page.**

---

## Phase 1 — Upload Screen (UI Only, No Logic Yet)

> Goal: The upload screen looks finished. A judge could see this and think the app is done.

### Cursor Prompts to Use (in order):

**Prompt 1A — Layout shell:**
```
Create frontend/src/App.jsx and frontend/src/App.css.
The CSS must use only CSS variables from globals.css — no hardcoded values.
App shell: full viewport height, background var(--color-bg).
Top nav: "Magicthon" in var(--font-display), var(--color-accent) color.
Centered content area with max-width 960px, auto margins.
No routing yet, just the shell.
```

**Prompt 1B — Global CSS setup:**
```
Create frontend/src/styles/globals.css with all CSS custom properties from
the Visual Identity section of .cursorrules (colors, fonts, spacing, radii).
Also include: *, *::before, *::after { box-sizing: border-box; }
body { margin: 0; background: var(--color-bg); color: var(--color-text-primary);
  font-family: var(--font-body); }
Create frontend/src/styles/primereact-theme.css with these starter overrides:
  /* Override PrimeReact's default theme colors to match our design tokens */
  :root {
    --p-button-primary-background: var(--color-accent);
    --p-button-primary-color: #000000;
    --p-button-primary-hover-background: var(--color-accent-dark);
    --p-dialog-background: var(--color-card);
    --p-dialog-border-color: var(--color-border);
  }
```

**Prompt 1C — Upload zone:**
```
Create frontend/src/components/UploadZone.jsx and UploadZone.css.
Use PrimeReact's FileUpload component in headless mode (customUpload + itemTemplate props)
so we fully control the visual output.
Style it in UploadZone.css using BEM-lite classes and CSS vars only — no hardcoded values.
The zone: dashed border (var(--color-border)), rounded (var(--radius-lg)),
background var(--color-surface), centered content.
On hover: border color transitions to var(--color-accent), slight scale via Framer Motion.
Copy inside: "Drop your most chaotic photo here" in var(--font-display).
Below the zone: a small "paste from clipboard" text link and a webcam icon button (pi-camera).
On file selection: show the image thumbnail preview replacing the copy inside the zone.
No upload logic yet — local state only.
```

**Prompt 1D — Webcam modal:**
```
Create frontend/src/components/WebcamCapture.jsx and WebcamCapture.css.
Use PrimeReact's Dialog component for the modal shell.
Override its appearance in src/styles/primereact-theme.css
(do NOT put overrides in WebcamCapture.css).
Inside the Dialog: a live webcam feed using getUserMedia in a <video> element.
A circular "Capture" PrimeReact Button at the bottom.
On capture: canvas.toBlob() → File object → call onCapture(file) prop.
Use Framer Motion for the content inside the dialog fading in.
```

**Prompt 1E — Upload CTA:**
```
Below the UploadZone in App.jsx, add a PrimeReact Button:
label="Analyse this chaos →", size="large".
Override its appearance in primereact-theme.css:
  .p-button.analyze-cta {
    width: 100%;
    font-family: var(--font-display);
    font-size: 1.4rem;
    letter-spacing: 0.05em;
    background: var(--color-accent);
    color: #000;
    border: none;
  }
Disabled state: opacity 0.4, cursor not-allowed.
Add a Framer Motion wrapper for the scale-down active press effect.
No click logic yet — just visual states.
```

### Manual Tests Before Gate:
- [ ] Drop an image → thumbnail appears inside the zone
- [ ] Hover the zone → border turns yellow, slight scale
- [ ] Click webcam icon → modal opens with live camera feed
- [ ] Capture webcam photo → thumbnail appears in zone
- [ ] CTA button is muted with no photo, styled when photo is present
- [ ] Looks good on a 375px mobile screen

**Gate: Show this screen to someone. It should look like a real product, not a hackathon project.**

---

## Phase 2 — Backend: Scaffold + AI Endpoint

> Goal: POST an image to `/api/analyze`, get 6 structured meme suggestions back.

### Cursor Prompts to Use (in order):

**Prompt 2A — Express server:**
```
Create backend/src/index.js.
Express server on PORT from env.
Middleware: cors (allow VITE_FRONTEND_URL), express.json(), multer for file uploads.
Import and mount a router from backend/src/routes/meme.js at /api.
A GET /api/health endpoint that returns { status: "ok" }.
Central error handler middleware at the bottom.
```

**Prompt 2B — Template constants:**
```
Create frontend/src/constants/templates.js AND backend/src/constants/templates.js
(same file, copy it — we need it in both places).
Define 6 meme template config objects following the template system in .cursorrules.
Templates: drake, distracted-boyfriend, this-is-fine, woman-yelling-at-cat,
two-buttons, expanding-brain.
Each has: id, name, layout, photoPlacement, textZones (array of {id, label, defaultText}),
overlayStyle.
Export as a named array TEMPLATES and a helper getTemplateById(id).
```

**Prompt 2C — AI service:**
```
Create backend/src/services/aiService.js.
A single exported function: analyzeMeme(imageBuffer, mimeType).
It calls OpenAI GPT-4o vision with the image as base64.
The system prompt must:
  1. Tell the model to analyze the photo: describe the expression, energy, context, setting
  2. Show it the list of available template IDs from TEMPLATES
  3. Ask it to generate 6 meme suggestions, one per template
  4. Each suggestion: { templateId, topText, bottomText, reasoning }
  5. Return JSON only — no prose, no markdown fences
Validate the response is valid JSON with the right shape.
If malformed: retry once. If still broken: throw a structured error.
```

**Prompt 2D — Meme route:**
```
Create backend/src/routes/meme.js.
POST /analyze: accepts a multipart image upload via multer (memory storage).
Calls aiService.analyzeMeme with the buffer and mimetype.
Returns { suggestions: [...] } as JSON.
Keep this route thin — all logic is in aiService.
```

### Manual Tests Before Gate:
- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] POST a real photo to `/api/analyze` via Postman or curl
- [ ] Response has exactly 6 suggestions, each with templateId + topText + bottomText
- [ ] Template IDs in response match the ones in your constants file
- [ ] A bad/corrupted image returns a clean error JSON, not a crash

**Gate: The AI endpoint works reliably for 3 different photos.**

---

## Phase 3 — Suggestions UI (Connect Frontend to Backend)

> Goal: Upload a photo, click analyze, see 6 beautiful meme suggestion cards appear.

### Cursor Prompts to Use (in order):

**Prompt 3A — API service:**
```
Create frontend/src/services/memeService.js.
A function analyzeMeme(file) that POSTs the file as FormData to
VITE_API_URL/api/analyze.
Returns the suggestions array.
Throws a structured error if the request fails.
```

**Prompt 3B — Suggestions hook:**
```
Create frontend/src/hooks/useMemeSuggestions.js.
Manages: suggestions (array), isLoading (bool), error (string|null).
Exposes: analyze(file) function that calls memeService.analyzeMeme.
Sets loading true while request is in flight.
Populates suggestions on success, error message on failure.
```

**Prompt 3C — Loading screen:**
```
Create frontend/src/components/AnalysisLoading.jsx and AnalysisLoading.css.
Full-screen overlay that appears while the AI is thinking.
Animated text that cycles through these phrases every 1.5s with Framer Motion:
  "Consulting the meme council...",
  "Analysing your chaotic energy...",
  "Cross-referencing 47 subreddits...",
  "Calibrating the absurdity dial...",
  "Almost there — picking the sharpest format..."
Below the text: a row of 6 PrimeReact Skeleton components (shape="rectangle")
styled in primereact-theme.css to match our dark card color.
Use Framer Motion AnimatePresence for the phrase transitions.
```

**Prompt 3D — Suggestion card:**
```
Create frontend/src/components/SuggestionCard.jsx and SuggestionCard.css.
Props: suggestion (object), userPhoto (File), onClick.
A plain div (not a PrimeReact Card — we need full CSS control).
Class: suggestion-card. Style in SuggestionCard.css using CSS vars only.
Background: var(--color-card), border: 1px solid var(--color-border),
border-radius: var(--radius-md).
Shows: template name (.suggestion-card__label in var(--font-display)),
top text + bottom text in separate styled divs.
A placeholder box (.suggestion-card__preview) where the mini canvas will go (Phase 4).
Hover state in CSS: border-color transitions to var(--color-accent).
Wrap in Framer Motion motion.div for the scale + shadow lift on hover.
Active/click: scale 0.98 micro-press via Framer Motion.
```

**Prompt 3E — Suggestions grid:**
```
Create frontend/src/components/SuggestionsGrid.jsx and SuggestionsGrid.css.
Receives: suggestions (array), userPhoto (File), onSelect (fn).
Renders 6 SuggestionCards in a CSS Grid:
  .suggestions-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-4); }
  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
At the top: a heading "The meme council has spoken" in var(--font-display).
Cards animate in with a staggered fade+slide-up (Framer Motion, stagger 0.08s).
```

**Prompt 3F — Redux store setup:**
```
Create frontend/src/store/index.js.
Use configureStore from Redux Toolkit.
Import and combine: uploadSlice, suggestSlice, editorSlice, shareSlice.
Wrap <App /> in <Provider store={store}> in main.jsx.

Create frontend/src/store/uploadSlice.js.
State: { file: null, previewUrl: null, status: 'idle' }
Actions: setFile(file), clearFile().
Selector: selectUploadFile, selectPreviewUrl.
No thunks needed — upload is local only.

Create frontend/src/store/suggestSlice.js.
State: { suggestions: [], status: 'idle', error: null }
Thunk using createAsyncThunk:
  export const analyzePhoto = createAsyncThunk(
    'suggest/analyzePhoto',
    async (file, { rejectWithValue }) => {
      try { return await memeService.analyzeMeme(file) }
      catch (err) { return rejectWithValue(err.message) }
    }
  )
Handle all 3 cases in extraReducers: pending → status:'loading',
fulfilled → status:'succeeded' + store suggestions,
rejected → status:'failed' + store error message.
Selectors: selectSuggestions, selectSuggestStatus, selectSuggestError.
```

**Prompt 3G — Wire it up:**
```
In App.jsx, derive the current view from Redux state (not local state):
  - No file selected → "upload" view
  - suggestStatus === 'loading' → "loading" view
  - suggestStatus === 'succeeded' → "suggestions" view
  - editorSlice has a selectedTemplate → "editor" view
Use useSelector with named selectors from each slice.
When the CTA button is clicked: dispatch(analyzePhoto(file)).
Use Framer Motion AnimatePresence to transition between views.
When a SuggestionCard is clicked: dispatch(setSelectedTemplate(suggestion)) → editor view.
```

### Manual Tests Before Gate:
- [ ] Upload a photo → click analyze → loading screen appears with cycling text
- [ ] After ~5s → 6 cards stagger in beautifully
- [ ] Each card shows the template name and both text zones
- [ ] Hover/click states on cards feel responsive
- [ ] If the backend is down → a clear error message appears, not a crash
- [ ] Full flow works on a 375px mobile screen

**Gate: The loading → suggestions transition feels like a product reveal, not a spinner.**

---

## Phase 4 — Canvas Editor

> Goal: Click a suggestion → open the canvas editor → edit text → it feels tactile.

### Cursor Prompts to Use (in order):

**Prompt 4A — Canvas helpers:**
```
Create frontend/src/lib/canvasHelpers.js.
Helper functions for the Konva canvas:
- buildTextConfig(textZone, value): returns a Konva Text config object
  with Impact font, white fill, black stroke (outline), shadow, line wrapping.
- buildImageConfig(src, stageWidth, stageHeight): returns a Konva Image config
  sized to fill the stage while maintaining aspect ratio.
- getTemplateLayers(template, photoSrc, textValues): returns the full
  layer config for a given template — image layer + text layers.
No Konva imports here — just plain config objects.
```

**Prompt 4B — Canvas editor component:**
```
Create frontend/src/components/CanvasEditor.jsx.
Props: template (object), userPhoto (File), initialTexts (object keyed by zone id).
Uses react-konva: Stage → Layer → Image + Text elements.
Stage is 600x600 on desktop, full-width square on mobile.
User's photo fills the background.
Each textZone renders as a draggable, editable Konva Text node.
Click a text node → show an input panel below the canvas (not inline editing).
The input panel has: a textarea for the text, font size slider (20-100), 
8 color swatches (white, black, yellow, red, cyan, green, pink, orange).
No full color picker — curated swatches only.
Cmd+Z / Ctrl+Z: undo last text change (keep a history array in state).
```

**Prompt 4C — Editor toolbar:**
```
Create frontend/src/components/EditorToolbar.jsx and EditorToolbar.css.
A row below the canvas with:
- "← Back" PrimeReact Button (text variant, no background)
- Template name label in var(--font-display), var(--color-accent)
- "Export PNG" PrimeReact Button (primary, class "analyze-cta" from theme)
- "Share" PrimeReact Button (outlined variant, disabled until export done — Phase 5)
On mobile: stack vertically using CSS flex-direction column.
Export PNG: stage.toDataURL() → download link click. Also clipboard copy.
After copy: use PrimeReact Toast (ref passed from parent) to show "Copied to clipboard ✓".
```

**Prompt 4D — Editor Redux slice:**
```
Create frontend/src/store/editorSlice.js.
State: {
  selectedTemplate: null,   // full template config object
  textValues: {},           // { [zoneId]: string }
  history: [],              // array of past textValues snapshots (for undo)
  historyIndex: -1
}
Actions:
  setSelectedTemplate(suggestion) — sets template + initialises textValues from suggestion texts
  updateText({ zoneId, value }) — updates one text zone, pushes to history
  undo() — steps back through history array
  clearEditor() — resets all to initial state
Selectors: selectTemplate, selectTextValues, selectCanUndo.
No thunks — all editor state is local/synchronous.
```

**Prompt 4E — Editor page:**
```
Create frontend/src/pages/EditorPage.jsx.
Use useSelector(selectTemplate) and useSelector(selectTextValues) for data.
Use useDispatch to dispatch updateText and undo actions.
Renders CanvasEditor + EditorToolbar.
Animate in from right with Framer Motion when the view switches to "editor".
```

### Manual Tests Before Gate:
- [ ] Click a suggestion → editor opens with photo + text on canvas
- [ ] Drag text around → it moves smoothly, no lag
- [ ] Click text → input panel appears below canvas
- [ ] Change text → canvas updates live
- [ ] Font size slider → text scales smoothly
- [ ] Color swatches → text color changes instantly
- [ ] Undo works (Cmd+Z)
- [ ] Export PNG → file downloads and looks like a real meme
- [ ] Canvas is touch-draggable on mobile

**Gate: Export a meme. It should look like something you'd actually post.**

---

## Phase 5 — Share Link + Supabase

> Goal: Click "Share" → get a unique URL → open it → see the meme.

### Cursor Prompts to Use (in order):

**Prompt 5A — Supabase setup:**
```
Create backend/src/lib/supabase.js.
Initialize and export a Supabase client using SUPABASE_URL and SUPABASE_SERVICE_KEY.
Create backend/src/lib/db.js with helper functions:
  - saveMeme({ imageUrl, templateId, texts, creatorId }): inserts into memes table, returns id
  - getMeme(id): returns meme row by id
  - addReaction(memeId, emoji): upserts into reactions table
  - getReactions(memeId): returns reaction counts grouped by emoji
```

**Prompt 5B — Supabase schema (run this SQL in Supabase dashboard):**
```sql
-- Paste this into Supabase SQL editor and run it
create table memes (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  template_id text not null,
  texts jsonb not null,
  created_at timestamptz default now()
);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  meme_id uuid references memes(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now()
);

create index on reactions(meme_id);
```

**Prompt 5C — Share service + route:**
```
Create backend/src/services/shareService.js.
Function shareMeme({ imageBuffer, mimeType, templateId, texts }):
  1. Uploads the image buffer to Supabase Storage bucket "memes"
  2. Gets the public URL
  3. Calls db.saveMeme with the URL and metadata
  4. Returns { id, shareUrl: FRONTEND_URL/m/${id} }

Create backend/src/routes/share.js.
POST /share: accepts multipart (image + JSON metadata), calls shareService.shareMeme, returns result.
GET  /share/:id: calls db.getMeme(id), returns meme data.
POST /react/:id: accepts { emoji } body, calls db.addReaction, returns updated counts.
GET  /react/:id: calls db.getReactions, returns counts.
Mount these routes in index.js.
```

**Prompt 5D — Frontend share service + Redux slice:**
```
Create frontend/src/services/shareService.js.
Function shareMeme(canvasDataUrl, templateId, texts):
  - Converts dataUrl to a Blob
  - POSTs to VITE_API_URL/api/share with FormData (image + metadata as JSON string)
  - Returns { shareUrl, id }
Function getReactions(memeId): GETs /api/react/:id, returns reaction counts.
Function addReaction(memeId, emoji): POSTs { emoji } to /api/react/:id.

Create frontend/src/store/shareSlice.js.
State: { shareId: null, shareUrl: null, reactions: {}, status: 'idle', error: null }
Thunks:
  shareMeme({ dataUrl, templateId, texts }) — calls shareService.shareMeme
  fetchReactions(memeId) — calls shareService.getReactions
  addReaction({ memeId, emoji }) — optimistic update first, then calls shareService.addReaction
Selectors: selectShareUrl, selectShareId, selectReactions, selectShareStatus.
```

**Prompt 5E — Share flow in editor:**
```
In EditorToolbar.jsx, wire up the Share button:
- On click: export canvas to dataUrl, dispatch(shareMeme({ dataUrl, templateId, texts }))
- Derive button loading state from useSelector(selectShareStatus) === 'loading'
- Show PrimeReact Button loading spinner ("Generating link...")
- On selectShareStatus === 'succeeded': open the ShareModal
Create frontend/src/components/ShareModal.jsx and ShareModal.css.
Use PrimeReact Dialog. Override appearance in primereact-theme.css only.
Inside: useSelector(selectShareUrl) displayed in a readonly input.
"Copy link" PrimeReact Button → clipboard copy → PrimeReact Toast "Link copied ✓".
Below: the live reaction preview (Phase 6 adds the live data).
```

### Manual Tests Before Gate:
- [ ] Click Share in editor → loading state appears on button
- [ ] Modal appears with a real URL (not localhost if testing prod)
- [ ] Open that URL in an incognito window → meme loads correctly
- [ ] The share page looks good (test the og:image meta tag too)
- [ ] Supabase Storage has the image file
- [ ] Supabase DB has the memes row

**Gate: Share a meme URL with someone else. They should be able to open it cold with no context and see the meme.**

---

## Phase 6 — Reactions + Live Updates

> Goal: Anyone on the share page can react. Creator sees it live.

### Cursor Prompts to Use (in order):

**Prompt 6A — Share page:**
```
Create frontend/src/pages/SharePage.jsx and SharePage.css.
Route: /m/:memeId (set up React Router in App.jsx now).
On mount: fetch meme data from /api/share/:id, show the meme image full-width.
Below the meme: 5 PrimeReact Buttons as reaction options (😂 🔥 💀 👏 🤌).
Style the reaction buttons in primereact-theme.css:
  .p-button.reaction-btn { background: var(--color-card); border: 1px solid var(--color-border); ... }
  .p-button.reaction-btn:hover { border-color: var(--color-accent); }
Each button shows the emoji + current count as the label.
Clicking a button: calls shareService.addReaction, optimistically increments count.
No login, no rate limiting for now.
```

**Prompt 6B — Live reaction hook:**
```
Create frontend/src/hooks/useReactions.js.
Props: memeId.
Uses Supabase Realtime to subscribe to new rows in the reactions table
filtered by meme_id.
On new row: updates local reaction counts.
Exposes: reactions (object keyed by emoji), addReaction(emoji) function.
Also does an initial fetch of existing counts on mount.
Clean up the subscription on unmount.
```

**Prompt 6C — Creator live view:**
```
Add a "See reactions live" section to the ShareModal.jsx.
After sharing, dispatch(fetchReactions(shareId)) on mount.
Show reaction counts from useSelector(selectReactions).
The useReactions hook (Phase 6B) dispatches a Redux action on each Realtime event:
  dispatch({ type: 'share/reactionReceived', payload: { emoji } })
Handle this in shareSlice extraReducers to increment the count.
Reaction counts animate up with Framer Motion spring (use AnimatePresence + motion.span).
A small pulsing green dot to indicate the live connection.
```

### Manual Tests Before Gate:
- [ ] Open share page, click a reaction → count increments immediately
- [ ] Open the creator's ShareModal and the share page in two windows side by side
- [ ] React on the share page → count updates in the ShareModal within 1–2 seconds
- [ ] Reactions survive a page refresh (they're persisted in Supabase)
- [ ] The share page looks good on mobile

**Gate: The live reaction loop works. This is the most impressive feature — it should feel magical.**

---

## Phase 7 — Mobile Polish

> Goal: The entire loop — upload → analyze → edit → share → react — works on a phone.

### Cursor Prompts to Use (in order):

**Prompt 7A:**
```
Audit every component's CSS file for mobile layout issues.
Specific fixes needed:
- CanvasEditor.css: Stage width = min(window.innerWidth - 32, 600). Recalculate on resize.
  Use a useEffect + ResizeObserver to update stage dimensions reactively.
- EditorToolbar.css: add @media (max-width: 767px) { flex-direction: column; gap: var(--space-3); }
- SuggestionsGrid.css: confirm 1 column at base, 2 at 768px, 3 at 1200px
- SharePage.css: reaction buttons min 48x48px touch targets
  (.p-button.reaction-btn { min-width: 48px; min-height: 48px; })
  Add this override to primereact-theme.css, not SharePage.css.
- UploadZone.css: full width at mobile, comfortable padding
- All PrimeReact Dialog components: max-height: 90vh; overflow-y: auto on mobile
  Add to primereact-theme.css: @media (max-width: 767px) { .p-dialog { max-height: 90vh; } }
Test at 375px viewport width. Fix anything that overflows or feels cramped.
```

### Manual Tests Before Gate:
- [ ] Upload a photo on a real phone (not just DevTools)
- [ ] Suggestions grid scrolls smoothly on mobile
- [ ] Canvas editor — text is draggable with a finger
- [ ] Text editing input is reachable and doesn't get covered by keyboard
- [ ] Export works on mobile
- [ ] Share link opens correctly in mobile browser
- [ ] Reacting on mobile feels like tapping a proper button (not a tiny link)

**Gate: Do the entire flow on your phone with no laptop open. If anything frustrates you, fix it.**

---

## Phase 8 — Wildcard (If Time Permits)

Pick ONE. Do it properly, not halfway.

### Option A — "I'm Feeling Lucky" 🎰 (Recommended — highest impact, least effort)
```
Add a "🎰 Surprise me" button on the upload screen.
On click: auto-selects the first (highest-confidence) suggestion from the AI.
Auto-applies it to the canvas with a satisfying animation.
User lands straight in the editor, ready to share.
This is a one-click meme machine. Judges will love demoing it.
```

### Option B — Live Meme Wall 🏆
```
Create frontend/src/pages/WallPage.jsx at route /wall.
Shows all memes created today, sorted by total reaction count.
Auto-refreshes every 30s using Supabase Realtime on the memes table.
Each entry: meme thumbnail + reaction totals + time since creation.
Add a link to the Wall in the top nav.
```

### Option C — Meme Preview in Suggestion Cards (Should Have Done Earlier)
```
In SuggestionCard.jsx, render an actual mini canvas preview using Konva.
Scale it down to ~200x200 — user sees exactly what the meme will look like.
This replaces the placeholder box added in Phase 3D.
```

---


---

## Phase 9 — Playwright Tests (If Time Permits)

> Goal: Automated tests for the 4 most critical user flows. Run them, fix what breaks.

### Setup

```bash
cd frontend
npx playwright install --with-deps chromium
```

Create `frontend/playwright.config.js`:
```js
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
```

Create `frontend/tests/e2e/` folder.

---

### Test 1 — Upload Flow
**File:** `tests/e2e/upload.spec.js`

```
Cursor prompt:
"Create a Playwright test file at frontend/tests/e2e/upload.spec.js.
Test: 'should accept a photo upload and show the analyze button active'
  - Navigate to /
  - Assert the upload zone is visible
  - Use page.setInputFiles() to attach a test image (use a small JPG from tests/fixtures/)
  - Assert the thumbnail preview appears inside the upload zone
  - Assert the 'Analyse this chaos →' button is no longer disabled

Test: 'should show an error state if no file is selected and submit is forced'
  - Navigate to /
  - The CTA button should be disabled — assert it has the disabled attribute

Add a fixture image: copy a small test JPG to frontend/tests/fixtures/test-photo.jpg"
```

**Checklist:**
- [ ] Test runs with `npx playwright test upload.spec.js`
- [ ] Both cases pass green
- [ ] Fixture image exists at `tests/fixtures/test-photo.jpg`

---

### Test 2 — Suggestion Cards Render
**File:** `tests/e2e/suggestions.spec.js`

```
Cursor prompt:
"Create frontend/tests/e2e/suggestions.spec.js.
This test mocks the backend API so it doesn't need a real OpenAI call.

Before the test: use page.route() to intercept POST /api/analyze
and return a fixture JSON response with 6 mock suggestions
(use realistic templateIds matching constants/templates.js).

Test: 'should show 6 suggestion cards after upload and analyze'
  - Navigate to /
  - Attach test-photo.jpg via setInputFiles
  - Click the CTA button
  - Assert the loading screen appears (check for one of the loading phrases)
  - Assert exactly 6 .suggestion-card elements appear
  - Assert each card has a visible template name label and two text zones

Test: 'should navigate to editor when a suggestion card is clicked'
  - Same setup as above
  - Click the first suggestion card
  - Assert the canvas editor is now visible
  - Assert the EditorToolbar is visible"
```

**Checklist:**
- [ ] API is mocked — test never hits real OpenAI
- [ ] Loading state is asserted (not skipped)
- [ ] 6 cards are counted exactly
- [ ] Click → editor transition is confirmed

---

### Test 3 — Canvas Editor Interactions
**File:** `tests/e2e/editor.spec.js`

```
Cursor prompt:
"Create frontend/tests/e2e/editor.spec.js.
Reuse the page.route() mock from suggestions.spec.js for /api/analyze.

Test: 'should update canvas text when input is changed'
  - Navigate to editor (upload → analyze → click first card)
  - Find the first text input in the editor panel
  - Clear it and type 'Playwright was here'
  - Assert the canvas stage contains a text element with 'Playwright was here'
  (Konva renders to canvas — check the input value reflects the change,
  since reading canvas pixel content directly is fragile)

Test: 'should enable the Export PNG button after canvas loads'
  - Navigate to editor
  - Assert the Export PNG button is visible and not disabled

Test: 'should trigger a file download when Export PNG is clicked'
  - Navigate to editor
  - Listen for the download event: const downloadPromise = page.waitForEvent('download')
  - Click Export PNG
  - Await the download — assert the filename ends with .png"
```

**Checklist:**
- [ ] Text input → canvas update is verified
- [ ] Export PNG triggers an actual download event
- [ ] Tests don't depend on canvas pixel inspection

---

### Test 4 — Share Link and Reaction Flow
**File:** `tests/e2e/share.spec.js`

```
Cursor prompt:
"Create frontend/tests/e2e/share.spec.js.
Mock both /api/analyze (same fixture as above) and /api/share to return:
  { id: 'test-meme-123', shareUrl: 'http://localhost:5173/m/test-meme-123' }
Mock GET /api/share/test-meme-123 to return the meme fixture data.
Mock GET /api/react/test-meme-123 to return { '😂': 3, '🔥': 1 }.
Mock POST /api/react/test-meme-123 to return { '😂': 4, '🔥': 1 }.

Test: 'should show share modal with a URL after clicking Share'
  - Full flow: upload → analyze → select card → click Share button
  - Assert ShareModal appears
  - Assert the URL input contains 'test-meme-123'
  - Click 'Copy link' — assert the Toast appears with 'copied' text

Test: 'should load the share page and show reaction buttons'
  - Navigate directly to /m/test-meme-123
  - Assert the meme image is visible
  - Assert 5 reaction buttons are visible
  - Assert '😂 3' and '🔥 1' reaction counts are shown

Test: 'should optimistically increment reaction count on click'
  - Navigate to /m/test-meme-123
  - Note the current 😂 count (3)
  - Click the 😂 reaction button
  - Assert the count immediately shows 4 (optimistic update)
  — do not wait for API response"
```

**Checklist:**
- [ ] All API calls are mocked — no real Supabase or backend needed
- [ ] Share URL appears in the modal input
- [ ] Reaction counts render from mock data
- [ ] Optimistic update is verified without waiting for network

---

### Running All Tests

```bash
# Run all tests headless
npx playwright test

# Run with UI (great for debugging)
npx playwright test --ui

# Run a single file
npx playwright test upload.spec.js

# See HTML report
npx playwright show-report
```

Add to `frontend/package.json`:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

**Gate: At least Tests 1 and 2 pass green. Tests 3 and 4 are bonus if time allows.**

---
## Final Checklist Before Submitting

### Functionality
- [ ] Photo upload works (drag, click, clipboard paste, webcam)
- [ ] AI returns 6 distinct suggestions with photo-aware captions
- [ ] Canvas editor: draggable text, font size, color swatches, undo
- [ ] Export PNG downloads correctly
- [ ] Copy to clipboard works
- [ ] Share URL is unique and works in incognito
- [ ] Reactions work without login
- [ ] Creator sees reactions live (Supabase Realtime working)
- [ ] Full loop works on a real phone

### Polish
- [ ] Loading states exist for every async operation (PrimeReact Skeleton + custom copy)
- [ ] Error states use PrimeReact Toast — never silent failures
- [ ] No hardcoded colors or spacing anywhere — all CSS vars
- [ ] No broken layouts at 375px, 768px, 1440px
- [ ] All PrimeReact overrides are in primereact-theme.css only
- [ ] Meme suggestions feel funny and photo-specific (test with 5 different photos)
- [ ] Exported meme looks postable (right fonts, good text contrast)
- [ ] Share page has correct og:title and og:image meta tags

### Deploy
- [ ] Frontend deployed to Vercel, env vars set
- [ ] Backend deployed to Railway/Render, env vars set
- [ ] Supabase Storage bucket is public
- [ ] CORS on backend allows the Vercel frontend URL
- [ ] Test the full flow on the production URL (not localhost)

### Submit
- [ ] Submit the live production URL (not localhost, not a repo link)
- [ ] Test the URL one final time from an incognito window on your phone

---

## Cursor Usage Tips During the Build

- **Start each session** by telling Cursor: "We're in Phase X. Here's what's done: [list]. Now do Prompt XY."
- **After each prompt**, manually test before running the next prompt
- **If Cursor goes off-script**, say: "Stop. Revert to the pattern in [nearest similar file]. Do not add new dependencies."
- **If a file hits 150 lines**, say: "This file is too long. Split [specific logic] into a new file at [path]."
- **Never let Cursor build two phases at once** — it will invent architecture you didn't ask for

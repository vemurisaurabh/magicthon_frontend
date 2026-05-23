# Project Requirements & Cursor Execution Roadmap

Please use this table to prioritize code generation. Focus exclusively on the **Active Roadmap (P0 to P6)** in strict priority order. 

> ⚠️ **CRITICAL:** Do not write code, refactor, or touch features marked as **DEFERRED** (P7, P8, P9) during this phase.

## 🚀 Active Roadmap

| Priority | Feature / Item | Current Status | Non-Negotiable Requirement for Cursor |
| :--- | :--- | :--- | :--- |
| **`[P0]`** | **Canvas Editor** | ❌ Not started | Build a meme editor using `react-konva`. Text must be draggable, editable, and support text outline (stroke), drop shadows, and automatic line wrapping. |
| **`[P1]`** | **Live Previews** | ❌ Not started | Show real-time visual previews of every generated text suggestion rendered on top of the user's actual uploaded photo. |
| **`[P2]`** | **Vision LLM API** | ❌ Needs testing plan | Send the image to a Vision LLM (OpenAI). The model must return strictly structured JSON meme suggestions—never a wall of text. Provide a mock method to test this. |
| **`[P3]`** | **Advanced Inputs** | 🟡 Upload works | Keep the current file upload, but implement clipboard image pasting (`Ctrl+V`) and native webcam capture streams. |
| **`[P4]`** | **Dynamic Recipes** | 🟡 Static templates done | Refactor the 6 templates. Instead of a static list, they must be dynamic "recipes" that adapt visually depending on the content of the attached photo. |
| **`[P5]`** | **Live Reactions Feed**| ❌ Clarification needed | Create a live UI indicator or micro-dashboard that shows incoming public reactions to the creator in real-time as they land. |
| **`[P6]`** | **Mobile Optimization**| ❌ Not optimized | Refactor the canvas layout and toolbars to be completely thumb-friendly and responsive. It must function flawlessly on mobile screens. |

---

## 🚫 Deferred Items (DO NOT TOUCH)

| Priority | Feature / Item | Current Status | Instruction |
| :--- | :--- | :--- | :--- |
| **`[P7]`** | **Export & Copy** |  Completed | Skip entirely. Works fine. UX tweaks to the share button will happen later. |
| **`[P8]`** | **Shareable Links**|  Completed | Skip entirely. Public links and anonymous reactions work fine. |
| **`[P9]`** | **Tech Stack Choice**|  Completed | Skip entirely. Confirmed on React/Vite, Express, Supabase, and OpenAI. |
# ux-spec.md — Todo App UX Specification

**Version:** 1.0
**Author:** Sally (UX Designer Persona) via BMAD v6
**Date:** March 2026
**Input:** PRD.md v1.0

---

## 1. Overview

The Todo App is a single-page application. Everything happens on one screen. There are no navigation menus, no settings pages, no modals (except inline error messages). The user lands on the app and immediately sees their list — or a helpful empty state if no todos exist yet.

The experience is designed to feel instant and effortless. The UI stays out of the way and lets the tasks speak for themselves.

---

## 2. Page Layout

The layout is centred and constrained — a single column of content, max-width 640px, centred horizontally on the page. On mobile it fills the full width with comfortable side padding.

```
┌─────────────────────────────────────┐
│           App Header                │  ← Title: "My Todos"
├─────────────────────────────────────┤
│           Add Todo Input            │  ← Text input + Add button
├─────────────────────────────────────┤
│           Error Banner (if any)     │  ← Only shown on API error
├─────────────────────────────────────┤
│           Loading State / List      │  ← Spinner OR todo items
│                                     │
│           (Empty State if empty)    │
└─────────────────────────────────────┘
```

---

## 3. Components

### 3.1 App Header

- Displays the app title: **"My Todos"**
- Static — no interaction
- Sits at the top of the content column

### 3.2 Add Todo Input

This is the primary action area. It sits at the top, always visible, so the user can add a task at any time without scrolling.

**Elements:**
- A text input field with placeholder text: *"What needs doing?"*
- An "Add" button to the right of the input

**Behaviour:**
- Pressing Enter while the input is focused submits the form (same as clicking Add)
- If the input is empty or whitespace-only, submission is blocked — the field shakes gently and shows an inline hint: *"Please enter a task"*
- On successful submission, the input clears and focus returns to the input field
- The Add button is visually disabled (greyed out) when the input is empty

### 3.3 Todo List

A vertical list of todo items, sorted newest first (most recently added at the top).

**Each todo item contains:**
- A checkbox on the left (toggles completed state)
- The todo title text in the centre
- A delete button on the right (a small ✕ or trash icon)

**Completed item appearance:**
- Title text has a strikethrough
- Text colour is muted/greyed out
- Checkbox is checked
- The item does not move position in the list — it stays where it is

**Interaction:**
- Clicking the checkbox immediately toggles the completed state (optimistic UI encouraged)
- Clicking delete immediately removes the item — no confirmation dialog
- On hover, the delete button becomes more visible (it can be subtle by default)

### 3.4 Empty State

Shown when the todo list has zero items.

**Content:**
- A simple illustrative icon (e.g. a clipboard or checkmark — can be an SVG or emoji)
- Heading: *"Nothing here yet"*
- Subtext: *"Add your first task above to get started"*

This should feel friendly and helpful, not like an error.

### 3.5 Loading State

Shown while the initial list of todos is being fetched from the API.

**Content:**
- A simple spinner or skeleton placeholder where the list will appear
- No text needed — the spinner is self-explanatory

This replaces the todo list area only — the header and input remain visible so the user can start typing if they want.

### 3.6 Error Banner

Shown when an API call fails (create, update, delete, or initial load).

**Content:**
- A subtle banner below the input area
- Text: *"Something went wrong. Please try again."*
- A small ✕ button to dismiss the banner
- Colour: soft red/warning — noticeable but not alarming

**Behaviour:**
- Does not replace the UI — shown inline above the list
- Auto-dismisses after 5 seconds, or can be manually dismissed
- If the initial load fails, the empty state is shown beneath the error banner

---

## 4. Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Desktop (≥1024px) | Centred column, max-width 640px, generous padding |
| Tablet (768px–1023px) | Same as desktop — layout holds well |
| Mobile (≥375px) | Full width, 16px side padding, touch targets ≥44px |

**Touch targets:** All interactive elements (checkbox, delete button, add button) must be at least 44×44px on mobile to meet touch usability standards.

**Input + button on mobile:** The Add button stays next to the input field — it does not stack below it. Use `flex` layout to ensure this.

---

## 5. Visual Design Principles

This spec does not mandate a specific visual style — that is left to the implementation. However, the following principles should guide all design decisions:

- **High contrast text** — readable in all lighting conditions
- **Clear visual hierarchy** — the input is prominent, the list is readable, completed items recede
- **Minimal decoration** — no gradients, no heavy shadows, no unnecessary borders
- **Accessible colour** — all text/background combinations must meet WCAG AA contrast ratios (4.5:1 for normal text)
- **Consistent spacing** — use a spacing scale (e.g. 4px, 8px, 16px, 24px, 32px)

---

## 6. Interaction States Summary

| Element | Default | Hover | Active/Focus | Disabled |
|---|---|---|---|---|
| Add button | Styled, enabled | Slightly darker | Focus ring | Greyed out (empty input) |
| Text input | Bordered | Border darkens | Focus ring + border highlight | N/A |
| Checkbox | Unchecked circle | Slight fill preview | Checked + strikethrough on title | N/A |
| Delete button | Subtle / low opacity | Full opacity, red tint | Scales down slightly | N/A |

---

## 7. Accessibility Requirements

- All interactive elements must be keyboard navigable (Tab, Enter, Space)
- Checkboxes must use a proper `<input type="checkbox">` or ARIA equivalent
- The delete button must have an accessible label (e.g. `aria-label="Delete todo"`)
- The error banner must use `role="alert"` so screen readers announce it
- The loading spinner must have `aria-label="Loading todos"` and `role="status"`
- Colour alone must not be the only indicator of state (completed items use strikethrough text, not just grey colour)

---

## 8. User Journey Map

```
User opens app
    │
    ├─ Todos exist?
    │       ├─ Yes → Show list (newest first)
    │       ├─ No  → Show empty state
    │       └─ Loading → Show spinner
    │
    ├─ User types in input → Add button enables
    │       └─ Submits → Todo appears at top of list → Input clears
    │
    ├─ User clicks checkbox → Todo gets strikethrough → Checkbox checks
    │       └─ Clicks again → Todo reverts to active
    │
    └─ User clicks delete → Todo disappears immediately
```

---

## 9. Out of Scope for UX (v1)

Matching the PRD, the following UX patterns are NOT designed in this version:

- Filtering or searching todos
- Drag-and-drop reordering
- Confirmation dialogs
- Authentication / login screens
- Notifications or toasts for success states (error states are covered)

---

*Save this file as `ux-spec.md` and add it to your project knowledge files before starting the Architect chat.*

# Equipment Management Application - Design Guidelines

## Design Approach: Utility-First System Design

**Selected Framework:** Material Design with Linear-inspired data table aesthetics  
**Rationale:** This is a utility-focused, information-dense internal tool prioritizing efficiency, clarity, and data readability over visual flair. The design should emphasize clean data presentation, intuitive forms, and minimal cognitive load.

**Core Principles:**
- Function over form: Every design decision serves usability
- Information hierarchy: Data is the hero, UI recedes
- Efficiency: Minimize clicks and cognitive effort
- Consistency: Predictable patterns throughout

---

## Typography

**Font Family:**
- Primary: Inter (Google Fonts) - optimized for UI and data display
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui

**Type Scale:**
- Page Title: text-2xl (24px), font-semibold
- Section Headers: text-lg (18px), font-medium
- Table Headers: text-sm (14px), font-semibold, uppercase tracking-wide
- Body/Data: text-base (16px), font-normal
- Form Labels: text-sm (14px), font-medium
- Helper Text: text-xs (12px), font-normal

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-2 (component internals)
- Standard spacing: p-4, gap-4, mb-6 (form fields, card padding)
- Section spacing: p-8, mb-8 (major sections)
- Large spacing: p-12, mb-16 (page-level separation)

**Container Strategy:**
- Max width: max-w-7xl (1280px) for main content
- Padding: px-4 sm:px-6 lg:px-8 for responsive edge spacing
- Table container: w-full with horizontal scroll on mobile (overflow-x-auto)

---

## Component Library

### Navigation/Header
- Fixed top bar, h-16
- Contains: App title (left), optional action button (right)
- Minimal, single-level navigation

### Data Table
- Full-width responsive table with clean borders
- Zebra striping (subtle) for row differentiation
- Column headers: sticky on scroll, clear sort indicators if implemented
- Row hover state: subtle highlight
- Action buttons per row: Edit (primary), Delete (destructive)
- Compact cell padding: px-4 py-3
- Empty state: centered message with icon

### Forms
- Vertical layout with clear field grouping
- Field structure: Label → Input → Helper text (if needed)
- Input spacing: mb-6 between fields
- Consistent input height: h-12
- Dropdown selects: Native or simple custom with clear selection state
- Date picker: Native HTML5 date input or minimal library (react-datepicker)
- Submit section: mt-8 with primary button + cancel link

### Buttons
- Primary: solid, medium size (px-6 py-2.5)
- Secondary: outline variant
- Destructive (delete): Use cautionary treatment
- Disabled state: reduced opacity, no interaction
- Icon buttons: square, p-2, for table actions

### Modals/Dialogs
- Delete confirmation: centered modal, max-w-md
- Backdrop: Semi-transparent overlay
- Modal content: p-6, clear title, message, action buttons (Cancel + Confirm)

### Feedback Messages
- Success: green alert banner at top, auto-dismiss after 3s
- Error: red alert banner, manual dismiss
- Position: Fixed top or inline below form
- Structure: Icon + Message + Dismiss button

### Cards (Form Container)
- Rounded corners: rounded-lg
- Padding: p-8
- Subtle elevation/border to distinguish from background

---

## Page Layouts

### Main Equipment View
```
[Header: App Title + "Add Equipment" Button]
[Success/Error Message Banner]
[Equipment Table: Full width, responsive]
```

### Add/Edit Form
- Modal overlay OR dedicated form section
- If modal: max-w-2xl, centered
- If inline: max-w-3xl, centered on page
- Form fields in single column
- Clear "Cancel" and "Save" actions

---

## Interaction Patterns

**Form Submission:**
- Disable submit button during API call
- Show loading state (spinner or text change)
- On success: close form, show success message, refresh table
- On error: show inline errors below fields + error banner

**Delete Action:**
- Click delete → show confirmation modal
- Modal: "Delete [Equipment Name]?" with warning
- Confirm deletes → success message → table refresh

**Edit Flow:**
- Click edit → open form with pre-filled data
- Form title: "Edit Equipment"
- Same validation as create

---

## Responsive Behavior

**Desktop (lg+):**
- Full table with all columns visible
- Form: 2-column layout for Type/Status fields if desired, otherwise single column is fine

**Tablet (md):**
- Table: maintain all columns, reduce padding slightly
- Forms: single column

**Mobile (base):**
- Table: horizontal scroll OR stack key info with expandable rows
- Forms: full-width, increased touch targets (h-12 minimum)
- Modals: full-screen or near-full on small screens

---

## No Images Required
This is a data management tool - no hero sections, no decorative imagery. Focus on clean, efficient data presentation.

---

## Accessibility
- All form inputs have associated labels (use `<label htmlFor="">`)
- Error messages use aria-live regions
- Keyboard navigation: Tab through forms, Enter to submit, Escape to close modals
- Focus indicators: clear outline on all interactive elements
- Color contrast: Meet WCAG AA standards (4.5:1 for text)
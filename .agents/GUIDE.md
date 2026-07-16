# Project Guide

## Confirmed Constraints
- Accessibility work should improve existing React/Next.js components without changing product behavior or adding dependencies.
- Use existing Radix/shadcn primitives and semantic HTML before introducing custom interaction patterns.
- Do not add unit or end-to-end tests unless explicitly requested.
- Keep documentation and code comments neutral and maintainer-oriented for this open-source repository.

## Accessibility Decisions
- Interactive controls must use native controls or Radix primitives with accessible names, visible focus states, and keyboard support.
- Decorative icons and repeated visual-only images should be hidden from screen readers with `aria-hidden` or empty alt text.
- Meaningful event, news, logo, and content images should keep descriptive alt text.
- Dialogs, drawers, and transient status messages should expose labels/descriptions and announce state changes where useful.
- Form inputs, switches, file uploads, and rich text controls should be associated with labels and error/help text through native labels or ARIA attributes.

## Tradeoffs Chosen
- This pass keeps the current visual design and custom styling to minimize review risk.
- Custom dropdowns are retained where replacing them with Radix Select would create broader styling or behavior churn; they receive button semantics, ARIA state, Escape handling, and selected-option state.
- Chart accessibility is handled through text summaries and labeled regions rather than adding a chart accessibility dependency.

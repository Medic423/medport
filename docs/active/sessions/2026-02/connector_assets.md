# Connector Assets

Connector SVGs exported for use in the landing page design.

## Asset Paths

| Asset | Path | Use |
|-------|------|-----|
| **Connector 1 (Bracket)** | `/landing/connectors/TRACC_Connector_Bracket.svg` | Left bracket for "Who TRACC is for" and "How TRACC works" sections |
| **Connector 2 (Lollipop)** | `/landing/connectors/TRACC_Connector_Lollipop.svg` | Horizontal bar + dot; used as building block and at bottom of bracket |

## Usage

### As `<img>` tag
```jsx
<img
  src="/landing/connectors/TRACC_Connector_Bracket.svg"
  alt=""
  className="w-full max-w-[230px]"
  aria-hidden
/>
```

### As background image
```css
background-image: url('/landing/connectors/TRACC_Connector_Lollipop.svg');
background-size: contain;
background-repeat: no-repeat;
```

### Inline (copy SVG into component)
The SVG can also be inlined for full control over sizing and styling.

## Adding to Sections Step by Step

1. **Who TRACC is for:** Replace the current straight connector bar with the bracket + lollipop layout (bracket on left, three lollipops in a row for the nodes, bracket on right).
2. **How TRACC works:** Same pattern as above.

## Dimensions

- **Bracket:** viewBox 230×420 – scale with `width`/`height` or `max-width`
- **Lollipop:** viewBox 250×80 – scale to match node spacing

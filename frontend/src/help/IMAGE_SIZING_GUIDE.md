# Image Sizing Guide for Help Files

## Overview

Images in help files can be controlled using several methods. By default, images are responsive and scale to fit the container width while maintaining aspect ratio.

## Methods to Control Image Size

### Method 1: HTML img Tag (Recommended)

You can use HTML `<img>` tags directly in your markdown files to specify width and height:

```markdown
<img src="/help/images/healthcare/image.png" alt="Description" width="500" />
```

**Options:**
- `width="500"` - Sets width to 500 pixels (height auto-adjusts)
- `width="50%"` - Sets width to 50% of container
- `height="300"` - Sets height to 300 pixels (width auto-adjusts)
- `width="500" height="300"` - Sets both dimensions (may distort image)

**Examples:**

```markdown
<!-- Small image (300px wide) -->
<img src="/help/images/healthcare/small-screenshot.png" alt="Small screenshot" width="300" />

<!-- Medium image (600px wide) -->
<img src="/help/images/healthcare/medium-screenshot.png" alt="Medium screenshot" width="600" />

<!-- Large image (800px wide) -->
<img src="/help/images/healthcare/large-screenshot.png" alt="Large screenshot" width="800" />

<!-- Percentage width (50% of container) -->
<img src="/help/images/healthcare/half-width.png" alt="Half width" width="50%" />

<!-- Fixed dimensions (use with caution - may distort) -->
<img src="/help/images/healthcare/icon.png" alt="Icon" width="64" height="64" />
```

### Method 2: Standard Markdown (Default - Responsive)

Standard markdown images are responsive and scale to fit:

```markdown
![Image Description](/help/images/healthcare/image.png)
```

**Behavior:**
- Scales to container width (max 100%)
- Maintains aspect ratio
- Centered on page
- Good for screenshots and diagrams

### Method 3: Tailwind CSS Classes (Advanced)

You can use Tailwind CSS classes via HTML img tags:

```markdown
<img src="/help/images/healthcare/image.png" alt="Description" class="w-1/2" />
<img src="/help/images/healthcare/image.png" alt="Description" class="w-96" />
<img src="/help/images/healthcare/image.png" alt="Description" class="max-w-md" />
```

**Common Tailwind width classes:**
- `w-1/4` - 25% width
- `w-1/2` - 50% width
- `w-3/4` - 75% width
- `w-full` - 100% width
- `w-64` - 256px (16rem)
- `w-96` - 384px (24rem)
- `max-w-sm` - Max 384px
- `max-w-md` - Max 448px
- `max-w-lg` - Max 512px
- `max-w-xl` - Max 576px
- `max-w-2xl` - Max 672px
- `max-w-4xl` - Max 896px

## Best Practices

### Screenshots
- **Full-width screenshots:** Use standard markdown (responsive)
- **Partial screenshots:** Use HTML with `width="600"` or `width="800"`
- **Small details:** Use HTML with `width="300"` or `width="400"`

### Icons and Diagrams
- **Icons:** Use fixed size like `width="64" height="64"`
- **Diagrams:** Use responsive (standard markdown) or `width="600"` to `width="800"`

### Mobile Considerations
- Images with fixed pixel widths may be too large on mobile
- Consider using percentage widths (`width="50%"`) for better responsiveness
- Or use Tailwind responsive classes

## Examples in Your Help Files

### Current Image (Your helpfile01_create-request.md)
```markdown
![Dispatch_Mode](/help/images/healthcare/01d-create_request_dispatch_trip_to_agencies.png)
```

This is responsive and will scale to fit.

### To Make It Smaller
```markdown
<img src="/help/images/healthcare/01d-create_request_dispatch_trip_to_agencies.png" alt="Dispatch_Mode" width="600" />
```

### To Make It Larger (but still responsive)
```markdown
<img src="/help/images/healthcare/01d-create_request_dispatch_trip_to_agencies.png" alt="Dispatch_Mode" width="900" />
```

### To Make It Half Width
```markdown
<img src="/help/images/healthcare/01d-create_request_dispatch_trip_to_agencies.png" alt="Dispatch_Mode" width="50%" />
```

## Summary

| Method | Syntax | Use Case |
|--------|--------|----------|
| **Standard Markdown** | `![alt](path)` | Responsive images, full-width screenshots |
| **HTML with width** | `<img src="path" width="500" />` | Fixed or percentage width |
| **HTML with classes** | `<img src="path" class="w-1/2" />` | Tailwind CSS sizing |

**Default behavior:** All images are centered, have rounded corners, shadow, and border for a polished look.


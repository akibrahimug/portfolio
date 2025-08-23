# Icon Migration to Phosphor Icons

This document outlines the migration from multiple icon libraries to a single, unified Phosphor Icons library.

## Overview

The project previously used multiple icon libraries:

- **@heroicons/react** - Heroicons (not actively used)
- **@mui/icons-material** - Material-UI icons
- **lucide-react** - Lucide React icons
- **@svgr/webpack** - SVG webpack loader

All have been replaced with **phosphor-react** for consistency and better performance.

## Migration Summary

### Removed Dependencies

#### 1. `@heroicons/react` (^2.0.11)

- **Status**: Removed
- **Reason**: Not actively used in the codebase
- **Replacement**: N/A

#### 2. `@mui/icons-material` (^5.6.2)

- **Status**: Removed
- **Reason**: Replaced with Phosphor Icons
- **Previous Usage**:
  - `client/components/Contact.tsx` - Google, Twitter, LinkedIn icons
  - `client/components/ModalMenu.tsx` - GitHub icon
  - `client/components/Header.tsx` - ArrowBack icon

#### 3. `lucide-react` (^0.510.0)

- **Status**: Removed
- **Reason**: Replaced with Phosphor Icons
- **Previous Usage**: Extensive use across components

#### 4. `@svgr/webpack` (^6.2.1)

- **Status**: Removed
- **Reason**: No longer needed for icon management
- **Previous Usage**: Webpack configuration for SVG handling

### Added Dependencies

#### 1. `phosphor-react` (^2.0.15)

- **Status**: Added
- **Reason**: Unified icon library
- **Benefits**:
  - Consistent design language
  - Better performance
  - Smaller bundle size
  - TypeScript support
  - Customizable weight and size

## Icon Mapping

### Material-UI to Phosphor

| Material-UI Icon | Phosphor Icon  | Usage               |
| ---------------- | -------------- | ------------------- |
| `Google`         | `GoogleLogo`   | Contact component   |
| `Twitter`        | `TwitterLogo`  | Contact component   |
| `LinkedIn`       | `LinkedinLogo` | Contact component   |
| `GitHub`         | `GithubLogo`   | ModalMenu component |
| `ArrowBack`      | `ArrowLeft`    | Header component    |

### Lucide React to Phosphor

| Lucide Icon       | Phosphor Icon     | Usage                                 |
| ----------------- | ----------------- | ------------------------------------- |
| `Download`        | `Download`        | CV component                          |
| `ArrowLeft`       | `ArrowLeft`       | CV component                          |
| `Github`          | `GithubLogo`      | NavButtons, ProfileDesc components    |
| `Linkedin`        | `LinkedinLogo`    | ProfileDesc component                 |
| `Send`            | `Send`            | ProfileDesc component                 |
| `ArrowUpRight`    | `ArrowUpRight`    | ProfileDesc component                 |
| `CheckCircle`     | `CheckCircle`     | ProfileDesc component                 |
| `ChevronLeft`     | `CaretLeft`       | Pagination component                  |
| `ChevronRight`    | `CaretRight`      | Pagination component                  |
| `MoreHorizontal`  | `DotsThree`       | Pagination component                  |
| `ExternalLink`    | `ArrowSquareOut`  | ProjectCard, TechStack components     |
| `ChevronDown`     | `CaretDown`       | ProjectCard, Methodologies components |
| `ChevronUp`       | `CaretUp`         | ProjectCard component                 |
| `Beaker`          | `Flask`           | Methodologies component               |
| `BarChart2`       | `ChartBar`        | Methodologies, TechStack components   |
| `Search`          | `MagnifyingGlass` | TechStack, DataTable components       |
| `X`               | `X`               | Multiple UI components                |
| `Award`           | `Trophy`          | TechStack component                   |
| `BookOpen`        | `BookOpen`        | TechStack component                   |
| `Check`           | `Check`           | UI components                         |
| `ChevronRight`    | `CaretRight`      | UI components                         |
| `Circle`          | `Circle`          | UI components                         |
| `PanelLeft`       | `PanelLeft`       | UI components                         |
| `Plus`            | `Plus`            | Dashboard components                  |
| `Edit`            | `PencilSimple`    | DataTable component                   |
| `Trash2`          | `Trash`           | DataTable component                   |
| `Eye`             | `Eye`             | DataTable component                   |
| `LayoutDashboard` | `House`           | Dashboard layout                      |
| `FolderOpen`      | `FolderOpen`      | Dashboard layout                      |
| `Briefcase`       | `Briefcase`       | Dashboard layout                      |
| `Award`           | `Certificate`     | Dashboard layout                      |
| `Trophy`          | `Medal`           | Dashboard layout                      |
| `Code`            | `ChartLine`       | Dashboard layout                      |
| `MessageSquare`   | `Bell`            | Dashboard layout                      |
| `FileText`        | `FolderOpen`      | Dashboard layout                      |
| `Settings`        | `Gear`            | Dashboard layout                      |
| `Menu`            | `DotsThree`       | Dashboard layout                      |
| `Sun`             | `Clock`           | Dashboard layout                      |
| `Moon`            | `Clock`           | Dashboard layout                      |
| `LogOut`          | `ArrowRight`      | Dashboard layout                      |
| `TrendingUp`      | `TrendingUp`      | Dashboard index                       |
| `Users`           | `Users`           | Dashboard index                       |
| `Clock`           | `Clock`           | Dashboard index                       |
| `GraduationCap`   | `GraduationCap`   | Dashboard index                       |

## Updated Components

### Core Components

1. **Contact.tsx** - Social media icons
2. **ModalMenu.tsx** - GitHub icon
3. **Header.tsx** - Back arrow icon
4. **CV.tsx** - Download and back icons
5. **NavButtons.tsx** - GitHub icon
6. **ProfileDesc.tsx** - Social and action icons
7. **Pagination.tsx** - Navigation icons
8. **ProjectCard.tsx** - Action and navigation icons
9. **Methodologies.tsx** - Dropdown and action icons
10. **TechStack-scroll.tsx** - Search and action icons

### UI Components

1. **select.tsx** - Dropdown icons
2. **dropdown-menu.tsx** - Menu icons
3. **checkbox.tsx** - Check icon
4. **sheet.tsx** - Close icon
5. **sidebar.tsx** - Panel icon
6. **dialog.tsx** - Close icon

### Dashboard Components

1. **DynamicForm.tsx** - Close icon
2. **DataTable.tsx** - Action icons
3. **DashboardLayout.tsx** - Navigation and action icons
4. **dashboard/index.tsx** - Dashboard icons

## Configuration Changes

### package.json

- Removed: `@heroicons/react`, `@mui/icons-material`, `lucide-react`, `@svgr/webpack`
- Added: `phosphor-react`

### next.config.js

- Removed: SVGR webpack configuration
- Simplified: Webpack configuration

## Benefits of Migration

1. **Consistency**: Single icon library with consistent design language
2. **Performance**: Reduced bundle size by removing multiple icon libraries
3. **Maintainability**: Easier to manage and update icons
4. **TypeScript**: Better TypeScript support with Phosphor
5. **Customization**: Flexible weight and size options
6. **Tree Shaking**: Better tree shaking for unused icons

## Usage Examples

### Before (Multiple Libraries)

```tsx
import { GitHub } from '@mui/icons-material'
import { Github } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'

// Usage
<GitHub />
<Github />
<ArrowLeft />
```

### After (Phosphor Icons)

```tsx
import { GithubLogo, ArrowLeft } from 'phosphor-react'

// Usage
<GithubLogo size={24} />
<ArrowLeft size={24} />
```

## Icon Properties

Phosphor Icons support various properties:

- `size`: Icon size (number or string)
- `weight`: Icon weight (thin, light, regular, bold, fill)
- `color`: Icon color
- `mirrored`: Mirror the icon horizontally

Example:

```tsx
<GithubLogo size={24} weight='bold' color='#000000' mirrored={false} />
```

## Testing

All icon migrations have been tested to ensure:

- Visual consistency
- Proper sizing
- Correct functionality
- Accessibility attributes

## Future Considerations

1. **Icon Weight**: Consider standardizing icon weights across the application
2. **Icon Sizing**: Establish consistent icon size guidelines
3. **Accessibility**: Ensure all icons have proper aria-labels
4. **Performance**: Monitor bundle size impact
5. **Updates**: Keep Phosphor Icons updated for new features and bug fixes

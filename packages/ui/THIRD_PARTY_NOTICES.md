# Third-party notices

`@tecton-mui/ui` is a private package. It depends on, re-exports, and in places extends the
open-source packages below, which are installed as runtime dependencies and keep their own license
files in `node_modules`. No commercially licensed MUI X (Pro/Premium) code, assets or documentation
is included; the advanced Data Grid, picker and Tree View features are written independently.

| Package                                                    | License                                                                              | Use                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `@mui/material`, `@mui/system`, `@mui/utils`               | MIT, Copyright (c) 2014 Call-Em-All                                                  | Core components, passthrough re-exports                 |
| `@mui/lab`                                                 | MIT, Copyright (c) 2014 Call-Em-All                                                  | Lab components, passthrough re-exports                  |
| `@mui/x-data-grid`                                         | MIT, Copyright (c) 2020 Material-UI SAS                                              | Community Data Grid foundation                          |
| `@mui/x-date-pickers`                                      | MIT, Copyright (c) 2020 Material-UI SAS                                              | Community pickers, foundation for range pickers         |
| `@mui/x-tree-view`                                         | MIT, Copyright (c) 2020 Material-UI SAS                                              | Community Tree View foundation                          |
| `@mui/x-chat`, `@mui/x-chat-headless`                      | MIT, Copyright (c) 2020 Material-UI SAS (license declared in `package.json`)         | Chat components (alpha), passthrough re-exports         |
| `markdown-to-jsx`                                          | MIT, Copyright (c) 2015-present Evan Jacobs                                          | Markdown rendering in chat messages (via `@mui/x-chat`) |
| `remend`                                                   | Apache-2.0, Copyright 2023 Vercel, Inc.                                              | Completes partial Markdown while a chat reply streams   |
| `@mui/stylis-plugin-rtl`, `stylis`                         | MIT                                                                                  | RTL style processing                                    |
| `@emotion/react`, `@emotion/styled`, `@emotion/cache`      | MIT, Copyright (c) Emotion team and other contributors                               | Styling engine                                          |
| `date-fns`                                                 | MIT, Copyright (c) 2021 Sasha Koss and Lesha Koss                                    | Default date adapter library                            |
| `clsx`                                                     | MIT, Copyright (c) Luke Edwards                                                      | Class name utility                                      |
| `@base-ui/react`, `@base-ui/utils` (with `@floating-ui/*`) | MIT, Copyright (c) 2019 Material-UI SAS (Floating UI: MIT, Floating UI contributors) | Behavior of the number fields and sliders and `Menubar` |

## Adapted Material UI recipes

`NumberField` and `NumberSpinner` (`src/NumberField/`, `src/NumberSpinner/`,
`src/internal/number-field/`) are adapted from the "Number Field" recipes in the Material UI
documentation (`docs/data/material/components/number-field/` of
[mui/material-ui](https://github.com/mui/material-ui) at tag `v9.5.0`), MIT License, Copyright (c)
2014 Call-Em-All. Changes: packaged as components with configurable label, helper text, size,
`slotProps` and refs; Tecton icons instead of `@mui/icons-material`; theme-based styling.
`NumberSlider` and `NumberRangeSlider` (`src/NumberSlider/`, `src/NumberRangeSlider/`) compose their
inputs the same way; their drag bar (`src/internal/number-field/SliderBar.tsx`) is original code.

`Menubar` and its parts (`src/Menubar/`) are adapted from the "Menubar" recipe in the Material UI
documentation (`docs/data/material/components/menubar/` of
[mui/material-ui](https://github.com/mui/material-ui) at tag `v9.5.0`), MIT License, Copyright (c)
2014 Call-Em-All. Changes: packaged as exported components with `Menubar`-prefixed names, refs, `sx`
and class names; items styled from the theme's `MenuItem` rules (the item base rules mirror
Material UI's `MenuItem`, MIT) and popups from the `Menu` paper; Tecton icons instead of
`@mui/icons-material`; the Base UI text direction follows the theme.

## Tecton design system

The theme, design tokens, fonts CSS and icons CSS are generated from the internal Tecton design
system (`@webframework/tecton-core` / `@webframework/tecton-mui` v0.11.2, marked `UNLICENSED`,
internal use) by the build-time Tecton adapter. Exact artifact URLs and checksums are recorded in
`assets/tecton/provenance.json` and in
`packages/tecton-adapter/vendor/<version>/manifest.json`.

Bundled fonts (served via `styles/global.css` / `styles/fonts.css`):

- **Figtree**, Copyright 2022 The Figtree Project Authors, SIL Open Font License 1.1.
- **IBM Plex Mono**, Copyright © 2017 IBM Corp., SIL Open Font License 1.1.

The MIT license text: Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions: The above copyright notice and
this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

`remend` is licensed under the Apache License, Version 2.0 (the "License"); you may not use it
except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0. The package ships its license file and no NOTICE file.
Unless required by applicable law or agreed to in writing, software distributed under the License is
distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.

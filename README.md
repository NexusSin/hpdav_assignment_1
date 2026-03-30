# HPDAV Assignment 1 — Coordinated Multiview Visualization

This repository contains my individual assignment for the **High Performance Data Analysis and Visualization (HPDAV)** course at the University of Luxembourg. It is a React, D3, and Redux application for interactive exploration of the **US Communities and Crime** dataset through coordinated multiple views.

The application combines a scatterplot with a hierarchical visualization so that interactions in one view are reflected in the other. The hierarchy supports three layouts: **treemap**, **circle packing**, and **tree**, all built from communities grouped by state. 

## Features

- Interactive scatterplot with user-selectable x and y attributes.
- Hierarchical view grouped by US state, with a user-selectable value attribute.
- Three hierarchy layouts: treemap, circle packing, and node-link tree.
- Brushing in the scatterplot highlights matching items in the hierarchy.
- Clicking a hierarchy node highlights the corresponding communities in the scatterplot.
- State-level selection is supported by selecting all leaf communities under a state node.
- Tooltips and linked highlighting improve exploration across views.

## Dataset

The project uses the **US Communities and Crime** dataset loaded from `data/communities.csv`. The Redux data-loading slice parses the CSV with PapaParse, adds an `index` field to each row, and stores the result in the global state.

For visualization, records with missing values (`?`, null, undefined, or non-numeric values for the active attributes) are filtered out before rendering. This filtering is applied both in the scatterplot and when building the hierarchical aggregation.

## Interaction design

The scatterplot renders communities as points positioned by two selected quantitative attributes. A D3 brush lets the user select a rectangular region, and the brushed items are stored in Redux so the hierarchy can react immediately. 

The hierarchical view is generated from the same dataset by grouping communities by state and assigning each leaf node the currently selected hierarchy value. Clicking a leaf selects one community, while clicking an internal state node selects all communities contained in that state.

The application uses shared Redux state for `selectedItems`, `brushedItems`, and `hoveredItem`, which enables coordinated highlighting between both visualizations.

## Project structure

```text
src/
├── components/
│   ├── scatterplot/
│   │   ├── Scatterplot-d3.js
│   │   ├── Scatterplot.css
│   │   └── ScatterplotContainer.jsx
│   └── hierarchy/
│       ├── Hierarchy-d3.js
│       ├── Hierarchy.css
│       └── HierarchyContainer.jsx
├── redux/
│   ├── DataSetSlice.js
│   └── ItemInteractionSlice.js
├── utils/
│   └── hierarchyBuilder.js
└── App.jsx
```

The project follows a React-container plus D3-renderer structure, where React manages state and UI controls while D3 handles SVG rendering and interactions. Redux is used to synchronize selection and brushing across views.

## Installation

Make sure you have **Node.js** installed. The project dependencies include React 18, D3 7, Redux Toolkit, PapaParse, and Vite.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The project uses Vite as its development server and build tool. The package scripts define `start` as `vite`, `build` as `vite build`, and `serve` as `vite preview`.

## Build

Create a production build with:

```bash
npm run build
```

Preview the production build with:

```bash
npm run serve
```

## Repository contents

In addition to the source code, the repository also includes the written submission files `report.pdf` and `report.docx`, along with an `images/` directory containing exported figures used for documentation.

## Author

**Fabio Dollaku**  
University of Luxembourg  
HPDAV — March 2026

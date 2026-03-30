# HPDAV Individual Assignment — Interactive Data Visualizations

An interactive visualization tool for exploring the US Communities and Crime dataset. Built with React, D3.js, and Redux, based on the [Tuto5-MultiDim-Redux](https://github.com/nicolasmedoc/Tuto5-MultiDim-Redux.git) template by Nicolas Médoc.

The app has two linked views: a scatterplot for comparing any two attributes, and a hierarchical view (treemap, circle packing, or tree layout) that groups communities by state. Brushing on one view highlights the corresponding data in the other.

## Running the app

You need Node.js installed (v16 or newer).

```bash
# install dependencies
npm install

# start the dev server
npm start
```

This opens the app at `http://localhost:5173` (Vite's default port).

To build for production:

```bash
npm run build
npm run serve
```

## How it works

- Pick any two attributes from the dropdowns to set the scatterplot axes
- Drag a rectangle on the scatterplot to brush-select communities — the hierarchy will highlight them
- Click a node in the hierarchy to select it — the scatterplot will highlight the matching points
- Switch between treemap, circle packing, and tree layouts using the layout dropdown
- The hierarchy value attribute can also be changed independently

## Dataset

US Communities and Crime from the UCI Machine Learning Repository. 1,355 communities across 46 states, 100+ normalized attributes covering income, housing, policing, and crime rates. Missing values show up as "?" in the original CSV and get filtered out.

## Tech stack

- React 18
- D3.js 7
- Redux Toolkit
- PapaParse (CSV parsing)
- Vite (build tool)

## Project structure

```
src/
|
|-- components/
|   |-- scatterplot/       # Scatterplot-d3.js (D3 class) + ScatterplotContainer.jsx (React container)
|   |-- hierarchy/         # Hierarchy-d3.js (D3 class) + HierarchyContainer.jsx (React container)
|
|-- redux/
|   |-- DataSetSlice.js          # createAsyncThunk to load CSV data into the store
|   |-- ItemInteractionSlice.js  # selectedItems[], brushedItems[], hoveredItem{}
|
|-- utils/
|   |-- hierarchyBuilder.js      # groups communities by state using FIPS codes
|
|-- templates/             # separation of concerns template (Vis-d3.js + VisContainer.jsx)
|
|-- App.jsx
|-- store.js
```

## Author

Fabio Dollaku — University of Luxembourg, HPDAV course, March 2026

import './App.css';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { getDataSet } from './redux/DataSetSlice'
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import HierarchyContainer from './components/hierarchy/HierarchyContainer';

const ATTRIBUTES = [
    "ViolentCrimesPerPop",
    "population",
    "medIncome",
    "medFamInc",
    "perCapInc",
    "PctUnemployed",
    "PctBSorMore",
    "PctNotHSGrad",
    "racepctblack",
    "racePctWhite",
    "racePctAsian",
    "OwnOccMedVal",
    "RentMedian",
    "PctFam2Par",
    "PersPerFam",
    "pctUrban",
];

const LAYOUTS = [
    { value: "treemap", label: "Treemap" },
    { value: "pack", label: "Circle Packing" },
    { value: "tree", label: "Tree (Node-Link)" },
];

function App() {
    const dispatch = useDispatch();
    const [xAttr, setXAttr] = useState("medIncome");
    const [yAttr, setYAttr] = useState("ViolentCrimesPerPop");
    const [hierarchyAttr, setHierarchyAttr] = useState("ViolentCrimesPerPop");
    const [layoutType, setLayoutType] = useState("treemap");

    useEffect(() => {
        dispatch(getDataSet());
    }, [dispatch]);

    return (
        <div className="App">
            <div className="controls">
                <span className="controlsTitle">US Communities Crime Explorer</span>
                <label>
                    X Axis:
                    <select value={xAttr} onChange={e => setXAttr(e.target.value)}>
                        {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </label>
                <label>
                    Y Axis:
                    <select value={yAttr} onChange={e => setYAttr(e.target.value)}>
                        {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </label>
                <label>
                    Hierarchy Value:
                    <select value={hierarchyAttr} onChange={e => setHierarchyAttr(e.target.value)}>
                        {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </label>
                <label>
                    Layout:
                    <select value={layoutType} onChange={e => setLayoutType(e.target.value)}>
                        {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                </label>
            </div>
            <div id={"MultiviewContainer"} className={"row"}>
                <ScatterplotContainer xAttributeName={xAttr} yAttributeName={yAttr} />
                <HierarchyContainer valueAttribute={hierarchyAttr} layoutType={layoutType} />
            </div>
        </div>
    );
}

export default App;

import './Hierarchy.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import HierarchyD3 from './Hierarchy-d3';
import { buildHierarchy } from '../../utils/hierarchyBuilder';

import { setSelectedItems, setHoveredItem } from '../../redux/ItemInteractionSlice'

function HierarchyContainer({ valueAttribute, layoutType }) {
    const visData = useSelector(state => state.dataSet)
    const brushedItems = useSelector(state => state.itemInteraction.brushedItems);
    const selectedItems = useSelector(state => state.itemInteraction.selectedItems);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const hierarchyD3Ref = useRef(null);

    const getChartSize = function () {
        let width;
        let height;
        if (divContainerRef.current !== undefined) {
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        return { width: width, height: height };
    }

    // did mount
    useEffect(() => {
        const hierarchyD3 = new HierarchyD3(divContainerRef.current);
        hierarchyD3.create({ size: getChartSize() });
        hierarchyD3Ref.current = hierarchyD3;
        return () => {
            const hierarchyD3 = hierarchyD3Ref.current;
            hierarchyD3.clear();
        }
    }, []);

    // did update - data or attribute/layout changes
    useEffect(() => {
        if (!visData || visData.length === 0) return;

        const handleNodeClick = function (nodeData) {
            if (nodeData.children) {
                // Internal node (state): select all leaf communities
                const leaves = nodeData.leaves();
                const items = leaves
                    .filter(leaf => leaf.data.data)
                    .map(leaf => leaf.data.data);
                dispatch(setSelectedItems(items));
            } else if (nodeData.data && nodeData.data.data) {
                // Leaf node: select single community
                dispatch(setSelectedItems([nodeData.data.data]));
            }
        }
        const handleNodeHover = function (nodeData) {
            if (nodeData.data && nodeData.data.data) {
                dispatch(setHoveredItem(nodeData.data.data));
            }
        }
        const handleNodeLeave = function () {
            dispatch(setHoveredItem({}));
        }

        const controllerMethods = {
            handleNodeClick,
            handleNodeHover,
            handleNodeLeave
        }

        const hierarchyData = buildHierarchy(visData, valueAttribute);
        const hierarchyD3 = hierarchyD3Ref.current;
        hierarchyD3.renderHierarchy(hierarchyData, layoutType, controllerMethods);
    }, [visData, valueAttribute, layoutType, dispatch]);

    // highlight sync - merge brushed items from scatterplot and selected items
    useEffect(() => {
        const hierarchyD3 = hierarchyD3Ref.current;
        const allHighlighted = [...brushedItems, ...selectedItems];
        hierarchyD3.highlightNodes(allHighlighted);
    }, [brushedItems, selectedItems])

    return (
        <div ref={divContainerRef} className="hierarchyDivContainer col" style={{ position: "relative" }}>
        </div>
    )
}

export default HierarchyContainer;

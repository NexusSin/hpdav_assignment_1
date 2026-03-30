import './Scatterplot.css'
import { useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux'

import ScatterplotD3 from './Scatterplot-d3';

import { setBrushedItems } from '../../redux/ItemInteractionSlice'

function ScatterplotContainer({xAttributeName, yAttributeName}){
    const visData = useSelector(state => state.dataSet)
    const brushedItems = useSelector(state => state.itemInteraction.brushedItems);
    const selectedItems = useSelector(state => state.itemInteraction.selectedItems);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getChartSize = function(){
        let width;
        let height;
        if(divContainerRef.current !== undefined){
            width = divContainerRef.current.offsetWidth;
            height = divContainerRef.current.offsetHeight;
        }
        return {width: width, height: height};
    }

    // did mount
    useEffect(()=>{
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size: getChartSize()});
        scatterplotD3Ref.current = scatterplotD3;
        return ()=>{
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);

    // did update - data or attribute changes
    useEffect(()=>{
        const handleBrush = function(brushedData){
            dispatch(setBrushedItems(brushedData))
        }

        const controllerMethods = {
            handleBrush,
        }

        const scatterplotD3 = scatterplotD3Ref.current;
        scatterplotD3.renderScatterplot(visData, xAttributeName, yAttributeName, controllerMethods);
    },[visData, xAttributeName, yAttributeName, dispatch]);

    // highlight sync - merge brushed and selected items from hierarchy
    useEffect(()=>{
        const scatterplotD3 = scatterplotD3Ref.current;
        const allHighlighted = [...brushedItems, ...selectedItems];
        scatterplotD3.highlightSelectedItems(allHighlighted);
    },[brushedItems, selectedItems])

    return(
        <div ref={divContainerRef} className="scatterplotDivContainer col">
        </div>
    )
}

export default ScatterplotContainer;

import * as d3 from 'd3'

class ScatterplotD3 {
    margin = {top: 50, right: 10, bottom: 50, left: 60};
    size;
    height;
    width;
    svg;
    defaultOpacity=0.3;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;
    brush;
    brushG;

    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","svgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xScale = d3.scaleLinear().range([0,this.width]);
        this.yScale = d3.scaleLinear().range([this.height,0]);

        // Axis groups
        this.svg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")");
        this.svg.append("g")
            .attr("class","yAxisG");

        // Axis labels
        this.xLabel = this.svg.append("text")
            .attr("class", "axisLabel")
            .attr("text-anchor", "middle")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)
            .style("font-size", "12px");

        this.yLabel = this.svg.append("text")
            .attr("class", "axisLabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -45)
            .style("font-size", "12px");

        // Markers group (rendered below brush so brush captures events)
        this.markersG = this.svg.append("g").attr("class", "markersG");

        // Brush group (on top so it captures mouse events)
        this.brushG = this.svg.append("g").attr("class", "brushG");

        // Initialize brush
        this.brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]]);
    }

    changeBorderAndOpacity(selection, selected){
        selection.style("opacity", selected ? 1 : this.defaultOpacity);
        selection.select(".markerCircle")
            .attr("stroke-width", selected ? 2 : 0);
    }

    updateMarkers(selection, xAttribute, yAttribute){
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item)=>{
                return "translate("+this.xScale(item[xAttribute])+","+this.yScale(item[yAttribute])+")";
            });
        this.changeBorderAndOpacity(selection, false);
    }

    highlightSelectedItems(selectedItems){
        this.markersG.selectAll(".markerG")
            .data(selectedItems,(itemData)=>itemData.index)
            .join(
                enter => {},
                update => {
                    this.changeBorderAndOpacity(update, true);
                },
                exit => {
                    this.changeBorderAndOpacity(exit, false);
                },
            );
    }

    updateAxis = function(visData, xAttribute, yAttribute){
        const xValues = visData.map(item => +item[xAttribute]).filter(v => !isNaN(v));
        const yValues = visData.map(item => +item[yAttribute]).filter(v => !isNaN(v));
        const minX = d3.min(xValues);
        const maxX = d3.max(xValues);
        const minY = d3.min(yValues);
        const maxY = d3.max(yValues);
        this.xScale.domain([minX,maxX]);
        this.yScale.domain([minY,maxY]);

        this.svg.select(".xAxisG")
            .transition().duration(500)
            .call(d3.axisBottom(this.xScale));
        this.svg.select(".yAxisG")
            .transition().duration(500)
            .call(d3.axisLeft(this.yScale));

        // Update axis labels
        this.xLabel.text(xAttribute);
        this.yLabel.text(yAttribute);
    }

    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods){
        // Filter out records with missing "?" values for the current attributes
        visData = visData.filter(d => {
            const x = d[xAttribute];
            const y = d[yAttribute];
            return x !== "?" && x !== null && x !== undefined && !isNaN(x)
                && y !== "?" && y !== null && y !== undefined && !isNaN(y);
        });

        this.updateAxis(visData, xAttribute, yAttribute);

        // Store for brush callback
        this.currentData = visData;
        this.currentXAttr = xAttribute;
        this.currentYAttr = yAttribute;

        this.markersG.selectAll(".markerG")
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    const itemG = enter.append("g")
                        .attr("class","markerG")
                        .style("opacity",this.defaultOpacity);
                    itemG.append("circle")
                        .attr("class","markerCircle")
                        .attr("r",this.circleRadius)
                        .attr("stroke","red");
                    this.updateMarkers(itemG, xAttribute, yAttribute);
                },
                update=>{
                    this.updateMarkers(update, xAttribute, yAttribute);
                },
                exit =>{
                    exit.remove();
                }
            );

        // Configure brush with current scales
        this.brush.on("start brush end", (event) => {
            if (!event.selection) {
                controllerMethods.handleBrush([]);
                return;
            }
            const [[x0, y0], [x1, y1]] = event.selection;
            const brushed = this.currentData.filter(d => {
                const val_x = d[this.currentXAttr];
                const val_y = d[this.currentYAttr];
                if (val_x === "?" || val_y === "?" || val_x === null || val_y === null) return false;
                const cx = this.xScale(val_x);
                const cy = this.yScale(val_y);
                return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
            });
            controllerMethods.handleBrush(brushed);
        });

        this.brushG.call(this.brush);
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;

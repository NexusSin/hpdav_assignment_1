import * as d3 from 'd3';

class HierarchyD3 {
    margin = {top: 10, right: 10, bottom: 10, left: 10};
    size;
    height;
    width;
    svg;
    mainG;
    colorScale;
    transitionDuration = 500;
    defaultOpacity = 0.85;
    highlightOpacity = 1;
    dimOpacity = 0.3;

    constructor(el) {
        this.el = el;
    }

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .append("g")
            .attr("class", "hierarchySvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Tooltip
        this.tooltip = d3.select(this.el).append("div")
            .attr("class", "hierarchy-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "#fff")
            .style("padding", "6px 10px")
            .style("border-radius", "4px")
            .style("font-size", "11px")
            .style("pointer-events", "none")
            .style("z-index", "100");

        this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd);
    }

    renderHierarchy = function (hierarchyData, layoutType, controllerMethods) {
        // Clear previous render
        this.svg.selectAll("*").remove();

        if (!hierarchyData || !hierarchyData.children || hierarchyData.children.length === 0) return;

        const root = d3.hierarchy(hierarchyData)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        // Set color scale domain based on leaf values
        const leafValues = root.leaves().map(d => d.value);
        this.colorScale.domain([d3.min(leafValues), d3.max(leafValues)]);

        switch (layoutType) {
            case "treemap":
                this.renderTreemap(root, controllerMethods);
                break;
            case "pack":
                this.renderPack(root, controllerMethods);
                break;
            case "tree":
                this.renderTree(root, controllerMethods);
                break;
            default:
                this.renderTreemap(root, controllerMethods);
        }
    }

    // ===== TREEMAP LAYOUT =====
    renderTreemap(root, controllerMethods) {
        d3.treemap()
            .size([this.width, this.height])
            .padding(1)
            .paddingTop(18)
            .round(true)
            (root);

        // State-level groups
        const stateGroups = this.svg.selectAll(".stateG")
            .data(root.children, d => d.data.name)
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("class", "stateG")
                        .attr("transform", d => `translate(${d.x0},${d.y0})`);

                    // State background
                    g.append("rect")
                        .attr("class", "stateRect")
                        .attr("width", d => Math.max(0, d.x1 - d.x0))
                        .attr("height", d => Math.max(0, d.y1 - d.y0))
                        .attr("fill", "none")
                        .attr("stroke", "#666")
                        .attr("stroke-width", 1);

                    // State label
                    g.append("text")
                        .attr("class", "stateLabel")
                        .attr("x", 3)
                        .attr("y", 12)
                        .text(d => d.data.name)
                        .style("font-size", "9px")
                        .style("font-weight", "bold")
                        .style("fill", "#333")
                        .style("pointer-events", "none");

                    return g;
                },
                update => update,
                exit => exit.remove()
            );

        // Leaf nodes (communities)
        const leaves = this.svg.selectAll(".leafG")
            .data(root.leaves(), d => d.data.name + "-" + (d.data.data ? d.data.data.index : ""))
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("class", "leafG nodeG")
                        .attr("transform", d => `translate(${d.x0},${d.y0})`)
                        .style("opacity", this.defaultOpacity);

                    g.append("rect")
                        .attr("class", "leafRect")
                        .attr("width", d => Math.max(0, d.x1 - d.x0))
                        .attr("height", d => Math.max(0, d.y1 - d.y0))
                        .attr("fill", d => this.colorScale(d.value))
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 0.5);

                    // Label only if cell is large enough
                    g.append("text")
                        .attr("class", "leafLabel")
                        .attr("x", 2)
                        .attr("y", 10)
                        .text(d => {
                            const w = d.x1 - d.x0;
                            if (w > 30) return d.data.name;
                            return "";
                        })
                        .style("font-size", "7px")
                        .style("fill", "#000")
                        .style("pointer-events", "none")
                        .each(function(d) {
                            // Clip text to cell width
                            const w = d.x1 - d.x0;
                            d3.select(this).attr("textLength", Math.max(0, w - 4))
                                .attr("lengthAdjust", "spacing");
                        });

                    this.attachEvents(g, controllerMethods);
                    return g;
                },
                update => update,
                exit => exit.remove()
            );

        // Also attach click events to state groups
        stateGroups.on("click", (event, d) => {
            event.stopPropagation();
            controllerMethods.handleNodeClick(d);
        });
    }

    // ===== CIRCLE PACKING LAYOUT =====
    renderPack(root, controllerMethods) {
        d3.pack()
            .size([this.width, this.height])
            .padding(3)
            (root);

        // Draw all nodes (internal = states, leaves = communities)
        const nodes = this.svg.selectAll(".packNodeG")
            .data(root.descendants().filter(d => d.depth > 0), d => d.data.name + "-" + d.depth + "-" + (d.data.data ? d.data.data.index : ""))
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("class", d => d.children ? "packNodeG stateNodeG" : "packNodeG nodeG")
                        .attr("transform", d => `translate(${d.x},${d.y})`)
                        .style("opacity", d => d.children ? 0.3 : this.defaultOpacity);

                    g.append("circle")
                        .attr("class", d => d.children ? "stateCircle" : "leafCircle")
                        .attr("r", d => d.r)
                        .attr("fill", d => d.children ? "none" : this.colorScale(d.value))
                        .attr("stroke", d => d.children ? "#999" : "#fff")
                        .attr("stroke-width", d => d.children ? 1.5 : 0.5);

                    // Label for state nodes and large leaf nodes
                    g.append("text")
                        .attr("class", "packLabel")
                        .attr("text-anchor", "middle")
                        .attr("dy", d => d.children ? -d.r - 2 : "0.3em")
                        .text(d => {
                            if (d.children) return d.data.name;
                            if (d.r > 15) return d.data.name;
                            return "";
                        })
                        .style("font-size", d => d.children ? "9px" : "7px")
                        .style("font-weight", d => d.children ? "bold" : "normal")
                        .style("fill", "#333")
                        .style("pointer-events", "none");

                    // Attach events only to leaf nodes
                    g.filter(d => !d.children).each((d, i, nodes) => {
                        this.attachEvents(d3.select(nodes[i]), controllerMethods);
                    });

                    // State-level click
                    g.filter(d => d.children).on("click", (event, d) => {
                        event.stopPropagation();
                        controllerMethods.handleNodeClick(d);
                    });

                    return g;
                },
                update => update,
                exit => exit.remove()
            );
    }

    // ===== TREE LAYOUT =====
    renderTree(root, controllerMethods) {
        // Use a horizontal tree to better fit the space
        const treeLayout = d3.tree()
            .size([this.height, this.width - 120]);

        treeLayout(root);

        // Links
        this.svg.selectAll(".treeLink")
            .data(root.links(), d => d.source.data.name + "-" + d.target.data.name)
            .join(
                enter => enter.append("path")
                    .attr("class", "treeLink")
                    .attr("d", d3.linkHorizontal()
                        .x(d => d.y + 60)
                        .y(d => d.x))
                    .attr("fill", "none")
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 0.5),
                update => update,
                exit => exit.remove()
            );

        // Nodes
        const nodes = this.svg.selectAll(".treeNodeG")
            .data(root.descendants(), d => d.data.name + "-" + d.depth + "-" + (d.data.data ? d.data.data.index : ""))
            .join(
                enter => {
                    const g = enter.append("g")
                        .attr("class", d => d.children ? "treeNodeG stateNodeG" : "treeNodeG nodeG")
                        .attr("transform", d => `translate(${d.y + 60},${d.x})`)
                        .style("opacity", d => d.depth === 0 ? 1 : this.defaultOpacity);

                    g.append("circle")
                        .attr("class", "treeCircle")
                        .attr("r", d => {
                            if (d.depth === 0) return 5;
                            if (d.children) return 4;
                            return 2.5;
                        })
                        .attr("fill", d => {
                            if (d.depth === 0) return "#333";
                            if (d.children) return "#69b3a2";
                            return this.colorScale(d.value);
                        })
                        .attr("stroke", d => d.children ? "#333" : "#fff")
                        .attr("stroke-width", 0.5);

                    // Labels for root and state nodes
                    g.filter(d => d.depth <= 1).append("text")
                        .attr("class", "treeLabel")
                        .attr("dy", "0.3em")
                        .attr("x", d => d.children ? -8 : 8)
                        .attr("text-anchor", d => d.children ? "end" : "start")
                        .text(d => d.data.name)
                        .style("font-size", d => d.depth === 0 ? "11px" : "8px")
                        .style("font-weight", d => d.depth === 0 ? "bold" : "normal")
                        .style("fill", "#333")
                        .style("pointer-events", "none");

                    // Attach events to leaf nodes
                    g.filter(d => !d.children && d.depth > 0).each((d, i, nodes) => {
                        this.attachEvents(d3.select(nodes[i]), controllerMethods);
                    });

                    // State-level click
                    g.filter(d => d.children && d.depth > 0).on("click", (event, d) => {
                        event.stopPropagation();
                        controllerMethods.handleNodeClick(d);
                    });

                    return g;
                },
                update => update,
                exit => exit.remove()
            );
    }

    // ===== SHARED EVENT HANDLING =====
    attachEvents(selection, controllerMethods) {
        const tooltip = this.tooltip;

        selection
            .on("click", (event, d) => {
                event.stopPropagation();
                controllerMethods.handleNodeClick(d);
            })
            .on("mouseenter", (event, d) => {
                const name = d.data.name || "Unknown";
                const value = d.value !== undefined ? d.value.toFixed(4) : "N/A";
                const state = d.parent ? d.parent.data.name : "";
                tooltip
                    .style("visibility", "visible")
                    .html(`<strong>${name}</strong><br/>State: ${state}<br/>Value: ${value}`);
                controllerMethods.handleNodeHover(d);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", (event.offsetY - 10) + "px")
                    .style("left", (event.offsetX + 15) + "px");
            })
            .on("mouseleave", () => {
                tooltip.style("visibility", "hidden");
                controllerMethods.handleNodeLeave();
            })
            .style("cursor", "pointer");
    }

    // ===== HIGHLIGHT =====
    highlightNodes(selectedItems) {
        if (!selectedItems || selectedItems.length === 0) {
            // Reset all to default opacity
            this.svg.selectAll(".nodeG")
                .style("opacity", this.defaultOpacity);
            this.svg.selectAll(".stateNodeG")
                .style("opacity", 0.3);
            return;
        }

        const selectedIndices = new Set(selectedItems.map(d => d.index));

        // Highlight leaf nodes
        this.svg.selectAll(".nodeG")
            .transition().duration(300)
            .style("opacity", function(d) {
                const itemIndex = d.data && d.data.data ? d.data.data.index : -1;
                return selectedIndices.has(itemIndex) ? 1 : 0.15;
            });

        // Highlight state nodes if any of their children are selected
        this.svg.selectAll(".stateNodeG")
            .transition().duration(300)
            .style("opacity", function(d) {
                if (!d.children) return 0.15;
                const hasSelected = d.leaves().some(leaf =>
                    leaf.data.data && selectedIndices.has(leaf.data.data.index)
                );
                return hasSelected ? 0.6 : 0.1;
            });

        // Add/remove highlight stroke on leaf nodes
        this.svg.selectAll(".nodeG").select("rect, circle")
            .transition().duration(300)
            .attr("stroke", function(d) {
                const itemIndex = d.data && d.data.data ? d.data.data.index : -1;
                return selectedIndices.has(itemIndex) ? "#ff0" : "#fff";
            })
            .attr("stroke-width", function(d) {
                const itemIndex = d.data && d.data.data ? d.data.data.index : -1;
                return selectedIndices.has(itemIndex) ? 2 : 0.5;
            });
    }

    clear = function () {
        d3.select(this.el).selectAll("*").remove();
    }
}

export default HierarchyD3;

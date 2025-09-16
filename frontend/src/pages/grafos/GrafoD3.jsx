import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import NodeInfoDrawer from "./NodeInfoDrawer.jsx";
import {consultaPorPatente, consultaPorRutFormateado} from "../../api/nodosApi";

/* PALETA ----------------------- */
const azulBase = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const grisClaro = "#f8fbfd";
const blanco = "#fff";
const textoPrin = "#22334a";

/* COLORES NODOS ---------------- */
const nodeColors = {
    persona: "#3887ff", memo: "#ff9e2c", funcionario: "#1ac888",
    vehiculo: "#ffd23c", droga: "#c876ff", dinero: "#3ae3ec",
    arma: "#f74e4e", municion: "#a7a7a7", default: "#c1c9d6",
};

export default function GrafoD3({nodes, links}) {
    const svgRef = useRef(null);
    const graphRef = useRef(null);
    const [selected, setSelected] = useState(null);
    const [tooltip, setTooltip] = useState({show: false, x: 0, y: 0, content: ""});
    const [selectedNode, setSelectedNode] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    const width = Math.floor(window.innerWidth * 0.9);
    const height = 730;

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg.append("rect")
            .attr("width", width).attr("height", height)
            .attr("fill", grisClaro);

        /* contenedor raíz */
        const graph = svg.append("g").attr("class", "graph");
        graphRef.current = graph.node();

        /* flecha */
        svg.append("defs").append("marker")
            .attr("id", "arrowhead").attr("viewBox", "-0 -5 10 10")
            .attr("refX", 14).attr("refY", 0).attr("orient", "auto")
            .attr("markerWidth", 7).attr("markerHeight", 7)
            .append("path")
            .attr("d", "M 0,-5 L 10,0 L 0,5")
            .attr("fill", azulBase);

        /* simulación */
        const sim = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(110))
            .force("charge", d3.forceManyBody().strength(-270))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(28));

        /* links */
        const link = graph.append("g")
            .attr("stroke", azulBase).attr("stroke-opacity", .27)
            .selectAll("line").data(links).enter().append("line")
            .attr("stroke-width", 2.5).attr("marker-end", "url(#arrowhead)");

        const linkLabel = graph.append("g")
            .selectAll("text").data(links).enter().append("text")
            .attr("font-size", 13).attr("fill", azulMedio).attr("opacity", .8)
            .attr("text-anchor", "middle").attr("font-family", "Segoe UI, Arial")
            .attr("font-weight", 500).text(d => d.label);

        /* nodos */
        const CLICK_TOLERANCE = 5;
        let downXY = null;

        const nodeG = graph.selectAll("g.node")
            .data(nodes).enter().append("g").attr("class", "node")
            .on("mouseenter", (e, d) => setTooltip({
                show: true, x: e.offsetX || e.layerX, y: e.offsetY || e.layerY,
                content: `${d.label}\n(${d.type})`
            }))
            .on("mouseleave", () => setTooltip({show: false}))
            .on("pointerdown", (e) => {
                downXY = [e.clientX, e.clientY];
            })
            .on("pointerup", (e, d) => {
                if (!downXY) return;
                const dx = e.clientX - downXY[0];
                const dy = e.clientY - downXY[1];
                downXY = null;
                if (Math.hypot(dx, dy) <= CLICK_TOLERANCE) {
                    setSelected(d);
                    handleNodeClick(e, d);
                }
                console.log("Nodes: ", nodes)
            });

        nodeG.append("circle")
            .attr("r", 22)
            .attr("fill", d => nodeColors[d.type] || nodeColors.default)
            .attr("stroke", "#fff").attr("stroke-width", 2)
            .style("cursor", "pointer");

        /* sombra defs */
        svg.append("defs").append("filter").attr("id", "shadow")
            .html(`<feDropShadow dx="0" dy="1" stdDeviation="2"
                     flood-color="${azulClaro}" flood-opacity="0.8"/>`);

        /* tick */
        sim.on("tick", () => {
            link
                .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2 - 8);
        });

        /* drag */
        nodeG.call(
            d3.drag()
                .on("start", (e, d) => {
                    if (!e.active) sim.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (e, d) => {
                    d.fx = e.x;
                    d.fy = e.y;
                })
                .on("end", (e, d) => {
                    if (!e.active) sim.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
        );

        /* zoom */
        svg.call(
            d3.zoom().scaleExtent([0.1, 4])
                .on("zoom", e => graph.attr("transform", e.transform))
        );
    }, [nodes, links, width, height]);

    /* resaltado */
    useEffect(() => {
        const graph = d3.select(graphRef.current);
        graph.selectAll("circle")
            .attr("stroke", "#fff").attr("stroke-width", 2).attr("filter", null);

        if (selected) {
            graph.selectAll("g.node")
                .filter(d => d.id === selected.id)
                .select("circle")
                .attr("stroke", "#111").attr("stroke-width", 4)
                .attr("filter", "url(#shadow)");
        }
    }, [selected]);

    const handleNodeClick = (event, d) => {
        setSelectedNode({
            id: d.id,
            type: d.type,
            label: d.label,
            data: d.data ?? d,
            node: d
        });
        setShowDrawer(true);
    };

    const handleRelatedSearch = async (type, identifier) => {
        try {
            let result;
            switch (type) {
                case 'persona':
                    result = await consultaPorRutFormateado(identifier);
                    break;
                case 'vehiculo':
                    result = await consultaPorPatente(identifier);
                    break;
                default:
                    break;
            }
            // TODO: actualizar el grafo con "result"
        } catch (error) {
            console.error('Error en búsqueda relacionada:', error);
        }
    };

    return (
        <div style={{
            background: grisClaro, borderRadius: 12, padding: 18, boxShadow: "0 4px 32px #0001",
            width: "100%", margin: "auto", position: "relative", border: "1px solid #ccc",
        }}>
            <svg ref={svgRef} width={"100%"} height={height}
                 style={{display: "block", background: grisClaro, borderRadius: 14}}/>

            {tooltip.show && (
                <div style={{
                    position: "absolute", left: tooltip.x + 16, top: tooltip.y - 18,
                    background: blanco, color: textoPrin, borderRadius: 8,
                    padding: "9px 13px", border: `1px solid ${azulClaro}`,
                    fontFamily: "Segoe UI, Arial", fontSize: 15, fontWeight: 500,
                    boxShadow: "0 2px 8px #0002", pointerEvents: "none"
                }}>
                    {tooltip.content.split("\n").map((t, i) => <div key={i}>{t}</div>)}
                </div>
            )}

            <NodeInfoDrawer
                show={showDrawer}
                handleClose={() => setShowDrawer(false)}
                nodeData={selectedNode}
                onRelatedSearch={handleRelatedSearch}
            />
        </div>
    );
}
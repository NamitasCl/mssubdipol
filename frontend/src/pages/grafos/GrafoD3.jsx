import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import NodeInfoDrawer from "./NodeInfoDrawer.jsx";
import {consultaPorPatente, consultaPorRutFormateado} from "../../api/nodosApi";

/* PALETA PROFESIONAL ----------------------- */
const azulPdi = "#1a365d"; // Navy PDI
const doradoPdi = "#c5a059"; // Dorado PDI
const bgGraph = "#f1f5f9"; // Slate 100
const blanco = "#ffffff";
const textoHeader = "#1e293b";

/* COLORES NODOS (Tailwind based) ---------------- */
const nodeColors = {
    persona: "#3b82f6",     // Blue 500
    memo: "#f59e0b",        // Amber 500
    funcionario: "#10b981", // Emerald 500
    vehiculo: "#eab308",    // Yellow 500
    droga: "#a855f7",       // Purple 500
    dinero: "#06b6d4",      // Cyan 500
    arma: "#ef4444",        // Red 500
    municion: "#64748b",    // Slate 500
    especie: "#f43f5e",     // Rose 500
    default: "#94a3b8",     // Slate 400
};

export default function GrafoD3({nodes, links, onRelatedSearch}) {
    const svgRef = useRef(null);
    const graphRef = useRef(null);
    const [selected, setSelected] = useState(null);
    const [tooltip, setTooltip] = useState({show: false, x: 0, y: 0, content: "", type: ""});
    const [selectedNode, setSelectedNode] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    const width = Math.floor(window.innerWidth * 0.9);
    const height = 750;

    useEffect(() => {
        if (!nodes || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Fondo con gradiente sutil
        const defs = svg.append("defs");
        const radialGradient = defs.append("radialGradient")
            .attr("id", "bg-gradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
        radialGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
        radialGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f1f5f9");

        svg.append("rect")
            .attr("width", "100%").attr("height", height)
            .attr("fill", "url(#bg-gradient)");

        /* contenedor raíz */
        const graph = svg.append("g").attr("class", "graph");
        graphRef.current = graph.node();

        /* flecha */
        defs.append("marker")
            .attr("id", "arrowhead").attr("viewBox", "-0 -5 10 10")
            .attr("refX", 26).attr("refY", 0).attr("orient", "auto")
            .attr("markerWidth", 6).attr("markerHeight", 6)
            .append("path")
            .attr("d", "M 0,-5 L 10,0 L 0,5")
            .attr("fill", "#94a3b8");

        /* simulación */
        const sim = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(130))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(svgRef.current.clientWidth / 2, height / 2))
            .force("collision", d3.forceCollide().radius(35));

        /* links */
        const link = graph.append("g")
            .attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6)
            .selectAll("line").data(links).enter().append("line")
            .attr("stroke-width", 1.5).attr("marker-end", "url(#arrowhead)");

        const linkLabel = graph.append("g")
            .selectAll("text").data(links).enter().append("text")
            .attr("font-size", 11).attr("fill", "#64748b")
            .attr("text-anchor", "middle").attr("font-family", "Inter, system-ui, sans-serif")
            .attr("font-weight", 500).text(d => d.label);

        /* nodos */
        const CLICK_TOLERANCE = 5;
        let downXY = null;

        const nodeG = graph.selectAll("g.node")
            .data(nodes).enter().append("g").attr("class", "node")
            .on("mouseenter", (e, d) => setTooltip({
                show: true, x: e.offsetX || e.layerX, y: e.offsetY || e.layerY,
                content: d.label, type: d.type
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
            });

        // Sombra de nodo
        defs.append("filter").attr("id", "node-shadow")
            .html(`<feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2"/>`);

        nodeG.append("circle")
            .attr("r", d => d.type === 'memo' ? 24 : 20)
            .attr("fill", d => nodeColors[d.type] || nodeColors.default)
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)
            .attr("filter", "url(#node-shadow)")
            .style("cursor", "pointer")
            .style("transition", "all 0.2s ease");

        // Icono o texto abreviado dentro del nodo
        nodeG.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", 10)
            .attr("font-weight", "bold")
            .attr("pointer-events", "none")
            .text(d => d.type.charAt(0).toUpperCase());

        /* tick */
        sim.on("tick", () => {
            link
                .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            nodeG.attr("transform", d => `translate(${d.x},${d.y})`);
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2 - 10);
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
            d3.zoom().scaleExtent([0.2, 3])
                .on("zoom", e => graph.attr("transform", e.transform))
        );
    }, [nodes, links, width, height]);

    /* resaltado */
    useEffect(() => {
        const graph = d3.select(graphRef.current);
        graph.selectAll("circle")
            .attr("stroke", "#fff").attr("stroke-width", 3).attr("r", d => d.type === 'memo' ? 24 : 20);

        if (selected) {
            graph.selectAll("g.node")
                .filter(d => d.id === selected.id)
                .select("circle")
                .attr("stroke", doradoPdi)
                .attr("stroke-width", 5)
                .attr("r", d => (d.type === 'memo' ? 24 : 20) + 4);
        }
    }, [selected]);

    const handleNodeClick = (event, d) => {
        // Capturamos una copia limpia antes de que D3 mute el objeto
        const clean = {
            id: d.id,
            label: d.label,
            type: d.type,
            data: d.data
        };
        console.log("Node clicked - full data (JSON):", JSON.stringify(clean, null, 2));
        setSelectedNode(clean);
        setShowDrawer(true);
    };

    const handleRelatedSearch = (type, identifier) => {
        if (onRelatedSearch) {
            onRelatedSearch(type, identifier);
        }
    };

    return (
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner">
            <svg 
                ref={svgRef} 
                width={"100%"} 
                height={height}
                className="block touch-none"
            />

            {tooltip.show && (
                <div 
                    className="absolute pointer-events-none bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-lg py-2 px-3 animate-in fade-in zoom-in duration-200 z-50"
                    style={{ left: tooltip.x + 15, top: tooltip.y - 40 }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: nodeColors[tooltip.type] }}></div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{tooltip.type}</span>
                    </div>
                    <div className="text-slate-800 font-bold leading-tight">{tooltip.content}</div>
                </div>
            )}

            <NodeInfoDrawer
                show={showDrawer}
                handleClose={() => setShowDrawer(false)}
                nodeData={selectedNode}
                onRelatedSearch={handleRelatedSearch}
            />
            
            {/* Leyenda sutil */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-2 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm max-w-sm">
                {Object.entries(nodeColors).map(([type, color]) => (
                    type !== 'default' && (
                        <div key={type} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
                            <span className="text-[10px] font-bold uppercase text-slate-500">{type}</span>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
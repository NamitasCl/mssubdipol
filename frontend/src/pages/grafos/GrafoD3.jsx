import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/* PALETA ----------------------- */
const azulBase  = "#2a4d7c";
const azulMedio = "#4f7eb9";
const azulClaro = "#b1cfff";
const grisClaro = "#f8fbfd";
const blanco    = "#fff";
const textoPrin = "#22334a";

/* COLORES NODOS ---------------- */
const nodeColors = {
    persona:"#3887ff", memo:"#ff9e2c", funcionario:"#1ac888",
    vehiculo:"#ffd23c", droga:"#c876ff", dinero:"#3ae3ec",
    arma:"#f74e4e", municion:"#a7a7a7", default:"#c1c9d6",
};

export default function GrafoD3({ nodes, links }) {
    const svgRef   = useRef(null);
    const graphRef = useRef(null);        // guardará el nodo <g>
    const [selected, setSelected] = useState(null);
    const [tooltip,  setTooltip]  = useState({ show:false,x:0,y:0,content:"" });

    const width  = Math.floor(window.innerWidth * 0.9);
    const height = 600;

    /*------------- DIBUJA GRAFO (solo si cambian datos) ------------------*/
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        svg.append("rect")
            .attr("width", width).attr("height", height)
            .attr("fill", grisClaro);

        /* contenedor raíz & guardar DOM node */
        const graph = svg.append("g").attr("class", "graph");
        graphRef.current = graph.node();           // <-- FIX: nodo DOM

        /* flecha */
        svg.append("defs").append("marker")
            .attr("id","arrowhead").attr("viewBox","-0 -5 10 10")
            .attr("refX",14).attr("refY",0).attr("orient","auto")
            .attr("markerWidth",7).attr("markerHeight",7)
            .append("path")
            .attr("d","M 0,-5 L 10,0 L 0,5")
            .attr("fill",azulBase);

        /* simulación */
        const sim = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d=>d.id).distance(110))
            .force("charge", d3.forceManyBody().strength(-270))
            .force("center", d3.forceCenter(width/2,height/2))
            .force("collision", d3.forceCollide().radius(28));

        /* links */
        const link = graph.append("g")
            .attr("stroke",azulBase).attr("stroke-opacity",.27)
            .selectAll("line").data(links).enter().append("line")
            .attr("stroke-width",2.5).attr("marker-end","url(#arrowhead)");

        const linkLabel = graph.append("g")
            .selectAll("text").data(links).enter().append("text")
            .attr("font-size",13).attr("fill",azulMedio).attr("opacity",.8)
            .attr("text-anchor","middle").attr("font-family","Segoe UI, Arial")
            .attr("font-weight",500).text(d=>d.label);

        /* nodos */
        const nodeG = graph.selectAll("g.node")
            .data(nodes).enter().append("g").attr("class","node")
            .on("mouseenter",(e,d)=> setTooltip({
                show:true,x:e.offsetX||e.layerX,y:e.offsetY||e.layerY,
                content:`${d.label}\n(${d.type})`}))
            .on("mouseleave",()=>setTooltip({show:false}))
            .on("click",(_,d)=>setSelected(d));

        nodeG.append("circle")
            .attr("r",22)
            .attr("fill",d=>nodeColors[d.type]||nodeColors.default)
            .attr("stroke","#fff").attr("stroke-width",2)
            .style("cursor","pointer");

        /* sombra defs */
        svg.append("defs").append("filter").attr("id","shadow")
            .html(`<feDropShadow dx="0" dy="1" stdDeviation="2"
                             flood-color="${azulClaro}" flood-opacity="0.8"/>`);

        /* tick */
        sim.on("tick",()=>{
            link
                .attr("x1",d=>d.source.x).attr("y1",d=>d.source.y)
                .attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
            nodeG.attr("transform",d=>`translate(${d.x},${d.y})`);
            linkLabel
                .attr("x",d=>(d.source.x+d.target.x)/2)
                .attr("y",d=>(d.source.y+d.target.y)/2-8);
        });

        /* drag */
        nodeG.call(
            d3.drag()
                .on("start",(e,d)=>{ if(!e.active) sim.alphaTarget(0.3).restart();
                    d.fx=d.x; d.fy=d.y; })
                .on("drag",(e,d)=>{ d.fx=e.x; d.fy=e.y; })
                .on("end",(e,d)=>{ if(!e.active) sim.alphaTarget(0);
                    d.fx=null; d.fy=null; })
        );

        /* zoom */
        svg.call(
            d3.zoom().scaleExtent([0.1,4])
                .on("zoom",e=> graph.attr("transform",e.transform))
        );
    }, [nodes, links, width]);

    /*------------- RESALTA NODO SELECCIONADO -----------------------------*/
    useEffect(()=>{
        const graph = d3.select(graphRef.current);      // ahora correcto
        graph.selectAll("circle")
            .attr("stroke","#fff").attr("stroke-width",2).attr("filter",null);

        if(selected){
            graph.selectAll("g.node")
                .filter(d=>d.id===selected.id)
                .select("circle")
                .attr("stroke","#111").attr("stroke-width",4)
                .attr("filter","url(#shadow)");
        }
    },[selected]);

    /* render --------------------------------------------------------------*/
    return (
        <div style={{
            background:grisClaro,borderRadius:12,padding:18,boxShadow:"0 4px 32px #0001",
            width:"90vw",margin:"auto",position:"relative"
        }}>
            <svg ref={svgRef} width="100%" height={height}
                 style={{display:"block",background:grisClaro,borderRadius:14}}/>

            {tooltip.show && (
                <div style={{
                    position:"absolute",left:tooltip.x+16,top:tooltip.y-18,
                    background:blanco,color:textoPrin,borderRadius:8,
                    padding:"9px 13px",border:`1px solid ${azulClaro}`,
                    fontFamily:"Segoe UI, Arial",fontSize:15,fontWeight:500,
                    boxShadow:"0 2px 8px #0002",pointerEvents:"none"
                }}>
                    {tooltip.content.split("\n").map((t,i)=><div key={i}>{t}</div>)}
                </div>
            )}

            <Drawer open={!!selected} onClose={()=>setSelected(null)} node={selected}/>
        </div>
    );
}

/*----------------------------- DRAWER ----------------------------------*/
function Drawer({ open, onClose, node }){
    return (
        <div style={{
            position:"fixed",top:0,right:0,height:"100vh",width:350,
            background:"#fff",boxShadow:"-8px 0 32px #0002",
            borderTopLeftRadius:18,borderBottomLeftRadius:18,
            zIndex:300,
            transform:open?"translateX(0)":"translateX(100%)",
            transition:"transform 0.35s ease",
            padding:"30px 24px",pointerEvents:open?"auto":"none"
        }}>
            <button onClick={onClose}
                    style={{position:"absolute",top:12,right:12,fontSize:28,
                        background:"none",border:"none",cursor:"pointer",color:azulBase}}>
                ×
            </button>
            <h2 style={{marginTop:8,color:azulBase,fontSize:26}}>Detalle nodo</h2>
            {open && node && (
                <div style={{fontSize:17,color:textoPrin}}>
                    <div><strong>ID:</strong> {node.id}</div>
                    <div><strong>Label:</strong> {node.label}</div>
                    <div><strong>Tipo:</strong> {node.type}</div>
                </div>
            )}
        </div>
    );
}
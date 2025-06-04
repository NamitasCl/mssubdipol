import React, { createContext, useContext, useState } from "react";

export const ScopeContext = createContext();

export function useScope() {
    return useContext(ScopeContext);
}

export function ScopeProvider({ children }) {
    const [scope, setScope] = useState(null); // { tipo: "UNIDAD", id: "BRIDECMET", ... }

    return (
        <ScopeContext.Provider value={{ scope, setScope }}>
            {children}
        </ScopeContext.Provider>
    );
}

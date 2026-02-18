const cleanJavaToString = (str) => {
    if (!str) return "";
    // Intenta extraer el valor de 'marca=' o 'modelo='
    const match = str.match(/(?:marca|modelo)=([^,)]+)/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    // Si no coincide con el patrón de Java toString pero es un string, devuélvelo tal cual
    if (!str.includes("=")) return str;
    return str; // Fallback
};

const testStrings = [
    "ListaMarca(id=27, marca=JEEP)",
    "ListaModelo(id=41, modelo=OTRO)",
    "SomeOtherString",
    "marca= BMW ",
    "ListaMarca(id=4, marca=BMW)",
    "ListaMarca(id=36, marca=MERCEDES BENZ)"
];

console.log("--- TEST RESULTS ---");
testStrings.forEach(s => {
    console.log(`Original: "${s}" -> Cleaned: "${cleanJavaToString(s)}"`);
});
console.log("--- END TEST RESULTS ---");

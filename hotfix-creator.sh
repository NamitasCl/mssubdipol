#!/bin/bash

# Pedir descripción al usuario
read -p "¿Qué hiciste en este hotfix? " descripcion

# Generar código único (6 caracteres alfanuméricos)
codigo=$(cat /dev/urandom | tr -dc 'A-Z0-9' | head -c 6)

# Generar nombre de la rama
rama="hotfix/$codigo"

# Fecha actual
fecha=$(date +%Y-%m-%d)

# Registrar en HOTFIXES.md (crea el archivo si no existe)
if [ ! -f HOTFIXES.md ]; then
    echo "| Código  | Fecha      | Descripción |" > HOTFIXES.md
    echo "|---------|------------|-------------|" >> HOTFIXES.md
fi
echo "| $codigo | $fecha | $descripcion |" >> HOTFIXES.md

# Mostrar al usuario el comando listo para copiar/pegar
echo
echo "---------------------------------------------"
echo "Hotfix registrado correctamente:"
echo "  Código: $codigo"
echo "  Descripción: $descripcion"
echo
echo "Para crear tu rama ejecuta:"
echo
echo "  git checkout -b $rama"
echo
echo "¡Listo para trabajar! Recuerda hacer commit y push después."
echo "---------------------------------------------"

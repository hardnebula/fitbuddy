#!/bin/bash

# Script para configurar el archivo .env para Convex

echo "🚀 Configurando variables de entorno para Convex..."
echo ""

# Verificar si .env ya existe
if [ -f .env ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Copiar el archivo de ejemplo
cp env.example .env

echo "✅ Archivo .env creado desde env.example"
echo ""
echo "📝 Próximos pasos:"
echo "1. Ejecuta: npx convex dev"
echo "2. Copia la URL de Convex que se muestra"
echo "3. Edita .env y pega la URL como EXPO_PUBLIC_CONVEX_URL"
echo "4. Reinicia el servidor de Expo: npm start"
echo ""
echo "💡 La URL debería verse así:"
echo "   EXPO_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud"





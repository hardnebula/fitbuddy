# Script PowerShell para configurar el archivo .env para Convex

Write-Host "🚀 Configurando variables de entorno para Convex..." -ForegroundColor Cyan
Write-Host ""

# Verificar si .env ya existe
if (Test-Path .env) {
    $overwrite = Read-Host "⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit 1
    }
}

# Copiar el archivo de ejemplo
Copy-Item env.example .env

Write-Host "✅ Archivo .env creado desde env.example" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecuta: npx convex dev"
Write-Host "2. Copia la URL de Convex que se muestra"
Write-Host "3. Edita .env y pega la URL como EXPO_PUBLIC_CONVEX_URL"
Write-Host "4. Reinicia el servidor de Expo: npm start"
Write-Host ""
Write-Host "💡 La URL debería verse así:" -ForegroundColor Cyan
Write-Host "   EXPO_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud"





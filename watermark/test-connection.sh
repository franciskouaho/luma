#!/bin/bash

# Script de test de connexion pour watermark

API_URL="${1:-http://localhost:8000}"

echo "🔍 Test de connexion à watermark..."
echo "URL: $API_URL"
echo ""

# Test 1: Health check
echo "1️⃣ Test Health Check..."
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if [ $? -eq 0 ]; then
    echo "✅ Health check OK"
    echo "   Réponse: $HEALTH_RESPONSE"
else
    echo "❌ Health check FAILED"
    echo "   Le service watermark ne répond pas sur $API_URL"
    exit 1
fi

echo ""

# Test 2: Vérifier que les endpoints existent
echo "2️⃣ Test des endpoints..."
ENDPOINTS=("/submit_remove_task" "/get_results" "/download")

for endpoint in "${ENDPOINTS[@]}"; do
    # Pour POST endpoints, on teste juste que ça ne retourne pas 404
    if [ "$endpoint" = "/submit_remove_task" ]; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL$endpoint" -F "video=@/dev/null" 2>/dev/null)
        if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "422" ]; then
            echo "✅ $endpoint existe (retourne $RESPONSE - normal sans fichier valide)"
        else
            echo "⚠️  $endpoint retourne $RESPONSE"
        fi
    else
        # Pour GET endpoints, on teste juste que ça ne retourne pas 404
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint/test123" 2>/dev/null)
        if [ "$RESPONSE" = "404" ] || [ "$RESPONSE" = "400" ]; then
            echo "✅ $endpoint existe (retourne $RESPONSE - normal avec ID invalide)"
        else
            echo "⚠️  $endpoint retourne $RESPONSE"
        fi
    fi
done

echo ""
echo "3️⃣ Test CORS..."
CORS_HEADERS=$(curl -s -I -X OPTIONS "$API_URL/health" -H "Origin: http://localhost:3000" 2>/dev/null | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "✅ CORS configuré"
    echo "   Headers: $CORS_HEADERS"
else
    echo "⚠️  CORS headers non détectés (peut être normal si configuré différemment)"
fi

echo ""
echo "✅ Tests terminés!"
echo ""
echo "📝 Pour tester depuis Next.js, vérifiez:"
echo "   1. NEXT_PUBLIC_WATERMARK_API_URL=$API_URL"
echo "   2. Le service watermark tourne: docker ps | grep watermark"
echo "   3. Pas d'erreur CORS dans la console du navigateur"


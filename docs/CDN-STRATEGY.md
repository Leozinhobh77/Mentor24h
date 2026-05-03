# 📡 CDN STRATEGY — Mentor24h

**Objetivo:** Otimizar distribuição global de conteúdo com CDN do Vercel (Edge Network)

---

## 🏗️ ARQUITETURA CDN

```
User Request
    ↓
  Vercel Edge (global)
    ↓
  Cache Hit? [SIM] → Responde em < 50ms
             [NÃO] ↓
  Origin (Railway backend)
    ↓
  Armazena em Edge
    ↓
  Responde ao usuário
```

---

## ⚙️ CONFIGURAÇÃO VERCEL.JSON

```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Estratégia por Tipo:

| Tipo | Cache | TTL | Motivo |
|------|-------|-----|--------|
| `/api/*` | no-cache | — | Dados freshly gerados |
| `/_next/*` | public | 1 ano | Assets Next.js imutáveis |
| `/static/*` | public | 1 ano | Imagens, áudios imutáveis |
| `/assets/*` | public | 1 ano | CSS/JS gerados |
| `/` (home) | public | 1h | HTML muda frequentemente |

---

## 🌍 EDGE LOCATIONS (VERCEL)

Vercel usa +280 edge nodes globais. Usuarios conectam ao mais próximo:

```
Brasil (São Paulo): ~5ms
USA (East): ~100ms
USA (West): ~150ms
Europa (Frankfurt): ~180ms
Asia (Singapore): ~250ms
```

**Mentor24h no ar em < 50ms para maioria dos usuários Brasil.**

---

## 📊 MÉTRICAS PRÉ-DEPLOY

```bash
# Verificar tamanho assets
npm run build

# Esperado:
# ✓ .next/static: < 500KB
# ✓ Compression: < 150KB (gzip)
# ✓ First Byte: < 100ms
# ✓ First Paint: < 1s
```

---

## ✅ STATUS CDN

Vercel Edge Network ativa automaticamente no deploy.

Verificar:
1. Acesse vercel.com/mentor24h/analytics
2. Aba "Functions": veja latência
3. Aba "Edge Requests": % de cache hits

**Meta:** > 80% cache hit rate

---

*Config automática — nada adicional necessário* ✅

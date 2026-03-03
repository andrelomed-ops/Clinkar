# Plan para 5 Estrellas - Clinkar

## Objetivo: ⭐⭐⭐⭐⭐ en todos los criterios

---

## FASE 1: SEGURIDAD (Crítica) 🔴

### 1.1 Correr Issue de Auth en API Checkout
- **Archivo:** `src/app/api/checkout/route.ts:13-16`
- **Acción:** Descomentar validación de usuario
- **Impacto:** ⭐⭐⭐⭐⭐ Seguridad

### 1.2 Agregar Rate Limiting
- Implementar rate limiting en APIs críticas
- Prevenir ataques de fuerza bruta

### 1.3 Validar Inputs con Zod
- Todas las API routes deben validar request body
- Ya tienen Zod instalado

---

## FASE 2: LIMPIEZA DE CÓDIGO 🧹

### 2.1 Eliminar Console Logs (242 encontrados)
- Crear logger utilitario
- Reemplazar console.log/warn/error por logger
- **Impacto:** ⭐⭐⭐⭐ Mantenibilidad

### 2.2 Eliminar Código Muerto
- Rutas de debug: `layout.debug.tsx`, `layout.backup.tsx`
- Scripts de prueba en código de producción

### 2.3 Consolidar Componentes
- Los duplicados encontrados son intencionales pero documentarlos

---

## FASE 3: TESTING 🧪

### 3.1 Coverage Actual (Ejecutar localmente)
```bash
npm test -- --coverage
```

### 3.2 Agregar Tests Faltantes
- **Services sin tests:**
  - CarService
  - FavoriteService  
  - NotificationService
  - DocumentService
  - PaymentService

### 3.3 Tests E2E
- Playwright ya configurado
- Agregar flows críticos:
  - Compra de auto
  - Venta de auto
  - Checkout

---

## FASE 4: DOCUMENTACIÓN 📚

### 4.1 Completar ARCHITECTURE.md
- [x] Stack Tecnológico
- [x] Estructura de carpetas
- [ ] Patrones de código
- [ ] API Reference

### 4.2 Agregar JSDoc
- Funciones exportadas en services
- Props de componentes

### 4.3 README.md
- Cómo correr el proyecto
- Variables de entorno requeridas

---

## FASE 5: RENDIMIENTO ⚡

### 5.1 Lazy Loading
- Componentes pesados (PDF, Gráficos)
- `next/dynamic` para modales

### 5.2 Optimizar Imágenes
- Ya usan next/image ✅
- Agregar sizes attribute

### 5.3 Bundle Analysis
```bash
npm run build && npm run analyze
```

---

## FASE 6: MONITOREO 📊

### 6.1 Error Tracking
- Configurar servicio de errores (Sentry)

### 6.2 Analytics
- Eventos de usuario
- Métricas de negocio

---

## Checklist de Verificación

```
[ ] Fase 1: Seguridad
    [ ] Fix checkout API auth
    [ ] Rate limiting
    [ ] Input validation
    
[ ] Fase 2: Limpieza
    [ ] Eliminar console.logs
    [ ] Eliminar código muerto
    [ ] Documentar duplicados
    
[ ] Fase 3: Testing
    [ ] Coverage > 70%
    [ ] Tests en servicios críticos
    [ ] E2E flows principales
    
[ ] Fase 4: Docs
    [ ] README completo
    [ ] JSDoc en servicios
    [ ] API reference
    
[ ] Fase 5: Performance
    [ ] Lazy loading
    [ ] Bundle < 500KB
    [ ] LCP < 2.5s
    
[ ] Fase 6: Monitoreo
    [ ] Error tracking
    [ ] Analytics
```

---

## Orden de Prioridad

1. **INMEDIATO:** Fix seguridad (checkout API)
2. **ESTA SEMANA:** Limpiar console logs
3. **ESTA SEMANA:** Coverage de tests
4. **PRÓXIMA SEMANA:** Documentación completa
5. **PRÓXIMA SEMANA:** Performance optimization
6. **SIGUIENTE:** Monitoreo

---

## Comandos para Verificación Final

```bash
# Build sin errores
npm run build

# Lint sin warnings
npm run lint

# Tests pasando
npm test

# Coverage
npm test -- --coverage

# E2E
npm run test:e2e
```

# Plan Estratégico y Financiero: Clinkar 2026

## 1. Resumen Ejecutivo
Para que Clinkar sea rentable sin "quedarse en la ruina" ni perder accesibilidad, debemos posicionarnos en el **"Sweet Spot"** entre la inseguridad de Facebook Marketplace/Mercado Libre (bajos costos, alto riesgo) y el alto margen de Kavak/Lotes (altos costos, conveniencia).

**Nuestra Propuesta:** Seguridad Total (Bóveda + Mecánica) a una fracción del costo de un lote.

---

## 2. Análisis de Competencia y Benchmarking

| Competidor | Modelo | Costo para Vendedor | Costo para Comprador | Riesgo de Fraude | Conveniencia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kavak** | Compra-Venta (Spread) | 20% - 25% (Margen oculto en oferta baja) | Alto (Precio de venta inflado) | Nulo | Alta (Venta inmediata) |
| **Mercado Libre** | Clasificado | $660 - $970 MXN (Fijo) | $0 | **Alto** (Trato directo) | Media |
| **Facebook** | Clasificado | $0 | $0 | **Crítico** (Robos/Estafas) | Baja |
| **Lotes Trad.** | Consignación | 10% - 15% Comisión | Inflado | Medio | Media |
| **CLINKAR** | **Intermediación Segura** | **$1,999 Base + 1.5%** | **$0** (Promoción Launch) | **Nulo** (Bóveda + Insp.) | **Alta** (Digital) |

---

## 3. Análisis de Rentabilidad (Unit Economics)

Basado en un **Ticket Promedio de Auto: $250,000 MXN**.

### Ingresos por Transacción (Actual)
1.  **Tarifa Base**: $1,999 MXN
2.  **Comisión Variable (1.5%)**: $3,750 MXN
3.  **Total Ingreso Bruto (Take Rate ~2.3%)**: **$5,749 MXN**

### Costos Directos (COGS)
1.  **Pago a Inspector (Gig Economy)**: -$800 MXN (Por inspección exitosa)
2.  **Costos Financieros (SPEI Bóveda)**: -$20 MXN
3.  **Verificación Legal (APIs)**: -$50 MXN
4.  **Costo de Inspecciones Fallidas**: -$400 MXN (Asumiendo 1 venta por cada 1.5 inspecciones)
5.  **Total Costos**: **-$1,270 MXN**

### Margen de Contribución
**$4,479 MXN por auto vendido.**

### Viabilidad
Para cubrir costos fijos mensuales de operación (ej. $50,000 entre servidores, marketing mínimo, sueldo fundador):
*   Necesitas vender **~12 autos al mes**.
*   Esto es **3 autos por semana**.
*   **CONCLUSIÓN:** Es un modelo altamente viable y escalable.

---

## 4. Estrategia "Zero-to-One": Cómo empezar sin dinero

El mayor error es gastar en anuncios de Facebook/Instagram sin tener marca. El CAC (Costo de Adquisición) te comerá el margen.

### Fase 1: Guerrilla Marketing (Mes 1-3)
*   **Estrategia "Caballo de Troya" en Marketplace:**
    *   Contactar vendedores en FB Marketplace que tienen autos buenos.
    *   Ofrecerles: *"Tengo un cliente interesado, pero solo compra si certificamos el auto. Usa Clinkar GRATIS (bonificación primer usuario) para cerrar la venta segura".*
    *   Objetivo: Llenar el inventario inicial sin gastar en ads.
*   **Alianza con Mecánicos:**
    *   Los mecánicos son los primeros en saber quién vende su auto.
    *   Pago de $500 MXN por referido exitoso (sale del margen de $4,479).

### Fase 2: Nichos de Alta Confianza (Mes 3-6)
*   Enfocarse en **Autos Familiares y de Lujo (Ticket >$300k)**.
    *   El dueño de un BMW tiene más miedo a que lo asalten al vender que el dueño de un Tsuru.
    *   El 1.5% de comisión duele menos ahí y el margen absoluto es mayor.
*   **Campaña del Miedo (Ética):**
    *   Contenido en redes mostrando casos reales de estafas en citas presenciales.
    *   Solución: *"En Clinkar el dinero está seguro antes de que entregues las llaves".*

### Fase 3: Escalamiento (Mes 6+)
*   Activar pauta digital dirigida a "Lookalikes" de usuarios que ya vendieron.
*   Introducir servicios adicionales: **Crédito y Seguros** (Aquí está el verdadero dinero a largo plazo, no en la comisión del auto).

---

## 5. Ajustes de Pricing (Implementado en v1.0)
El esquema actual ha sido actualizado en el código (`fiscal-utils.ts`) para incluir:

1.  **Tope Máximo (Cap) - ACTIVADO:**
    *   **Política**: "Nunca pagarás más de $11,999 MXN (IVA Incluido)".
    *   **Impacto**: Para autos de >$1M, esto vuelve a Clinkar la opción más barata del mercado (vs el 20% de Kavak).
2.  **Garantía de "No Venta, No Paga Costo Variable":**
    *   Solo se cobra el listado inicial.
    *   La comisión de éxito está condicionada a la venta real.

## 6. Hoja de Ruta Financiera (Runway Protection)
1.  **No contrates fijos:** Usa inspectores bajo demanda (Uber model).
2.  **No rentes oficinas:** Opera remoto.
3.  **Tecnología Serverless:** Mantén el costo de Vercel/Supabase en el tier gratuito/Pro ($20 USD/mes) hasta tener tracción.
4.  **Enfócate en Liquidez:** Es mejor vender 10 autos con margen bajo que tener 100 publicados que no se venden.

**Veredicto:** Clinkar es financiero saludable con tu estructura actual. El reto no es el precio, es la **CONFIANZA**. Tu inversión debe ir a construir marca, no a subsidiar precios.

---

## 7. Estrategia Legal (Blindaje Corporativo)

El mayor riesgo de una startup de autos no es financiero, es legal (vicios ocultos, autos robados, extinción de dominio).

### Modelo Jurídico: "Intermediario Tecnológico con Garantía de Confianza"
A diferencia de Kavak (que compra el activo y asume el riesgo), Clinkar opera como **Comisionista Mercantil**.
1.  **No compramos inventario**: El auto nunca pasa a ser propiedad de Clinkar (ahorro masivo en impuestos de traslado de dominio).
2.  **Responsabilidad "Ad Corpus"**: Los contratos estipulan que el Vendedor entrega el auto en el estado certificado. Clinkar responde por la veracidad de la inspección, no por fallas futuras (salvo que el usuario compre la Póliza de Garantía Extendida, que es un producto de aseguradora tercero).

### Documentación Crítica (Ya integrada en el Backoffice)
*   **Contrato de Adhesión (PROFECO)**: Registraremos nuestro modelo de contrato para dar legitimidad.
*   **Carta Responsiva Digital**: Al momento de la entrega, el vendedor firma digitalmente que libera de responsabilidad al comprador por hechos anteriores a la fecha.
*   **Cláusula Anti-Lavado**: El vendedor declara bajo protesta de decir verdad que el bien es de procedencia lícita (Escudo contra Extinción de Dominio).

---

## 8. Estrategia Contable y Fiscal (SAT)

Para operar en México sin que el SAT colapse tu flujo de caja:

### El Modelo "Cuenta de Terceros" (Escrow)
Cuando un comprador deposita $300,000 MXN en Clinkar:
*   **ERROR**: Ingresarlo a la cuenta corriente como "Venta". (Pagarías IVA/ISR sobre los $300k).
*   **ESTRATEGIA**: Usar una cuenta "Concentradora por Cuenta de Terceros".
    *   Entran $300,000 (Pasivo Circulante).
    *   Salen $295,000 al Vendedor (Disminución de Pasivo).
    *   Se quedan $5,000 en Clinkar (Ingreso Acumulable).
    *   **Resultado**: Solo pagas impuestos sobre los $5,000 de comisión.

### Cumplimiento PLD (Prevención de Lavado de Dinero)
La venta de vehículos es una **Actividad Vulnerable** (Ley Antilavado).
*   **Umbral de Identificación (~$360,000 MXN)**: Debemos tener expediente completo (INE, CURP, RFC). *Clinkar ya lo pide en el onboarding.*
*   **Umbral de Aviso (~$720,000 MXN)**: Si la operación supera este monto, el sistema debe alertar al Contador para enviar aviso al portal del SAT el día 17 del mes siguiente.
*   **Restricción de Efectivo**: Clinkar es 100% digital (SPEI). Esto elimina automáticamente el riesgo de recibir efectivo por encima de los umbrales legales (~$360k).

### Facturación 4.0
*   Clinkar emite factura **SOLO por la comisión** de intermediación.
*   El Vendedor (si es particular) no está obligado a emitir factura al Comprador (se usa el Contrato de Compraventa y el Endoso de Factura Original como comprobante de propiedad), pero Clinkar facilita el contrato privado que funge como soporte legal.


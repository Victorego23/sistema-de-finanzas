# 🚀 TommyFinance - Sistema de Gestión de Finanzas Personales

## Descripción
TommyFinance es una aplicación web moderna y segura para gestionar tus finanzas personales. Permite registrar ingresos, gastos, crear metas de ahorro y establecer límites de presupuesto.

## ✨ Características

✅ **Registro de Operaciones Financieras**
- Ingresos (trabajo, freelance, etc.)
- Gastos y deudas
- Categorización automática
- Métodos de pago registrados

✅ **Panel de Control Completo**
- Balance neto en tiempo real
- Total de ingresos y gastos
- Tarjetas de información visual
- Historial cronológico

✅ **Gestión de Metas de Ahorro**
- Crear metas personalizadas
- Seguimiento del progreso
- Cochinito digital
- Contribuir dinero a metas

✅ **Control de Presupuesto**
- Establecer límites por categoría
- Alertas visuales al acercarse al límite
- Gráficos de distribución de gastos
- Porcentajes exactos por categoría

✅ **Respaldos Seguros**
- Exportar datos a archivos JSON
- Importar respaldos previos
- Restauración completa de datos
- Validación de integridad

## 🔒 Seguridad

Esta aplicación incluye múltiples capas de protección:

- ✅ **Prevención de XSS**: Todos los datos se escapan correctamente
- ✅ **Validación de Entrada**: Montos, descripciones y archivos validados
- ✅ **Almacenamiento Local**: Datos guardados solo en tu navegador
- ✅ **Sin Backend**: No se envían datos a servidores
- ✅ **Código Abierto**: Auditable y confiable

Ver [SEGURIDAD.md](SEGURIDAD.md) para más detalles.

## 📁 Estructura del Proyecto

```
sistema-de-finanzas/
├── index.html           # Archivo principal HTML
├── css/
│   └── styles.css       # Estilos (tema dark mode)
├── js/
│   └── finanzas.js      # Lógica de la aplicación
├── SEGURIDAD.md         # Documentación de seguridad
└── README.md            # Este archivo
```

## 🚀 Cómo Usar

### Instalación
1. Descarga o clona este repositorio
2. Abre `index.html` en tu navegador
3. ¡Listo! No requiere instalación adicional

### Uso Básico

**1. Registrar una Operación**
- Ingresa el monto
- Selecciona si es ingreso o gasto
- Elige la categoría
- Selecciona el método de pago
- Agrega una descripción
- Haz clic en "Registrar en la Billetera"

**2. Crear una Meta de Ahorro**
- Ve a "Cochinito Digital"
- Ingresa el nombre de la meta
- Establece el monto objetivo
- Contribuye dinero cuando puedas

**3. Establecer Límites de Presupuesto**
- Ve a "Límites de Presupuesto"
- Selecciona una categoría
- Establece el monto máximo
- La app te alertará si lo superás

**4. Ver Estadísticas**
- Accede a "Ver Mis Cuentas"
- Observa la distribución de tus gastos
- Filtra por tipo de movimiento

**5. Respaldar tus Datos**
- Haz clic en "Descargar Copia de Respaldo"
- Se descargará un archivo JSON
- Guárdalo en lugar seguro

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive y variables CSS
- **Vanilla JavaScript** - Lógica sin dependencias externas
- **LocalStorage API** - Persistencia de datos

## 📱 Compatibilidad

✅ Desktop (Chrome, Firefox, Safari, Edge)
✅ Tablet (iOS Safari, Android Chrome)
⚠️ Mobile (responsivo, pero mejor en pantallas más grandes)

## 🎨 Tema Visual

- Diseño Dark Mode profesional
- Interfaz inspirada en criptomonedas
- Emojis intuitivos para categorías
- Colores: Azul, Verde, Rojo, Púrpura

## ⚙️ Configuración Local

La aplicación usa `localStorage` del navegador. No hay archivos de configuración que modificar.

**Límites configurados:**
- Monto máximo por operación: S/ 1,000,000
- Tamaño máximo de respaldo: 5 MB
- Longitud máxima de descripción: 200 caracteres
- Longitud máxima de nombre de meta: 100 caracteres

## 📊 Datos Almacenados

Los siguientes datos se guardan localmente:
- `cryptoFinanzasData` - Lista de transacciones
- `cryptoMetasData` - Metas de ahorro
- `cryptoLimitesData` - Límites de presupuesto

**Nota:** Estos datos solo existen en tu navegador y se borran si limpias el caché.

## 🔄 Respaldos

Para no perder tus datos:
1. Regularmente descarga respaldos
2. Guárdalos en un lugar seguro
3. Si necesitas restaurar, importa el archivo

## 🐛 Solución de Problemas

**Los datos desaparecieron:**
- Si limpiaste el caché, los datos se pierden
- Restaura desde un respaldo si tienes uno
- Importa el archivo JSON descargado

**La app va lenta:**
- Si tienes muchas transacciones, puede ralentizarse
- Considera crear un nuevo respaldo y limpiar datos antiguos

**No puedo importar un respaldo:**
- Asegúrate que sea un archivo `.json`
- Verifica que no esté corrupto
- El archivo debe tener la estructura correcta

## 📝 Cambios Recientes

### Versión 2.0 (24 de mayo de 2026)
- ✅ Correcciones de seguridad XSS
- ✅ Validación robusta de entrada
- ✅ Mejora en respaldos
- ✅ Reemplazo de alert() con toasts
- ✅ Documentación completa de seguridad

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente para tus propósitos personales.

## 🤝 Contribuciones

Si encuentras bugs o tienes sugerencias:
1. Verifica [SEGURIDAD.md](SEGURIDAD.md)
2. Documenta el problema claramente
3. Proporciona pasos para reproducir

## ✉️ Contacto

Para preguntas sobre la aplicación o seguridad, consulta la documentación incluida.

## 🙏 Agradecimientos

Desarrollado con ❤️ para la gestión eficiente de finanzas personales.

---

**Última actualización:** 24 de mayo de 2026
**Estado:** ✅ Producción (seguro para usar y compartir)

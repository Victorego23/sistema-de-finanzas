# 📚 Guía para Subir TommyFinance a GitHub

Esta guía te ayudará a subir tu proyecto TommyFinance de forma segura a GitHub.

## ✅ Checklist Pre-Upload

Antes de hacer push, verifica:

- ✅ No hay archivos `.json` con datos personales
- ✅ No hay claves API o tokens
- ✅ No hay carpetas `node_modules` o `.vscode`
- ✅ El `.gitignore` está configurado
- ✅ Los archivos principales están presentes:
  - index.html
  - css/styles.css
  - js/finanzas.js
  - SEGURIDAD.md
  - README.md
  - .gitignore

## 🚀 Pasos para Subir a GitHub

### 1. Crear un repositorio en GitHub

1. Ve a [github.com](https://github.com) y inicia sesión
2. Haz clic en "New repository"
3. Nombre: `sistema-de-finanzas` (o como prefieras)
4. Descripción: "Sistema de gestión de finanzas personales"
5. Selecciona "Public" o "Private" (recomendado: Public, es código seguro)
6. NO inicialices con README (ya tienes uno)
7. Haz clic en "Create repository"

### 2. Subir desde PowerShell/Terminal

Abre PowerShell en la carpeta de tu proyecto y ejecuta:

```powershell
# Inicializar el repositorio local
git init

# Agregar el repositorio remoto (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/sistema-de-finanzas.git

# Agregar todos los archivos (respeta .gitignore)
git add .

# Crear el primer commit
git commit -m "Initial commit: Sistema de finanzas personales seguro"

# Subir al repositorio remoto
git branch -M main
git push -u origin main
```

### 3. Alternativa: Usando GitHub Desktop

1. Descarga [GitHub Desktop](https://desktop.github.com/)
2. Abre GitHub Desktop
3. File → Clone repository
4. Selecciona tu nuevo repositorio
5. Selecciona la carpeta local
6. En la app, selecciona "Create New Repository"
7. Completa los detalles
8. Publish repository

## ⚠️ Información Importante

### Qué ESTÁ SEGURO subir:
✅ HTML, CSS, JavaScript (código)
✅ Documentación (README.md, SEGURIDAD.md)
✅ .gitignore
✅ Archivos de configuración

### Qué NO subir:
❌ Archivos .json con datos personales
❌ Respaldos descargados (TommyFinance_Backup_*.json)
❌ Variables de entorno (.env)
❌ Claves o tokens
❌ Datos sensibles

### El .gitignore automáticamente ignora:
- Respaldos JSON (`*.json`)
- Archivos del sistema
- Carpetas de IDE
- Archivos temporales

## 🔍 Verificar antes de hacer push

```powershell
# Ver qué se va a subir
git status

# Ver los cambios
git diff

# Ver archivos ignorados
git check-ignore *
```

## 📋 Estructura Final en GitHub

Tu repositorio verá:
```
sistema-de-finanzas/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── finanzas.js
├── README.md
├── SEGURIDAD.md
└── .gitignore
```

**NO verá:**
- Respaldos .json
- Carpetas node_modules
- Archivos .vscode
- Archivos del sistema

## 🔐 Privacidad y Seguridad

### ¿Es seguro subir este código?
**SÍ, completamente seguro porque:**
- No hay datos personales en el código
- No hay conexiones a servidores
- No hay claves de API
- Todo es código fuente
- Es una aplicación local (client-side)

### ¿Qué ven los demás?
Solo el código fuente, igual a cualquier otro proyecto en GitHub. No ven:
- Tus datos financieros (están solo en tu navegador)
- Tus respaldos locales
- Variables de entorno
- Información sensible

### Recomendaciones:
1. Mantén privados los archivos de respaldo (.json)
2. Guarda respaldos en Drive, OneDrive o USB
3. No compartas respaldos por internet
4. El código es seguro de compartir

## 🔄 Actualizaciones Futuras

Para hacer cambios después:

```powershell
# Hacer cambios en los archivos...

# Agregar cambios
git add .

# Crear un commit con descripción
git commit -m "Descripción del cambio"

# Subir cambios
git push origin main
```

## 📱 Sincronizar Entre Dispositivos

Si quieres trabajar en múltiples dispositivos:

```powershell
# En el nuevo dispositivo, clona el repo
git clone https://github.com/TU_USUARIO/sistema-de-finanzas.git

# Entra a la carpeta
cd sistema-de-finanzas

# Abre index.html en el navegador
start index.html
```

## ❓ Preguntas Frecuentes

**P: ¿Pierdo mis datos si subo a GitHub?**
R: No. Los datos están en tu `localStorage` local. GitHub solo guarda el código.

**P: ¿Alguien puede ver mis datos financieros?**
R: No. Los datos nunca se envían a GitHub. Solo el código fuente.

**P: ¿Puedo hacer el repositorio privado?**
R: Sí. Ve a Settings → Change repository visibility. (GitHub permite 1 repo privado gratis)

**P: ¿Qué pasa si cambio de navegador?**
R: Los datos se pierden. Por eso existen los respaldos. Importa tu `.json` guardado.

**P: ¿Es mejor privado o público?**
R: Público es mejor porque:
- El código es seguro (no hay datos personales)
- Puedes compartir con otros
- Obtienes feedback

**P: ¿Cómo recupero mis datos si cambio de PC?**
R: Descarga respaldos regularmente y guardalos en Drive/OneDrive.

## 🆘 Si Algo Sale Mal

**Cometí un error, ¿cómo deshacer?**
```powershell
# Ver historial
git log

# Deshacer el último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer el último commit (descarta cambios)
git reset --hard HEAD~1
```

**¿Qué archivos subo?**
```powershell
# Verificar qué se subirá
git status
```

## 📚 Recursos Útiles

- [GitHub Hello World](https://guides.github.com/activities/hello-world/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)

## ✅ Checklist Final

Antes de hacer push:
- [ ] README.md está escrito
- [ ] SEGURIDAD.md está incluido
- [ ] .gitignore está configurado
- [ ] No hay archivos .json personales
- [ ] Todos los archivos de código están presentes
- [ ] Probaste la app localmente
- [ ] Hiciste un respaldo local del proyecto

¡Listo para subir! 🚀

---

**Documento creado:** 24 de mayo de 2026

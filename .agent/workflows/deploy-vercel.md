---
description: Desplegar la aplicación a Vercel usando la CLI
---

# Despliegue Manual vía Vercel CLI

Si prefieres no usar GitHub o quieres un despliegue rápido desde tu terminal:

// turbo
1. Instalar Vercel CLI globalmente (si no lo tienes)
```powershell
npm install -g vercel
```

2. Iniciar sesión
```powershell
vercel login
```

3. Inicializar el despliegue en la carpeta raíz del proyecto
```powershell
vercel
```
- Sigue las instrucciones interactivas:
  - ? Set up and deploy “~\Desktop\APP-IA\GymApp1.0”? **Yes**
  - ? Which scope do you want to deploy to? **Tu usuario**
  - ? Link to existing project? **No**
  - ? What’s your project’s name? **gymapp-pwa**
  - ? In which directory is your code located? **./**

4. Configurar variables de entorno desde la web de Vercel o vía CLI antes de hacer el despliegue final.

5. Despliegue a producción
```powershell
vercel --prod
```

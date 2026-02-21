**Especificación de Requerimientos: App Fitness PWA (Antigravity & Supabase)**

**1\. Resumen Ejecutivo**

Desarrollo de una Progressive Web App (PWA) enfocada en la gestión de socios de un centro de fitness. La solución permitirá el control de pagos, comunicación automatizada y autogestión del usuario, utilizando un stack moderno basado en **React Native Web** y el motor de despliegue **Antigravity de Google**.  
---

**2\. Arquitectura Tecnológica**

Para garantizar la compatibilidad multiplataforma y la escalabilidad, se define el siguiente stack:

·         **Frontend:** React Native con la librería react-native-web para exportar como PWA.

·         **Despliegue:** Google Antigravity (optimización de performance y distribución).

·         **Backend & DB:** **Supabase** (PostgreSQL) para base de datos en tiempo real.

·         **Autenticación:** Supabase Auth (Email/Password y Magic Links).

·         **Almacenamiento:** Supabase Storage (para comprobantes de transferencia y banners promocionales).

·         **Distribución:** Código QR para acceso directo a la PWA.  
---

**3\. Requerimientos Funcionales: Usuario (Socio)**

**3.1. Perfil y Estado de Cuenta**

El usuario tendrá acceso a un Dashboard personal con un **indicador visual de estado**:

·         **Semáforo de Estado:** \* **Verde:** Cuota al día.

o	**Rojo:** Cuota vencida.

·         **Detalle:** Visualización clara de la fecha exacta del próximo vencimiento.

**3.2. Sistema de Pagos Integrado**

·         **Pasarela de Pagos (Modo Sandbox):** Integración con Mercado Pago y API de tarjetas de débito/crédito.

·         **Transferencia Manual:** Opción de adjuntar captura de pantalla (JPG/PNG/PDF) del comprobante.

·         **Historial:** Listado de pagos realizados y estados de aprobación.

**3.3. Notificaciones y Alertas**

·         **Recordatorio Automático:** El sistema enviará una notificación T-3 (3 días antes del vencimiento).

o	*Template:* "Hola \[Nombre\], tu cuota vence el \[Fecha\]. ¡No te quedes sin entrenar\!"

·         **Promociones:** Sección de "Avisos" donde el usuario recibe banners de ofertas o comunicados generales del gimnasio.  
---

**4\. Requerimientos Funcionales: Panel Administrativo**

**4.1. Gestión de Socios**

·         **Buscador Maestro:** Filtrado por Nombre, DNI o ID de socio.

·         **Vista de Semáforo:** Filtro global para identificar rápidamente a los socios "Vencidos" o "Por Vencer".

**4.2. Control de Pagos y Validación**

·         **Validación de Comprobantes:** Interfaz para aprobar o rechazar las fotos de transferencias subidas por los usuarios.

·         **Gestión de Cuotas:** Capacidad de editar fechas de vencimiento manualmente en casos excepcionales.

**4.3. Centro de Comunicaciones**

·         **Carga de Contenido:** Formulario para subir imágenes de promociones que aparecerán en el feed de los socios.

·         **Mensajería Push/In-App:** Envío de mensajes particulares a un socio específico o mensajes masivos a toda la base.  
---

**5\. Modelo de Datos (Supabase)**

| Tabla | Campos Principales |
| :---- | :---- |
| **Profiles** | id, nombre, dni, status (boolean), fecha\_vencimiento |
| **Payments** | id, user\_id, monto, metodo\_pago, comprobante\_url, estado (pending, approved) |
| **Notifications** | id, titulo, mensaje, imagen\_url, tipo (general, individual) |

---

**6\. Reglas de Negocio y Automatización**

1\.  	**Cálculo de Estado:** El sistema debe contrastar diariamente current\_date con fecha\_vencimiento. Si current\_date \> fecha\_vencimiento, el estado cambia a **Rojo** automáticamente.

2\.  	**Trigger de Mensajería:** Se programará un *Cron Job* (vía Supabase Edge Functions) que se ejecute cada 24 horas para disparar los recordatorios de 3 días de antelación.

3\.  	**Seguridad:** El acceso al Panel Administrativo estará restringido por Roles de Usuario (role: 'admin') definidos en Supabase.  

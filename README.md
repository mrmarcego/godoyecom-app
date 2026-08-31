# Godoyecom App

Plataforma privada para los estudiantes de Godoyecom. Tiene dos vistas:

- **Estudiantes**: cada quien crea su cuenta, carga sus métricas de Instagram
  (seguidores, alcance, reels) y lleva el control de su negocio de reventa
  (inversión, ventas, ganancia, método de pago) con gráficas. Solo ve sus
  propios datos.
- **Administradores**: ven a todos los estudiantes registrados en un panel,
  con sus métricas, y pueden entrar al detalle de cada uno para dejarle
  feedback privado (que solo ese estudiante y el equipo admin pueden leer).

Construida con **Next.js 14 + TypeScript + Tailwind** y **Supabase**
(base de datos, autenticación y seguridad a nivel de fila). Ya compila sin
errores (`npm run build`); lo único que falta para que quede 100% en línea es
crear tu propio proyecto de Supabase y conectarlo, y luego publicar la app.

---

## 0. Qué vas a necesitar

- Una cuenta gratis en [supabase.com](https://supabase.com) (base de datos + login).
- Una cuenta gratis en [vercel.com](https://vercel.com) (para publicar la app), o
  cualquier otro hosting que soporte Next.js.
- [Node.js](https://nodejs.org) 18 o más reciente, solo si quieres correrla en
  tu computadora antes de publicarla.
- Opcional: una cuenta de [GitHub](https://github.com) para subir el código
  (lo más fácil para conectar con Vercel).

No necesitas saber programar para completar estos pasos — son básicamente
copiar y pegar.

---

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Ponle un nombre (ej. "Godoyecom") y una contraseña de base de datos (guárdala).
3. Cuando el proyecto esté listo, ve a **SQL Editor** → **New query**.
4. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este
   proyecto, copia **todo** su contenido, pégalo en el editor y dale **Run**.
   Esto crea todas las tablas, la seguridad de datos (cada estudiante solo ve
   lo suyo) y las funciones necesarias.
5. Ve a **Project Settings → API**. Ahí vas a ver:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (esta es secreta, nunca la compartas ni la pongas en
     el navegador)

Guarda esos tres valores, los vas a necesitar en el paso 3.

### Sobre la confirmación de correo

En **Authentication → Providers → Email** de Supabase hay una opción
**"Confirm email"**:

- **Activada** (por defecto): cuando un estudiante se registra, le llega un
  correo para confirmar su cuenta antes de poder entrar. La app ya maneja
  este caso (le muestra "revisa tu correo").
- **Desactivada**: el estudiante entra directo después de registrarse, sin
  correo de confirmación. Como ya tienen un grupo cerrado de +100 estudiantes
  conocidos, esta opción suele ser más simple. Ustedes deciden.

---

## 2. Configurar las variables de entorno

En la raíz del proyecto, copia `.env.example` a un archivo nuevo llamado
`.env.local` y completa los valores:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ADMIN_SIGNUP_CODE=elige-un-codigo-secreto-propio
```

`ADMIN_SIGNUP_CODE` es el código que va a pedir la página
`/admin-signup` para poder crear una cuenta de administrador. Cámbialo por
algo propio y compártelo solo con las personas del equipo que van a
administrar la plataforma (no con los estudiantes).

---

## 3. Correrla en tu computadora (opcional, para probar antes de publicar)

```bash
npm install
npm run dev
```

Ábrela en `http://localhost:3000`.

---

## 4. Crear tu primera cuenta de administrador

1. Con la app corriendo (local o ya publicada), entra a `/admin-signup`.
2. Llena el formulario con el código que pusiste en `ADMIN_SIGNUP_CODE`.
3. Inicia sesión en `/login` con esa cuenta — vas a caer directo en el panel
   de administrador.

Los **estudiantes**, en cambio, se registran ellos mismos desde `/signup` (así
lo pidieron: registro abierto, cada quien crea su cuenta).

> Si en algún momento necesitas convertir a un estudiante ya registrado en
> administrador, ve a Supabase → **Table Editor → profiles**, busca su fila y
> cambia la columna `role` de `student` a `admin`. Por seguridad, esto no se
> puede hacer desde la app ni desde el navegador de nadie — solo desde el
> panel de Supabase.

---

## 5. Publicar la app (Vercel)

1. Sube este proyecto a un repositorio de GitHub.
2. Entra a [vercel.com](https://vercel.com) → **Add New → Project** → importa
   ese repositorio.
3. En **Environment Variables**, agrega las mismas 4 variables del paso 2
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SIGNUP_CODE`).
4. Dale **Deploy**. En unos minutos tienes la URL pública de la app.

Cada vez que quieras actualizar la app, subes los cambios a GitHub y Vercel
la vuelve a publicar sola.

---

## Cómo está pensada la seguridad

- Cada estudiante **solo puede ver y editar sus propios datos**. Esto no
  depende de la interfaz — está reforzado directamente en la base de datos
  (Row Level Security de Supabase), así que aunque alguien intente forzarlo
  técnicamente, no puede leer datos de otro estudiante.
- Nadie puede autoasignarse el rol de administrador desde el navegador, ni
  siquiera manipulando la app: crear un admin **solo** ocurre en el servidor,
  validando el `ADMIN_SIGNUP_CODE` que solo ustedes conocen.
- El feedback que un administrador deja es privado: solo ese estudiante y
  el equipo de administradores lo pueden leer.

---

## Sobre el logo

El logotipo que ves en la app (`src/components/Logo.tsx`) es una
**aproximación escrita** a partir del manual de marca (mismos colores y
proporciones), porque solo tuve capturas de pantalla del PDF, no el archivo
original. Si tienen el logo en SVG o PNG con fondo transparente, lo ideal es
reemplazar ese componente por la imagen real — con mandarlo, se los dejo
integrado en un ajuste rápido.

Colores de marca usados en toda la app:

| Color | HEX |
|---|---|
| Verde institucional | `#b7ef10` |
| Negro | `#1a1a1a` |
| Blanco | `#feffff` |

---

## Sobre la conexión con Instagram

Pediste empezar con carga manual y conectar la API de Instagram más
adelante — así está construida la app hoy: cada estudiante ingresa sus
métricas (seguidores, alcance, reels) a mano desde su panel.

Cuando quieran dar el salto a la conexión automática, así funciona en
términos generales (para que el equipo lo tenga mapeado):

1. Cada estudiante necesita una cuenta de Instagram **Business o Creator**
   conectada a una **página de Facebook**.
2. Ustedes crean una app oficial en [developers.facebook.com](https://developers.facebook.com)
   y solicitan acceso a la Instagram Graph API.
3. Meta puede pedir una revisión de la app antes de aprobar los permisos de
   lectura de métricas (puede tardar de días a un par de semanas).
4. Cada estudiante autoriza esa app una vez (pantalla de login de Meta) y a
   partir de ahí sus métricas se sincronizan solas.

Es trabajo real de integración, pero la base de datos ya está lista para
recibir esos datos sin cambiar el resto de la app.

---

## Seguridad de dependencias (para quien dé mantenimiento)

El proyecto usa **Next.js 14.2.35**, la versión más reciente y con parches de
seguridad dentro de la serie 14.x (`npm audit` ya no marca vulnerabilidades
críticas). Quedan 2 advisories de severidad "alta" que Next.js solo resuelve
en la versión 15/16, la cual cambia la forma en que se leen las cookies y los
parámetros de las páginas (requiere ajustar código, no es un simple
`npm update`). Antes de ese salto conviene tener la app ya en producción y
hacerlo como una tarea aparte con un desarrollador, probando bien el login
después. Mientras tanto, corre `npm audit` de vez en cuando para revisar el
estado.

---

## Estructura del proyecto

```
supabase/schema.sql        Todo el esquema de base de datos + seguridad
src/app/                   Páginas (Next.js App Router)
  (público)                 /, /login, /signup, /admin-signup
  dashboard/                Panel de estudiante (resumen, instagram, negocio, feedback)
  admin/                    Panel de administrador (resumen, lista y detalle de estudiantes)
src/components/            Componentes reutilizables (UI, gráficas, logo, layout)
src/lib/                   Clientes de Supabase, tipos, cálculos de métricas, acciones de servidor
```

---

¿Dudas o cambios? Este código está pensado para que cualquier desarrollador
de Next.js/Supabase pueda darle mantenimiento sin tener que rehacer nada
desde cero.

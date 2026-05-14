# Add-Ons MCenter

Aplicación web para la gestión, publicación, descarga y administración de addons.

## Tecnologías utilizadas

- Angular 21
- Spring Boot
- Java 21
- Node.js
- PostgreSQL
- Docker
- Docker Compose

---

## 1. Instalación de la aplicación en Linux

### 1.1 Descarga del repositorio

Es necesario tener los archivos base del proyecto. Después, se debe descomprimir el ZIP y trabajar desde la carpeta creada.

El proyecto necesita dos repositorios: frontend y backend. Para descargarlos se usa el script `descargar_repositorio.sh`.

```bash
cd <zona_de_descarga>
sudo chmod 777 descargar_repositorio.sh
./descargar_repositorio.sh
```

Si se crean dos carpetas llamadas `frontend` y `proyectoAddon`, significa que se ha clonado correctamente.

---

### 1.2 Levantamiento del frontend y backend

Para levantar el proyecto son necesarios estos ficheros:

- `docker-compose.yml`: fichero principal que levanta los servicios.
- `Dockerfile` del frontend: crea la imagen de Angular con sus dependencias.
- `Dockerfile` del backend: crea la imagen de Spring Boot con sus dependencias.

Para levantar todo el proyecto, ejecuta:

```bash
cd <zona_de_descarga>
sudo chmod 777 setup_docker.sh
./setup_docker.sh
```

Este script instalará Docker y Docker Compose si es necesario. Si todo funciona correctamente, el proyecto quedará desplegado.

Una vez terminado el proceso, se podrá acceder a:

- Frontend Angular: `http://localhost:4000`
- Backend Spring Boot: `http://localhost:8080`

Para apagar el proyecto:

```bash
cd <zona_de_descarga>
sudo chmod 777 apagar.sh
./apagar.sh
```

---

## 2. Uso de la aplicación

### 2.1 Requisitos generales

- Navegador Chromium versión 110 o superior
- Navegador Firefox versión 110 o superior
- Conexión a Internet

---

## 2.2 Tipos de usuario

La aplicación dispone de los siguientes tipos de usuario:

- Usuario invitado
- Usuario verificado
- Usuario creador
- Usuario administrador

---

### 2.2.1 Usuario invitado

El usuario invitado es un usuario no logueado con acceso parcial a la aplicación.

#### Capacidades

**Visualizar y descargar addons**

1. Pulsar en `Home`.
2. Navegar hacia un addon específico.
3. Consultar información del addon, creador, especificaciones, imágenes y archivos.
4. Bajar hasta el listado de archivos.
5. Pulsar `Descargar` en uno de los archivos.

**Buscar addons**

El usuario puede buscar addons por:

- Creador
- Palabras clave
- Actualización más reciente
- Más gustados
- Orden A-Z

**Enviar reportes**

1. Ir a `Contacto`.
2. Rellenar los campos.
3. Pulsar `Enviar`.

**Otras acciones disponibles**

- Visualizar rankings.
- Visualizar perfiles de creadores.
- Leer privacidad, términos y condiciones.
- Instalar la aplicación como PWA.

La aplicación puede instalarse como Progressive Web App en Windows, Linux, Mac y Android mediante el botón de instalación del navegador.

---

### 2.2.2 Usuario verificado

El usuario verificado es un usuario con cuenta. Puede hacer todo lo del usuario invitado y, además, acceder a más funciones.

#### Registro

1. Pulsar `Regístrate`.
2. Rellenar el nombre de usuario.
3. Rellenar el correo electrónico.
4. Rellenar la contraseña.
5. Revisar el correo electrónico y copiar el código de verificación.
6. Introducir el código de 6 dígitos.
7. Pulsar `Completar Registro`.

> Es necesario usar un correo real y una contraseña segura.

#### Acceso

1. Pulsar `Accede`.
2. Rellenar el correo electrónico.
3. Rellenar la contraseña.
4. Pulsar `Entrar`.

#### Capacidades

- Dar like a un addon pulsando el icono de corazón.
- Suscribirse a un creador desde su perfil.
- Acceder a la bandeja de entrada de suscripciones.
- Consultar nombre y email desde el perfil.
- Alternar entre modo oscuro y modo claro.
- Convertirse en creador.
- Cerrar sesión.

#### Reportes disponibles

- Reportar Add-On
- Reportar archivo de Add-On
- Reportar usuario creador

---

### 2.2.3 Usuario creador

El usuario creador es un usuario verificado que ha pulsado el botón `Conviértete en creador`.

#### Sección Mis Creaciones

**Nueva creación**

1. Rellenar el nombre del proyecto.
2. Añadir URL de miniatura o subir imagen.
3. Rellenar tipo y tag.
4. Rellenar la descripción del proyecto.
5. Pulsar `Publicar`.

**Subir archivo**

1. Subir fichero.
2. Rellenar versión de juego.
3. Rellenar versión del addon.
4. Rellenar registro de cambios.
5. Pulsar `Subir Archivos`.

**Invitar creador a proyecto**

1. Buscar creador.
2. Pulsar `Invitar al proyecto`.

**Otras acciones**

- Editar campos de un proyecto.
- Ver rápidamente el addon seleccionado.
- Consultar estadísticas de descargas por addon.
- Editar nombre y descripción del perfil.
- Acceder rápidamente al perfil, proyectos y estadísticas.

---

### 2.2.4 Usuario administrador

El usuario administrador es el superusuario de la aplicación. Puede administrar usuarios, archivos, addons y reportes.

#### Capacidades

**Sección de reportes**

- Visualizar el listado total de reportes.
- Marcar reportes como solucionados.
- Tomar las acciones pertinentes.

**Mediador de usuarios**

- Dar de baja o alta a una cuenta.

**Mediador de archivos**

- Dar de baja o alta un archivo.

**Mediador de addons**

- Dar de baja o alta un addon.

> Dar de baja un addon, archivo o usuario solo lo deshabilita. No se elimina de la base de datos.

---

## 3. Configuración de la aplicación

Toda la configuración de la aplicación se realiza mediante el archivo `.env`.

---

### 3.1 Base de datos

Configuración de PostgreSQL:

```env
DB_HOST=db
DB_PORT=5432
POSTGRES_DB=mydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=psql
```

- `DB_HOST`: host de la base de datos.
- `DB_PORT`: puerto de conexión.
- `POSTGRES_DB`: nombre de la base de datos.
- `POSTGRES_USER`: usuario de acceso.
- `POSTGRES_PASSWORD`: contraseña de acceso.

---

### 3.2 Backend

Configuración del backend en Spring Boot:

```env
BACKEND_HOST=localhost
BACKEND_PORT=8080
```

- `BACKEND_HOST`: host del backend.
- `BACKEND_PORT`: puerto usado por el backend.

---

### 3.3 Frontend

Configuración del frontend en Angular:

```env
FRONTEND_HOST=localhost
FRONTEND_PORT=4000
```

- `FRONTEND_HOST`: host del frontend.
- `FRONTEND_PORT`: puerto usado por el frontend.

---

### 3.4 Administrador por defecto

Credenciales iniciales del administrador:

```env
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
ADMIN_NAME=admin
```

> Se recomienda cambiar estas credenciales en producción.

---

### 3.5 Configuración multimedia

URL base para almacenar archivos:

```env
MEDIA_BASE_URL=https://www.trmc-addons.com/tfg-media
```

Este directorio se usa como endpoint público disponible.

---

### 3.6 Protocolo de la aplicación

```env
APP_PROTOCOL=http
```

Define el protocolo utilizado por la aplicación. En producción puede cambiarse a HTTPS.

---

## 4. Estructura esperada

```txt
zona_de_descarga/
├── frontend/
├── proyectoAddon/
├── docker-compose.yml
├── descargar_repositorio.sh
├── setup_docker.sh
├── apagar.sh
└── .env
```

---

## 5. Scripts disponibles

| Script | Descripción |
|---|---|
| `descargar_repositorio.sh` | Descarga los repositorios frontend y backend |
| `setup_docker.sh` | Instala Docker/Docker Compose si es necesario y levanta el proyecto |
| `apagar.sh` | Detiene los contenedores del proyecto |

---

## 6. Acceso a la aplicación

- Frontend: `http://localhost:4000`
- Backend: `http://localhost:8080`

---

## 7. Notas de producción

Para producción se recomienda:

- Cambiar las credenciales por defecto del administrador.
- Usar contraseñas seguras para PostgreSQL.
- Configurar `APP_PROTOCOL=https`.
- Configurar correctamente el dominio público.
- Revisar los permisos de los scripts.
- Evitar `chmod 777` salvo en entornos controlados.
- Configurar copias de seguridad de la base de datos.

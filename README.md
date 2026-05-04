# TicoAuto - Cliente Web

Aplicación web del marketplace TicoAuto. Permite a los usuarios registrarse, autenticarse, publicar vehículos en venta, ver detalles, hacer preguntas y responder.

Consume dos APIs:
- **API REST** (puerto 3008) → autenticación, registro, escrituras y subida de imágenes
- **API GraphQL** (puerto 4000) → todas las consultas (lecturas)

## Tecnologías

- HTML5, CSS3, JavaScript Vanilla (sin frameworks)
- Live Server (extensión de VS Code) para ejecutar en local

## Requisitos previos

- VS Code con la extensión **Live Server** instalada
- Tener corriendo el API REST (puerto 3008)
- Tener corriendo el API GraphQL (puerto 4000)

## Instalación

No hay dependencias que instalar. Solo clonar el repo:

```bash
git clone <url-del-repo>
cd ISW-711-Proyecto2-TicoAuto-Client
```

## Cómo correrlo

1. Abrir la carpeta en VS Code
2. Click derecho sobre `index.html` → **Open with Live Server**
3. Se abre en `http://127.0.0.1:5500/ISW-711-Proyecto2-TicoAuto-Client/`

## Páginas

- `index.html` - Listado público de vehículos con filtros
- `login.html` - Login con email/contraseña + 2FA, o login con Google
- `register.html` - Registro de usuario (validación con Padrón)
- `verify.html` - Verificación de cuenta por correo
- `Vehicle.html` - Mis vehículos (crear, editar, eliminar)
- `VehicleDetail.html` - Detalle del vehículo + preguntas y respuestas
- `google-callback.html` - Callback del login con Google
- `google-cedula.html` - Verificación de cédula tras login con Google

## Configuración

Las URLs de los APIs están dentro de los archivos JS. Si tus servidores corren en puertos distintos, hay que actualizarlas en cada archivo (`http://localhost:3008` para REST y `http://localhost:4000/graphql` para GraphQL).
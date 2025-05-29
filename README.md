# Sistema de Validación de Usuarios

## 📋 Descripción

Sistema web funcional desarrollado en Vue.js con Vite que permite validar usuarios mediante su cédula. Si el usuario no está registrado, ofrece un formulario para completar sus datos y enviarlos vía WhatsApp. Diseñado para ser utilizado en puntos de venta (PDVs) para gestionar accesos o registros de manera eficiente.

## 🚀 Tecnologías Utilizadas

- **Frontend**: Vue.js 3
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript
- **API**: REST API para validación y registro

## 📁 Estructura del Proyecto

```
├── Landing/
├── codegpt/
├── vscode/
├── node_modules/
├── public/
└── src/
    ├── assets/
    ├── components/
    ├── router/
    ├── App.vue
    ├── main.ts
    ├── shims-vue.d.ts
    ├── eslint.config.js
    ├── .gitignore
    ├── .prettierrc.json
    ├── env.d.ts
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── tsconfig.vitest.json
    └── vite.config.ts
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm 

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sorihuen/web-validaci-n.git
   cd Landing
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir para producción**
   ```bash
   npm run build
   ```

## 🌐 API Endpoints

### Validación de Usuario
```http
GET https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/X/
```
- **Parámetro**: `X` = número de cédula
- **Respuesta exitosa**: Datos del usuario (nombre, teléfono, foto, ciudad)
- **Respuesta fallida**: Usuario no encontrado

### Registro de Usuario
```http
POST https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/X/
```
- **Body**: Datos del formulario de registro
- **Respuesta**: Confirmación de registro exitoso

## 📱 Flujo Funcional

### 1. Validación de Cédula
- El usuario ingresa su número de cédula
- Al hacer clic en **"Validar"**, se consulta la API
- Si existe: muestra datos del usuario
- Si no existe: muestra formulario de registro

### 2. Usuario Registrado
Cuando el usuario está registrado, se muestran:
- ✅ Nombre completo
- 📞 Teléfono
- 📷 Foto (si disponible)
- 🏙️ Ciudad
- **Mensaje**: "Usuario encontrado. Puedes continuar con el proceso."

### 3. Usuario NO Registrado
Si el usuario no está registrado:
- ❌ **Mensaje**: "No estás registrado."
- **Formulario con campos**:
  - Cédula (precargada)
  - Nombre completo
  - Número de teléfono
  - Ciudad (Cali, Bogotá, Medellín, u "Otro")
  - Subir foto (archivo o cámara)

### 4. Integración WhatsApp
Al completar el proceso, se abre WhatsApp con:
- **Número**: +57 3001234567
- **Mensaje prellenado**: Datos del usuario o confirmación de registro

## 🎨 Estilos y UI

El proyecto utiliza **Tailwind CSS** para:
- Diseño responsive
- Componentes modernos y accesibles
- Interfaz intuitiva para PDVs
- Optimización móvil

## 🛠️ Scripts Disponibles

```json
{
  "scripts": {
    "dev": "npm run dev",
    "build": "npm run build",
    "preview": "npm run preview",
    "lint": "npm run lint"
  }
}
```

## 📂 Componentes Principales

- **ValidationForm**: Formulario de validación de cédula
- **UserDisplay**: Mostrar información de usuario registrado
- **RegistrationForm**: Formulario de registro de nuevos usuarios
- **WhatsAppIntegration**: Manejo de redirección a WhatsApp

## 🌟 Características

- ✅ **Funcional y en producción**
- ✅ **Validación en tiempo real**
- ✅ **Formulario dinámico**
- ✅ **Integración WhatsApp**
- ✅ **Subida de fotos**
- ✅ **Responsive design**
- ✅ **TypeScript support**

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```
Servidor local en: `http://localhost:5173`

### Producción
```bash
npm run build
npm run preview
```

## 📞 Contacto WhatsApp

**Número de destino**: +57 3001234567

**Formato del mensaje**:
```
Hola! Soy [NOMBRE]
Cédula: [CEDULA]
Teléfono: [TELEFONO]
Ciudad: [CIUDAD]
Estado: [REGISTRADO/NUEVO_REGISTRO]
```

## 🔧 Configuración Adicional

### Variables de Entorno
Crear archivo `.env` con:
```env
VITE_API_BASE_URL=https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/
VITE_WHATSAPP_NUMBER=573001234567
```


## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

---

**Desarrollado para sistemas PDV con Vue.js + Vite + Tailwind CSS**
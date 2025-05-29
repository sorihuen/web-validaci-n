<script setup>
/**
 * RegistrationForm Component
 * 
 * Componente Vue 3 para el registro de nuevos usuarios en el sistema de validación.
 * Permite capturar datos del usuario, validar información y enviar registros al backend.
 * 
 * @author Sistema de Validación de Usuarios
 * @version 1.0.0
 * 
 * Features:
 * - Validación de teléfono en tiempo real
 * - Subida y previsualización de imágenes
 * - Integración con WhatsApp
 * - Manejo de estados de carga
 * - Validación de formularios
 */

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// ==================== CONFIGURACIÓN Y RUTAS ====================
const route = useRoute();
const router = useRouter();
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// ==================== ESTADOS REACTIVOS ====================

// Estados del formulario
const displayNotFoundMessage = ref(false);
const cedula = ref('');
const nombre = ref('');
const telefono = ref('');
const ciudad = ref('');
const otraCiudad = ref('');

// Estados de la imagen
const foto = ref(null);
const fotoPreview = ref(null);

// Estados de validación y errores
const errorTelefono = ref(null);
const errorFoto = ref(null);

// Estados de proceso
const registroExitoso = ref(false);
const datosParaMensaje = ref(null);
const loadingSubmit = ref(false);
const loadingImage = ref(false);

// ==================== CONFIGURACIÓN ====================
const cities = ['Cali', 'Bogotá', 'Medellín', 'Otro'];

// ==================== LIFECYCLE HOOKS ====================

/**
 * Inicializa el componente con datos de la ruta
 * Valida que se haya proporcionado una cédula válida
 */
onMounted(() => {
  if (!route.query.cedula) {
    alert('No se proporcionó una cédula.');
    router.push({ name: 'Home' });
  } else {
    cedula.value = route.query.cedula;
    if (route.query.source === 'validationNotFound') {
      displayNotFoundMessage.value = true;
    }
  }
});

// ==================== VALIDACIONES ====================

/**
 * Valida el formato del número de teléfono
 * @param {string} tel - Número de teléfono a validar
 * @returns {boolean} - True si es válido
 * 
 * Reglas:
 * - Solo números
 * - Exactamente 10 dígitos
 * - Campo obligatorio
 */
const validarTelefono = (tel) => {
  const regexSoloNumeros = /^[0-9]+$/;
  
  if (!tel || tel.trim() === '') {
    errorTelefono.value = 'El teléfono es obligatorio.';
    return false;
  }
  
  if (!regexSoloNumeros.test(tel)) {
    errorTelefono.value = 'El teléfono debe contener solo números.';
    return false;
  }
  
  if (tel.length !== 10) {
    errorTelefono.value = 'El teléfono debe tener exactamente 10 dígitos.';
    return false;
  }
  
  errorTelefono.value = null;
  return true;
};

/**
 * Valida teléfono en tiempo real mientras el usuario escribe
 */
const validarTelefonoAlEscribir = () => {
  if (telefono.value) {
    validarTelefono(telefono.value);
  } else {
    errorTelefono.value = null;
  }
};

// ==================== MANEJO DE ARCHIVOS ====================

/**
 * Procesa la imagen seleccionada y genera vista previa
 * @param {Event} event - Evento del input file
 */
const cargarFoto = (event) => {
  const file = event.target.files[0];
  
  if (file) {
    errorFoto.value = null;
    const reader = new FileReader();
    
    reader.onload = (e) => {
      fotoPreview.value = e.target.result;
      foto.value = file;
    };
    
    reader.readAsDataURL(file);
  } else {
    fotoPreview.value = null;
    foto.value = null;
  }
};

// ==================== API CALLS ====================

/**
 * Envía los datos del usuario al backend
 * @returns {Promise<void>}
 * 
 * Endpoint: POST /api/dinamic-db/report/{cedula}/assesmentDEV
 * Headers: Authorization con token, Content-Type JSON
 */
const enviarDatosAlBackend = async () => {
  const finalCity = ciudad.value === 'Otro' ? otraCiudad.value : ciudad.value;

  const formData = {
    cedula: cedula.value,
    nombre: nombre.value,
    telefono: telefono.value,
    ciudad: finalCity,
    foto: fotoPreview.value
  };

  try {
    const res = await fetch(`/api/dinamic-db/report/${cedula.value}/assesmentDEV`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`,
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      datosParaMensaje.value = {
        cedula: cedula.value,
        nombre: nombre.value,
        telefono: telefono.value,
        ciudad: finalCity
      };
      registroExitoso.value = true;
      displayNotFoundMessage.value = false;
    } else {
      const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
      alert(`Error al registrar: ${errorData.message || res.statusText}`);
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    alert('Error de conexión al enviar los datos.');
  }
};

// ==================== PROCESAMIENTO DE FORMULARIO ====================

/**
 * Maneja el envío del formulario de registro
 * Valida todos los campos antes de enviar
 */
const registrarUsuario = async () => {
  const telefonoValido = validarTelefono(telefono.value);

  if (!fotoPreview.value) {
    errorFoto.value = 'Debes seleccionar una foto.';
  } else {
    errorFoto.value = null;
  }

  if (!telefonoValido || !fotoPreview.value) return;

  loadingSubmit.value = true;
  await enviarDatosAlBackend();
  loadingSubmit.value = false;
};

// ==================== UTILIDADES ====================

/**
 * Genera URL temporal simulada para la imagen
 * @param {string} base64Imagen - Imagen en formato base64
 * @returns {Promise<string>} - URL temporal de la imagen
 * 
 * Nota: Función de simulación, en producción se debe reemplazar
 * por el servicio real de almacenamiento de imágenes
 */
async function generarUrlTemporalParaImagen(base64Imagen) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!base64Imagen || typeof base64Imagen !== 'string' || !base64Imagen.startsWith('data:image')) {
    throw new Error("Formato inválido.");
  }
  
  const nombreArchivoSimulado = `imagen_${Date.now()}.png`;
  return `https://url-generada.com/uploads/${nombreArchivoSimulado}`;
}

// ==================== INTEGRACIÓN WHATSAPP ====================

/**
 * Procesa los datos y redirige a WhatsApp con mensaje prellenado
 * Incluye procesamiento de imagen y construcción del mensaje
 */
const procederConWhatsAppYRedirigir = async () => {
  if (!datosParaMensaje.value) {
    alert('No hay datos para el mensaje. Redirigiendo...');
    router.push({ name: 'Home' });
    return;
  }

  loadingImage.value = true;

  const { cedula: cedulaMsg, nombre: nombreMsg, telefono: telefonoMsg, ciudad: ciudadMsg } = datosParaMensaje.value;
  let fotoMensaje = "No se pudo procesar la foto.";

  if (fotoPreview.value) {
    try {
      const urlFotoTemporal = await generarUrlTemporalParaImagen(fotoPreview.value);
      fotoMensaje = `Foto: ${urlFotoTemporal}`;
    } catch (error) {
      console.error("Error al generar la URL de la imagen:", error);
    }
  } else {
    fotoMensaje = "No se adjuntó foto.";
  }

  loadingImage.value = false;

  const message = `Hola mis datos son: Cédula: ${cedulaMsg}, Nombre: ${nombreMsg}, Teléfono: ${telefonoMsg}, Ciudad: ${ciudadMsg}. ${fotoMensaje}`;
  window.open(`https://wa.me/+573001234567?text=${encodeURIComponent(message)}`, '_blank');

  setTimeout(() => {
    router.push({ name: 'Home' });
  }, 500);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
      
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white">Registro de Nuevo Usuario</h2>
          <div class="w-20 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
        </div>
      </div>

      <div class="p-8">
        
        <!-- Not Found Message -->
        <div v-if="displayNotFoundMessage" 
             class="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-yellow-800 font-semibold">Usuario no encontrado</p>
              <p class="text-yellow-700 text-sm mt-1">Por favor, completa el formulario para registrarte en nuestro sistema.</p>
            </div>
          </div>
        </div>

        <!-- Registration Form -->
        <div v-if="!registroExitoso">
          <form @submit.prevent="registrarUsuario" class="space-y-6">
            
            <!-- Cedula Field (Read-only) -->
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0h4"></path>
                </svg>
                Cédula
              </label>
              <input 
                type="text" 
                :value="cedula" 
                readonly 
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed" 
              />
            </div>

            <!-- Full Name Field -->
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Nombre completo
              </label>
              <input 
                v-model="nombre" 
                required 
                placeholder="Ingresa tu nombre completo"
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-gray-800 placeholder-gray-400" 
              />
            </div>

            <!-- Phone Field with Validation -->
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Teléfono
              </label>
              <input 
                v-model="telefono" 
                type="text" 
                @input="validarTelefonoAlEscribir"
                placeholder="Ingresa tu número de teléfono"
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-gray-800 placeholder-gray-400" 
              />
              <div v-if="errorTelefono" class="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ errorTelefono }}</span>
              </div>
            </div>

            <!-- City Selection -->
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Ciudad
              </label>
              <select 
                v-model="ciudad" 
                required 
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-gray-800 bg-white"
              >
                <option value="">Selecciona una ciudad</option>
                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>

            <!-- Custom City Field (Conditional) -->
            <div v-if="ciudad === 'Otro'" class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Especifica tu ciudad
              </label>
              <input 
                v-model="otraCiudad" 
                required 
                placeholder="Escribe el nombre de tu ciudad"
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-gray-800 placeholder-gray-400" 
              />
            </div>

            <!-- Photo Upload Field -->
            <div class="space-y-2">
              <label class="flex items-center text-sm font-semibold text-gray-700">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Foto (obligatoria)
              </label>
              <input 
                type="file" 
                accept="image/*;capture=camera" 
                @change="cargarFoto" 
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 file:transition-colors file:duration-200" 
              />
              
              <!-- Photo Preview -->
              <div v-if="fotoPreview" class="flex justify-center mt-4">
                <div class="relative">
                  <img :src="fotoPreview" alt="Vista previa" class="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg" />
                  <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Photo Error Message -->
              <div v-if="errorFoto" class="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ errorFoto }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="loadingSubmit" 
              class="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              <span v-if="loadingSubmit" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando registro...
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                Enviar Registro
              </span>
            </button>
          </form>
        </div>

        <!-- Success State -->
        <div v-else class="text-center py-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <h3 class="text-2xl font-bold text-green-700 mb-3">¡Registro Exitoso!</h3>
          <p class="text-gray-600 mb-8 leading-relaxed">Tus datos han sido guardados correctamente en nuestro sistema. Haz clic en el botón de abajo para notificar por WhatsApp y finalizar el proceso.</p>
          
          <button
            @click="procederConWhatsAppYRedirigir"
            :disabled="loadingImage"
            class="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <span v-if="loadingImage" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando imagen...
            </span>
            <span v-else class="flex items-center justify-center">
              Continuar y Enviar por WhatsApp
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>

        <!-- Security Notice -->
        <div class="mt-8 text-center">
          <div class="inline-flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Todos los datos son seguros y confidenciales</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
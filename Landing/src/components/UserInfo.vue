/**
 * @fileoverview Componente de perfil de usuario con integración WhatsApp
 * @description Maneja la visualización de datos de usuario desde localStorage,
 */

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// ================================
// CONFIGURACIÓN Y CONSTANTES
// ================================

/**
 * Número de WhatsApp destino para envío de datos
 * @type {string}
 */
const WHATSAPP_NUMBER = '+573001234567';

/**
 * Tiempo de espera antes de redirección automática (ms)
 * @type {number}
 */
const REDIRECT_DELAY = 3000;

/**
 * Tiempo de simulación para procesamiento de imagen (ms)
 * @type {number}
 */
const IMAGE_PROCESSING_DELAY = 1500;

/**
 * Tiempo de espera después de abrir WhatsApp antes de redirección (ms)
 * @type {number}
 */
const WHATSAPP_REDIRECT_DELAY = 500;

// ================================
// COMPOSABLES Y ESTADO REACTIVO
// ================================

/**
 * Router de Vue para navegación programática
 * @type {Router}
 */
const router = useRouter();

/**
 * Datos del usuario cargados desde localStorage
 * @type {Ref<Object|null>}
 */
const user = ref(null);

/**
 * Estado de carga de datos de usuario
 * @type {Ref<boolean>}
 */
const loadingUser = ref(true);

/**
 * Estado de procesamiento de imagen
 * @type {Ref<boolean>}
 */
const loadingImage = ref(false);

// ================================
// TIPOS Y INTERFACES (JSDoc)
// ================================

/**
 * @typedef {Object} UserData
 * @property {string} [cedula] - Cédula de identidad principal
 * @property {string} [id_user] - ID de usuario alternativo
 * @property {string} [nombre] - Nombre principal del usuario
 * @property {string} [nombre_completo] - Nombre completo alternativo
 * @property {string} [telefono] - Número de teléfono principal
 * @property {string} [telefono_celular] - Número de teléfono alternativo
 * @property {string} [ciudad] - Ciudad de residencia principal
 * @property {string} [ciudad_residencia] - Ciudad de residencia alternativa
 * @property {string} [foto] - Imagen en formato base64 con prefijo data:image
 */

/**
 * @typedef {Object} StoredUserResponse
 * @property {UserData[]} result - Array con datos de usuario
 */

// ================================
// HOOKS DE CICLO DE VIDA
// ================================

/**
 * Hook ejecutado al montar el componente
 * Carga y valida datos de usuario desde localStorage
 * 
 * @description Realiza las siguientes operaciones:
 * 1. Obtiene datos de localStorage con key 'usuario'
 * 2. Valida estructura JSON y existencia de datos
 * 3. Asigna primer elemento del array result al estado user
 * 4. Maneja errores y redirige en caso de fallo
 */
onMounted(() => {
  loadingUser.value = true;
  
  try {
    const storedUser = localStorage.getItem('usuario');
    
    if (!storedUser) {
      console.warn('UserProfile: No se encontró "usuario" en localStorage');
      redirectToHomeWithDelay();
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    
    // Validación de estructura de datos
    if (!parsedUser.result || !Array.isArray(parsedUser.result) || parsedUser.result.length === 0) {
      console.warn('UserProfile: Estructura de datos inválida en localStorage');
      redirectToHomeWithDelay();
      return;
    }

    user.value = parsedUser.result[0];
    console.info('UserProfile: Datos de usuario cargados exitosamente');

  } catch (error) {
    console.error('UserProfile: Error al parsear datos de localStorage:', error);
    redirectToHomeWithDelay();
  } finally {
    loadingUser.value = false;
  }
});

// ================================
// FUNCIONES DE NAVEGACIÓN
// ================================

/**
 * Redirige inmediatamente a la página de inicio
 * 
 * @function redirectToHome
 * @returns {void}
 */
const redirectToHome = () => {
  router.push({ name: 'Home' });
};

/**
 * Redirige a la página de inicio después del delay configurado
 * Utilizado para dar tiempo al usuario de leer mensajes de error
 * 
 * @function redirectToHomeWithDelay
 * @returns {void}
 */
const redirectToHomeWithDelay = () => {
  setTimeout(() => {
    redirectToHome();
  }, REDIRECT_DELAY);
};

// ================================
// PROCESAMIENTO DE IMÁGENES
// ================================

/**
 * Simula la subida de imagen base64 al backend y genera URL temporal
 * 
 * @async
 * @function generateTemporaryImageUrl
 * @param {string} base64Image - Imagen en formato base64 con prefijo data:image
 * @returns {Promise<string>} URL temporal simulada de la imagen
 * @throws {Error} Si el formato de imagen base64 es inválido
 * 
 * @example
 * const url = await generateTemporaryImageUrl('data:image/png;base64,iVBOR...');
 * console.log(url); // 'https://url-temporal-generada.com/uploads/imagen_1234567890.png'
 */
async function generateTemporaryImageUrl(base64Image) {
  console.info('UserProfile: Iniciando simulación de subida de imagen');

  // Simular delay de red/procesamiento
  await new Promise(resolve => setTimeout(resolve, IMAGE_PROCESSING_DELAY));

  // Validación de formato base64
  if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
    throw new Error('Formato de imagen base64 inválido');
  }

  // Generar URL simulada con timestamp único
  const simulatedFileName = `imagen_${Date.now()}.png`;
  const simulatedUrl = `https://url-temporal-generada.com/uploads/${simulatedFileName}`;

  console.info('UserProfile: URL temporal generada:', simulatedUrl);
  return simulatedUrl;
}

// ================================
// INTEGRACIÓN WHATSAPP
// ================================

/**
 * Procesa datos de usuario, maneja imagen y abre WhatsApp Web
 * 
 * @async
 * @function openWhatsAppAndRedirect
 * @returns {Promise<void>}
 * 
 * @description Flujo de ejecución:
 * 1. Valida existencia de datos de usuario
 * 2. Extrae y normaliza información del usuario
 * 3. Procesa imagen si está disponible (con manejo de errores)
 * 4. Construye mensaje para WhatsApp
 * 5. Abre WhatsApp Web con mensaje pre-rellenado
 * 6. Redirige al inicio después del delay
 * 
 * @example
 * // Llamada desde template
 * <button @click="openWhatsAppAndRedirect">Enviar por WhatsApp</button>
 */
const openWhatsAppAndRedirect = async () => {
  // Validación inicial de datos
  if (!user.value) {
    alert('Error: No se encontraron datos de usuario.');
    router.push({ name: 'Home' });
    return;
  }

  loadingImage.value = true;

  try {
    // Normalización de datos con fallbacks
    const userData = {
      cedula: user.value.cedula || user.value.id_user || 'N/A',
      nombre: user.value.nombre || user.value.nombre_completo || 'N/A',
      telefono: user.value.telefono || user.value.telefono_celular || 'N/A',
      ciudad: user.value.ciudad || user.value.ciudad_residencia || 'N/A'
    };

    let photoMessage = "No se adjuntó foto.";

    // Procesamiento de imagen (si existe)
    if (user.value.foto) {
      try {
        const temporaryPhotoUrl = await generateTemporaryImageUrl(user.value.foto);
        photoMessage = `Foto: ${temporaryPhotoUrl}`;
      } catch (error) {
        console.error('UserProfile: Error procesando imagen:', error.message);
        photoMessage = "Error al procesar la foto (enlace no disponible)."; 
      }
    }

    // Construcción del mensaje para WhatsApp
    const message = `Hola mis datos son: Cédula: ${userData.cedula}, Nombre: ${userData.nombre}, Teléfono: ${userData.telefono}, Ciudad: ${userData.ciudad}. ${photoMessage}`;

    console.info('UserProfile: Mensaje construido para WhatsApp:', message);

    // Apertura de WhatsApp Web
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    console.info('UserProfile: WhatsApp abierto exitosamente');

  } catch (error) {
    console.error('UserProfile: Error al abrir WhatsApp:', error);
    alert('No se pudo abrir WhatsApp. Verifica que no tengas bloqueadores de pop-ups activos.');
  } finally {
    loadingImage.value = false;
    
    // Redirección con delay para UX
    setTimeout(() => {
      router.push({ name: 'Home' });
    }, WHATSAPP_REDIRECT_DELAY);
  }
};
</script>

<template>
  <!-- 
    CONTENEDOR PRINCIPAL
    Layout responsivo con gradiente de fondo y centrado vertical
  -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    
    <!-- TARJETA PRINCIPAL -->
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
      
      <!-- HEADER CON GRADIENTE -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 class="text-2xl font-bold text-white text-center">Datos del Usuario</h2>
        <div class="w-20 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
      </div>

      <div class="p-8">
        
        <!-- ESTADO: USUARIO ENCONTRADO -->
        <div 
          v-if="user" 
          class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg shadow-sm"
        >
          <!-- Mensaje de confirmación -->
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="ml-3 text-green-800 font-semibold">Usuario encontrado. Puedes continuar con el proceso.</p>
          </div>

          <!-- Información del usuario con iconos -->
          <div class="space-y-4">
            <!-- Nombre -->
            <div v-if="user.nombre || user.nombre_completo" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-gray-700">
                <strong class="text-gray-900">Nombre:</strong> 
                {{ user.nombre || user.nombre_completo }}
              </span>
            </div>
            
            <!-- Teléfono -->
            <div v-if="user.telefono || user.telefono_celular" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span class="text-gray-700">
                <strong class="text-gray-900">Teléfono:</strong> 
                {{ user.telefono || user.telefono_celular }}
              </span>
            </div>
            
            <!-- Ciudad -->
            <div v-if="user.ciudad || user.ciudad_residencia" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-gray-700">
                <strong class="text-gray-900">Ciudad:</strong> 
                {{ user.ciudad || user.ciudad_residencia }}
              </span>
            </div>
          </div>

          <!-- Sección de foto de perfil -->
          <div class="mt-6 text-center">
            <!-- Foto disponible -->
            <div v-if="user.foto && user.foto.startsWith('data:image')" class="inline-block">
              <div class="relative">
                <img 
                  :src="user.foto" 
                  alt="Foto del usuario" 
                  class="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg mx-auto" 
                />
                <!-- Indicador de foto válida -->
                <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Placeholder cuando no hay foto -->
            <div v-else class="inline-flex items-center justify-center h-24 w-24 bg-gray-200 rounded-full">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            
            <p v-if="!user.foto || !user.foto.startsWith('data:image')" class="text-gray-500 text-sm mt-2">
              No hay foto de perfil disponible
            </p>
          </div>
        </div>

        <!-- ESTADO: CARGANDO DATOS -->
        <div v-else-if="loadingUser" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600 font-medium">Cargando datos del usuario...</p>
          <p class="text-gray-400 text-sm mt-1">Por favor espera un momento</p>
        </div>

        <!-- ESTADO: ERROR - USUARIO NO ENCONTRADO -->
        <div v-else class="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-red-800 font-semibold">Usuario no encontrado</p>
              <p class="text-red-600 text-sm mt-1">Serás redirigido al inicio en unos segundos</p>
            </div>
          </div>
        </div>

        <!-- BOTÓN DE ACCIÓN PRINCIPAL -->
        <div class="mt-8">
          <button
            @click="openWhatsAppAndRedirect"
            :disabled="loadingImage || !user"
            class="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <!-- Estado: Procesando imagen -->
            <span v-if="loadingImage" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando imagen...
            </span>
            
            <!-- Estado: Listo para continuar -->
            <span v-else class="flex items-center justify-center">
              Continuar
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
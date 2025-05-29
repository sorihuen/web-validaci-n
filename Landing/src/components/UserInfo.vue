<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const loadingUser = ref(true);
const loadingImage = ref(false);

onMounted(() => {
  loadingUser.value = true;
  const storedUser = localStorage.getItem('usuario');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.result && parsedUser.result.length > 0) {
        user.value = parsedUser.result[0];
      } else {
        console.warn('LocalStorage contenía "usuario" pero "result" estaba vacío o no era un array.');
        irInicioConRetraso();
      }
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      irInicioConRetraso();
    }
  } else {
    console.warn('No se encontró "usuario" en localStorage.');
    irInicioConRetraso();
  }
  loadingUser.value = false;
});

const irInicio = () => {
  router.push({ name: 'Home' });
};

const irInicioConRetraso = () => {
  setTimeout(() => {
    irInicio();
  }, 3000);
};

async function generarUrlTemporalParaImagen(base64Imagen) {
  console.log("Simulando subida de imagen al backend y generación de URL...");
  // No es necesario gestionar loadingImage aquí si ya se gestiona en la función que llama.
  // loadingImage.value = true; // Quitado de aquí

  await new Promise(resolve => setTimeout(resolve, 1500));

  if (!base64Imagen || typeof base64Imagen !== 'string' || !base64Imagen.startsWith('data:image')) {
    // loadingImage.value = false; // Quitado de aquí
    throw new Error("Formato de imagen base64 inválido para simulación.");
  }

  const nombreArchivoSimulado = `imagen_${Date.now()}.png`;
  const urlSimulada = `https://url-temporal-generada.com/uploads/${nombreArchivoSimulado}`;

  console.log("URL temporal simulada:", urlSimulada);
  // loadingImage.value = false; // Quitado de aquí
  return urlSimulada;
}

const abrirWhatsAppYRedirigir = async () => {
  if (!user.value) {
    alert('Error: No se encontraron datos de usuario.');
    router.push({ name: 'Home' });
    return;
  }

  // Establecer loadingImage a true solo si vamos a procesar una imagen.

  loadingImage.value = true; // Indicar que la operación completa está en progreso

  const cedulaMsg = user.value.cedula || user.value.id_user || 'N/A';
  const nombreMsg = user.value.nombre || user.value.nombre_completo || 'N/A';
  const telefonoMsg = user.value.telefono || user.value.telefono_celular || 'N/A';
  const ciudadMsg = user.value.ciudad || user.value.ciudad_residencia || 'N/A';

  let fotoMensaje = "No se adjuntó foto.";

  if (user.value.foto) {
    try {
      // La función generarUrlTemporalParaImagen ya no maneja loadingImage.value directamente
      const urlFotoTemporal = await generarUrlTemporalParaImagen(user.value.foto);
      fotoMensaje = `Foto: ${urlFotoTemporal}`;
    } catch (error) {
      console.error("Error al generar URL temporal para la imagen:", error.message);
      // Se elimina el alert() para que no bloquee el flujo.
      // alert("Hubo un problema al procesar la imagen. Se enviarán los datos sin el enlace a la foto.");
      fotoMensaje = "Error al procesar la foto (enlace no disponible)."; // Mensaje más descriptivo
    }
  }

  loadingImage.value = false; 

  const message = `Hola mis datos son: Cédula: ${cedulaMsg}, Nombre: ${nombreMsg}, Teléfono: ${telefonoMsg}, Ciudad: ${ciudadMsg}. ${fotoMensaje}`;

  console.log("Mensaje para WhatsApp:", message);

  // Siempre intentar abrir WhatsApp
  try {
    window.open(`https://wa.me/+573001234567?text=${encodeURIComponent(message)}`, '_blank');
  } catch (e) {
    console.error("Error al intentar abrir WhatsApp:", e);
    alert("No se pudo abrir WhatsApp. Asegúrate de no tener un bloqueador de pop-ups activo para este sitio.");
  }

  setTimeout(() => {
    router.push({ name: 'Home' });
  }, 500);
};
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
      <!-- Header con gradiente -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 class="text-2xl font-bold text-white text-center">Datos del Usuario</h2>
        <div class="w-20 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
      </div>

      <div class="p-8">
        <!-- Tarjeta de usuario encontrado -->
        <div v-if="user" class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
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
            <div v-if="user.nombre" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-gray-700"><strong class="text-gray-900">Nombre:</strong> {{ user.nombre }}</span>
            </div>
            
            <div v-if="user.telefono" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span class="text-gray-700"><strong class="text-gray-900">Teléfono:</strong> {{ user.telefono }}</span>
            </div>
            
            <div v-if="user.ciudad" class="flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-gray-700"><strong class="text-gray-900">Ciudad:</strong> {{ user.ciudad }}</span>
            </div>
          </div>

          <!-- Foto del usuario -->
          <div class="mt-6 text-center">
            <div v-if="user.foto && user.foto.startsWith('data:image')" class="inline-block">
              <div class="relative">
                <img :src="user.foto" alt="Foto del usuario" class="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg mx-auto" />
                <div class="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
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

        <!-- Estado de carga -->
        <div v-else-if="loadingUser" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600 font-medium">Cargando datos del usuario...</p>
          <p class="text-gray-400 text-sm mt-1">Por favor espera un momento</p>
        </div>

        <!-- Error: Usuario no encontrado -->
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

        <!-- Botón para continuar -->
        <div class="mt-8">
          <button
            @click="abrirWhatsAppYRedirigir"
            :disabled="loadingImage || !user"
            class="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <span v-if="loadingImage" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando imagen...
            </span>
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
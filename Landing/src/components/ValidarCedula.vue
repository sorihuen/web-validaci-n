<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getUserByCedula } from '../services/api';

const router = useRouter();
const cedula = ref('');
const loading = ref(false);
const noEncontrado = ref(false);
const errorCedula = ref(null);

/**
 * Valida el formato de un número de cédula.
 * Verifica que la cédula no esté vacía, contenga solo números y tenga una longitud entre 6 y 10 dígitos.
 * Actualiza la variable reactiva `errorCedula` con el mensaje de error correspondiente si la validación falla.
 *
 * @param {string} ced - El número de cédula a validar.
 * @returns {boolean} `true` si la cédula es válida, `false` en caso contrario.
 */
 const validarCedula = (ced) => {
  const regex = /^[0-9]{6,10}$/;

  if (!ced || ced.trim() === '') {
    errorCedula.value = 'La cédula es obligatoria.';
    return false;
  }

  if (!regex.test(ced)) {
    errorCedula.value = 'Cédula válida: solo números, entre 6 y 10 dígitos.';
    return false;
  }

  errorCedula.value = null;
  return true;
};


// Función principal de validación
const validarUsuario = async () => {
  // Limpiar errores previos
  noEncontrado.value = false;

  // Validar cédula antes de continuar
  if (!validarCedula(cedula.value)) {
    return;
  }

  loading.value = true;

  try {
    const data = await getUserByCedula(cedula.value);

    // Verificar si 'data.result' existe y tiene elementos
    if (data.result && data.result.length > 0) {
      // Usuario encontrado y con datos
      localStorage.setItem('usuario', JSON.stringify(data));
      router.push({ name: 'UserInfo' });
    } else {
      // Usuario no encontrado (respuesta OK pero sin datos en result) o result es un array vacío
      noEncontrado.value = true;
      setTimeout(() => {
        router.push({
          name: 'RegisterForm',
          query: { 
            cedula: cedula.value, 
            source: 'validationNotFound' 
          }
        });
      }, 2000);
    }
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      // Usuario no encontrado
      noEncontrado.value = true;
      setTimeout(() => {
        router.push({
          name: 'RegisterForm',
          query: { 
            cedula: cedula.value, 
            source: 'validationNotFound' 
          }
        });
      }, 2000);
    } else {
      // Otros errores
      console.error(error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
      <!-- Header con gradiente -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Validación de Usuario</h1>
          <div class="w-20 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
        </div>
      </div>

      <div class="p-8">
        <!-- Formulario de Validación -->
        <form @submit.prevent="validarUsuario" class="space-y-6">
          <!-- Campo de Cédula -->
          <div class="space-y-2">
            <label class="flex items-center text-sm font-semibold text-gray-700">
              <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0h4"></path>
              </svg>
              Cédula
            </label>
            <div class="relative">
              <input
                type="text"
                v-model="cedula"
                class="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Ingresa tu número de cédula"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h-3m-1 0h3m-3 0V5a2 2 0 012-2m0 0V3"></path>
                </svg>
              </div>
            </div>
            
            <!-- Mensaje de error de validación -->
            <div v-if="errorCedula" class="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{{ errorCedula }}</span>
            </div>
          </div>
          
          <!-- Botón de validación -->
          <button
            type="submit"
            :disabled="loading || !cedula.trim()"
            class="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validando usuario...
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Validar Usuario
            </span>
          </button>
        </form>

        <!-- Mensaje de error de usuario no encontrado -->
        <div v-if="noEncontrado" class="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-red-800 font-semibold">Usuario no encontrado</p>
              <p class="text-red-600 text-sm mt-1">No estás registrado en nuestro sistema.</p>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 text-center">
          <div class="inline-flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span>Información segura y protegida</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
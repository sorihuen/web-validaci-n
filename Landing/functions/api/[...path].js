// functions/api/[...path].js
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    
    // Obtener la ruta después de /api
    const apiPath = url.pathname.replace('/api', '');
    
    // Construir la URL del backend
    const backendUrl = `https://botai.smartdataautomation.com/api_backend_ai${apiPath}${url.search}`;
    
    try {
      // Crear nueva request con la URL del backend
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : null,
      });
      
      // Hacer la petición al backend
      const response = await fetch(backendRequest);
      
      // Crear nueva response con headers CORS
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
      
      return newResponse;
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Error al conectar con el backend',
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
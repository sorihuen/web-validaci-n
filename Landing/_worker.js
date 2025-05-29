export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      
      // Si es para /api, hacer proxy
      if (url.pathname.startsWith('/api')) {
        return handleProxy(request);
      }
      
      // Para todo lo demás, servir archivos estáticos
      return env.ASSETS.fetch(request);
    }
  };
  
  async function handleProxy(request) {
    const url = new URL(request.url);
    
    // Convertir /api/xxx a https://botai.smartdataautomation.com/api_backend_ai/xxx
    const targetPath = url.pathname.replace('/api', '/api_backend_ai');
    const targetUrl = `https://botai.smartdataautomation.com${targetPath}${url.search}`;
    
    try {
      // Si es OPTIONS (preflight CORS), responder directamente
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }
      
      // Hacer la petición al backend
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      // Agregar headers CORS a la respuesta
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
      
      return modifiedResponse;
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Error en el proxy', 
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
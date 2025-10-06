{
  "version": 2,
  "routes": [
    // Rota que chama a função Serverless
    {
      "src": "/create_payment",
      "methods": [
        "POST"
      ],
      "dest": "/api/create_payment.js"
    },
    // Rota explícita para o caminho raiz (homepage)
    {
      "src": "/",
      "dest": "/index.html"
    },
    // Rota catch-all para servir qualquer outro arquivo estático
    {
      "src": "/(.*)",
      "dest": "/$1" 
    }
  ]
}
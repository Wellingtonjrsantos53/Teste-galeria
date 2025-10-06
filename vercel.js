{
  "version": 2,
  "builds": [
    {
      "src": "api.js", // OU server.js (use o nome do seu arquivo de API na raiz)
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/create_payment",
      "methods": [
        "POST"
      ],
      "dest": "api.js" // OU server.js (deve ser o mesmo nome que você usa na seção 'builds')
    },
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1" 
    }
  ]
}
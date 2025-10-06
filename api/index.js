// Apenas para testar se a rota do Vercel funciona!
module.exports = (req, res) => {
    // Retorna um JSON simples
    res.status(200).json({ 
        success: true, 
        message: "API Route is Working!" 
    });
};
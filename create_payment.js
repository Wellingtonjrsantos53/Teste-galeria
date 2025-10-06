module.exports = async (req, res) => {
    // --- SOLUÇÃO CORS: Adiciona cabeçalhos de permissão ---
    // Você pode usar '*' para permitir todas as origens, ou definir um domínio específico
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se a requisição for OPTIONS (Preflight), finalize e retorne 200
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // --------------------------------------------------------

    // ... restante do seu código de API começa aqui: ...

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        // ... (lógica do Mercado Pago) ...
        
        // Final da requisição POST bem-sucedida:
        res.status(200).json({
            // ... (dados de sucesso)
        });

    } catch (error) {
        // ... (lógica de erro)
    }
};
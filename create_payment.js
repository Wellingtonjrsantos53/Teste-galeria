module.exports = async (req, res) => {
    // --- SOLUÇÃO CORS: Adiciona cabeçalhos de permissão ---
    // Permite que qualquer Origem (*) acesse a API
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manipula requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // --------------------------------------------------------

    // O código da API original começa aqui:

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    // ... restante da lógica de inicialização e Mercado Pago (MP_ACCESS_TOKEN) ...

    try {
        // ... (Seu código de processamento da requisição PIX) ...

        // Final da requisição POST bem-sucedida:
        res.status(200).json({
            // ... (dados de sucesso)
        });

    } catch (error) {
        // ... (lógica de erro)
    }
};
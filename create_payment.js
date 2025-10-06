// [api/create_payment.js]

// ... (código de inicialização e variáveis omitidas) ...

module.exports = async (req, res) => {
    // --- SOLUÇÃO CORS: Adiciona cabeçalhos de permissão ---
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem (*)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manipula requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // --------------------------------------------------------

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        // ... (código de processamento do pagamento) ...

        // ...
        res.status(200).json({
            // ... (dados de sucesso)
        });

    } catch (error) {
        // ... (código de erro)
    }
};
// [create_payment.js] - Função Serverless pura

const { MercadoPagoConfig, Payment } = require('mercadopago');

// --- LEITURA DO TOKEN DE AMBIENTE ---
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; 

const client = new MercadoPagoConfig({
    accessToken: ACCESS_TOKEN,
});
const paymentService = new Payment(client);

// O Vercel usa esta função exportada como ponto de entrada da API
module.exports = async (req, res) => {
    
    // Configuração CORS (Essencial para comunicação no Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        // O corpo da requisição POST já vem como JSON no Vercel
        const { transaction_amount, description, payer, payment_method_id } = req.body; 

        // VALIDAÇÃO E CRIAÇÃO DO OBJETO DE PAGAMENTO
        if (!transaction_amount || !payer || payment_method_id !== 'pix') {
            return res.status(400).json({ error: 'Dados da transação incompletos ou inválidos.' });
        }
        
        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description || 'Pagamento de Projeto',
            payment_method_id: 'pix',
            payer: payer
        };

        const result = await paymentService.create({ body: paymentData });
        
        // SUCESSO: Retorna os dados
        res.status(200).json({
            success: true,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            qr_code_text: result.point_of_interaction?.transaction_data?.qr_code,
            payment_id: result.id
        });

    } catch (error) {
        console.error('Erro fatal ao criar pagamento PIX:', error);
        
        const mpError = error.cause && error.cause.length > 0 ? error.cause[0] : null;

        res.status(500).json({
            success: false,
            // Retorna o erro detalhado do Mercado Pago para depuração
            error: mpError ? `MP_ERROR ${mpError.code}: ${mpError.description}` : 'Erro interno ao processar o pagamento'
        });
    }
};
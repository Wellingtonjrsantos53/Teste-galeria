// [api/index.js] - Este é o código que DEVE ESTAR NO ARQUIVO

const { MercadoPagoConfig, Payment } = require('mercadopago');

// O Vercel define esta variável de ambiente
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; 

if (!ACCESS_TOKEN) {
    console.error("ERRO CRÍTICO: MP_ACCESS_TOKEN não está definida no ambiente Vercel.");
}

const client = new MercadoPagoConfig({
    accessToken: ACCESS_TOKEN,
});
const paymentService = new Payment(client);

// O Vercel usa essa função exportada para rodar a API (NÃO use app.listen)
module.exports = async (req, res) => {
    // Certifique-se que o código de inicialização está aqui, sem escutar em porta
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { transaction_amount, description, payer, payment_method_id } = req.body;

        // VALIDAÇÃO BÁSICA
        if (!transaction_amount || !payer || payment_method_id !== 'pix') {
            return res.status(400).json({ error: 'Dados da transação ou método de pagamento inválidos.' });
        }
        
        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description || 'Pagamento de Projeto',
            payment_method_id: 'pix',
            payer: payer
        };

        const result = await paymentService.create({ body: paymentData });

        // Retorna os dados necessários para o frontend
        res.status(200).json({
            success: true,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            qr_code_text: result.point_of_interaction?.transaction_data?.qr_code
        });

    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error);
        
        const mpError = error.cause && error.cause.length > 0 ? error.cause[0] : null;

        res.status(500).json({
            success: false,
            error: mpError ? `MP_ERROR ${mpError.code}: ${mpError.description}` : 'Erro interno ao processar o pagamento'
        });
    }
};
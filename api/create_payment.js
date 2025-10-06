// [api/create_payment.js] - Arquivo Serverless Function

const { MercadoPagoConfig, Payment } = require('mercadopago');

// --- ATENÇÃO: LÊ A VARIÁVEL DE AMBIENTE MP_ACCESS_TOKEN ---
// Você deve configurar essa variável no painel do Vercel!
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN; 

if (!ACCESS_TOKEN) {
    console.error("ERRO CRÍTICO: MP_ACCESS_TOKEN não está definida no ambiente Vercel.");
}

const client = new MercadoPagoConfig({
    accessToken: ACCESS_TOKEN,
});
const paymentService = new Payment(client);

// O Vercel usa essa função exportada para rodar a API
module.exports = async (req, res) => {
    // Verifica se é uma requisição POST, se não, retorna 404/405
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Os dados vêm do req.body do frontend
        const { transaction_amount, description, payer, payment_method_id } = req.body;

        // VALIDAÇÃO BÁSICA
        if (!transaction_amount || !payer || payment_method_id !== 'pix') {
            return res.status(400).json({ error: 'Dados da transação ou método de pagamento inválidos.' });
        }
        
        const paymentData = {
            transaction_amount: Number(transaction_amount),
            description: description || 'Pagamento via PIX',
            payment_method_id: 'pix',
            payer: {
                email: payer.email,
                first_name: payer.first_name,
                last_name: payer.last_name,
                identification: payer.identification
            }
        };

        const result = await paymentService.create({ body: paymentData });
        
        // Retorna o QR Code e o código para o front-end
        const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;
        const qrCodeText = result.point_of_interaction?.transaction_data?.qr_code;
        
        console.log("Pagamento Pix criado com sucesso. ID:", result.id);
        
        res.status(200).json({ 
            success: true,
            qr_code_base64: qrCodeBase64, 
            qr_code_text: qrCodeText, 
            payment_id: result.id 
        });

    } catch (error) {
        console.error('Erro ao criar o pagamento no Mercado Pago:', error);
        
        // Retorna o erro detalhado do Mercado Pago se possível
        const mpError = error.cause && error.cause.length > 0 ? error.cause[0] : null;

        res.status(500).json({
            success: false,
            // Retorna o código de erro real do Mercado Pago para depuração no Frontend
            error: mpError ? `MP_ERROR ${mpError.code}: ${mpError.description}` : 'Erro interno (Verifique logs do Vercel)'
        });
    }
};
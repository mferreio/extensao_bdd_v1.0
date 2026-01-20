
export class LicenseManager {
    constructor() {
        this.storageKey = 'bdd_extension_license';
    }

    async saveLicense(key) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ [this.storageKey]: key }, () => {
                resolve(true);
            });
        });
    }

    async getLicense() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([this.storageKey], (result) => {
                resolve(result[this.storageKey] || null);
            });
        });
    }

    async validateLicense(key) {
        if (!key) return false;

        // Se a chave for a de teste do desenvolvedor (opcional, para testes locais sem gastar cota)
        if (key === 'DEV_TEST_KEY_123') return true;

        try {
            // Documentação API Gumroad: https://app.gumroad.com/api#licenses
            const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'product_permalink': 'SEU_PERMALINK_AQUI', // <--- IMPORTANTE: TROQUE ISSO PELO SEU PERMALINK DO GUMROAD
                    'license_key': key.trim(),
                    'increment_uses_count': 'false' // 'true' se quiser limitar ativações
                })
            });

            if (!response.ok) {
                // Se der 404 ou 400, a chave provavelmente é inválida
                return false;
            }

            const data = await response.json();

            // Verifica se a API retornou sucesso e se o reembolso não foi solicitado
            if (data.success && !data.purchase.refunded && !data.purchase.chargebacked) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro de conexão ao validar licença:', error);
            // Em caso de erro de rede, você pode decidir se bloqueia ou libera
            // Por segurança, geralmente bloqueamos:
            return false;
        }
    }

    async hasValidLicense() {
        const key = await this.getLicense();
        if (!key) return false;
        // Opcional: Revalidar com o servidor periodicamente
        return true;
    }
}

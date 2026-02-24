/**
 * Export Bridge - Ponte de compatibilidade entre ExportManager novo e código legado
 * Mantém interface existente enquanto usa novo sistema melhorado
 */

import { ExportManager } from './export-manager.js';
import { FileCompressor } from './compressor.js';

/**
 * Gerenciador singleton de exportação
 */
class ExportBridge {
    constructor() {
        this.manager = new ExportManager();
        this.lastExportMetadata = null;
    }

    /**
     * Exporta features usando novo sistema com compatibilidade retroativa
     */
    async exportWithEnhancements(features, options = {}) {
        const {
            useZip = false,
            includeMetadata = true,
            includeLogs = true,
            format = 'individual'
        } = options;

        return await this.manager.exportFeatures(features, {
            format: useZip ? 'zip' : format,
            includeMetadata,
            includeLogs,
            includeAudit: true,
            language: options.language // Correção: repassando a linguagem para o manager
        });
    }

    /**
     * Exporta com barra de progresso melhorada
     */
    exportWithProgress(features, onProgress = null) {
        return this.exportWithEnhancements(features, {
            format: 'individual',
            includeMetadata: true,
            includeLogs: true
        });
    }

    /**
     * Exporta em ZIP (quando suportado)
     */
    async exportAsZip(features) {
        const files = [];

        // Coletar todos os arquivos de todas as features
        features.forEach(feature => {
            const featureFiles = this.manager.generateFeatureFiles(feature);
            files.push(...featureFiles);
        });

        // Criar estrutura de pasta dinamicamente baseada no file.name provido pelos geradores
        const folderStructure = {};

        files.forEach(file => {
            // Se o arquivo contém '/', usamos o prefixo como pasta
            const parts = file.name.split('/');
            const filename = parts.pop();
            const targetFolder = parts.join('/');

            if (!folderStructure[targetFolder]) {
                folderStructure[targetFolder] = [];
            }
            
            // Clonar o arquivo atualizando apenas o nome (remoção das pastas do nome)
            folderStructure[targetFolder].push({
                name: filename,
                content: file.content
            });
        });

        // Compressor não comprime (simples armazenamento), apenas empacota
        const zipData = FileCompressor.createStructuredZip(
            folderStructure,
            `export_${new Date().toISOString().split('T')[0]}.zip`
        );

        return zipData;
    }

    /**
     * Obtém informações da última exportação
     */
    getLastExportInfo() {
        return this.lastExportMetadata;
    }
}

// Export instância singleton
export const exportBridge = new ExportBridge();



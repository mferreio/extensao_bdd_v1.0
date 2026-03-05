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
            language: options.language,
            globalLighthouse: options.globalLighthouse || false,
            globalPerformance: options.globalPerformance || false,
            preferredSelector: options.preferredSelector || 'best'
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
     * Exporta em ZIP processando a árvore pré-montada de exportData
     * (Isso garante que LOGS, PROJECT, DOCUMENTATION sejam incluídos)
     */
    async exportAsZip(exportData) {
        // Criar estrutura de pasta dinamicamente
        const folderStructure = {};

        exportData.forEach(module => {
            const files = module.files || [];
            files.forEach(file => {
                // Se o arquivo contém '/', usamos o prefixo como pasta
                const parts = file.name.split('/');
                const filename = parts.pop();
                const targetFolder = parts.join('/');

                if (!folderStructure[targetFolder]) {
                    folderStructure[targetFolder] = [];
                }
                
                // Adicionamos no folder
                folderStructure[targetFolder].push({
                    name: filename,
                    content: file.content
                });
            });
        });

        // Compressor empacota

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



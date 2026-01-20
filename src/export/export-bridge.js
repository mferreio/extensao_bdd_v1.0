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
            includeAudit: true
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

        // Criar estrutura de pasta
        const folderStructure = {
            'features': [],
            'features/steps': [],
            'features/pages': [],
            'tests': []
        };

        files.forEach(file => {
            if (file.name.endsWith('.feature')) {
                folderStructure['features'].push(file);
            } else if (file.name.endsWith('_steps.py')) {
                folderStructure['features/steps'].push(file);
            } else if (file.name.endsWith('_pages.py')) {
                folderStructure['features/pages'].push(file);
            } else if (file.name.endsWith('.md')) {
                folderStructure['tests'].push(file);
            } else {
                folderStructure['features'].push(file);
            }
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



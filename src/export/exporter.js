// Módulo de exportação completa para features
import { downloadFile, showFeedback, slugify } from '../../utils.js';

function validateDataConsistency(features) {
    const errors = [];
    const warnings = [];
    
    if (!features || !Array.isArray(features)) {
        errors.push('Lista de features deve ser um array válido');
        return { errors, warnings };
    }
    
    if (features.length === 0) {
        errors.push('Lista de features não pode estar vazia');
        return { errors, warnings };
    }
    
    // Verificar nomes de features duplicados
    const featureNames = features.map(f => f.name).filter(Boolean);
    const duplicateFeatureNames = featureNames.filter((name, index) => featureNames.indexOf(name) !== index);
    if (duplicateFeatureNames.length > 0) {
        warnings.push(`Nomes de features duplicados encontrados: ${duplicateFeatureNames.join(', ')}`);
    }
    
    // Verificar se há pelo menos uma interação de cada tipo básico em todo o conjunto
    let hasNavigation = false;
    let hasInteraction = false;
    let hasValidation = false;
    
    features.forEach(feature => {
        (feature.scenarios || []).forEach(scenario => {
            (scenario.interactions || []).forEach(interaction => {
                if (['acessa_url', 'navega'].includes(interaction.acao)) {
                    hasNavigation = true;
                }
                if (['clica', 'preenche', 'seleciona', 'upload'].includes(interaction.acao)) {
                    hasInteraction = true;
                }
                if (interaction.acao && interaction.acao.startsWith('valida_')) {
                    hasValidation = true;
                }
            });
        });
    });
    
    if (!hasNavigation) {
        warnings.push('Recomendação: Nenhuma ação de navegação encontrada (acessa_url, navega)');
    }
    if (!hasInteraction) {
        warnings.push('Recomendação: Nenhuma ação de interação encontrada (clica, preenche, seleciona)');
    }
    if (!hasValidation) {
        warnings.push('Recomendação: Nenhuma ação de validação encontrada (valida_*)');
    }
    
    return { errors, warnings };
}

// Funções de validação e sanitização
function validateFeatureData(feature) {
    const errors = [];
    const warnings = [];
    
    // Validação da estrutura básica
    if (!feature || typeof feature !== 'object') {
        errors.push('Feature deve ser um objeto válido');
        return { errors, warnings };
    }
    
    // Validação do nome da feature
    if (!feature.name || typeof feature.name !== 'string') {
        errors.push('Nome da feature é obrigatório e deve ser uma string');
    } else if (feature.name.trim().length === 0) {
        errors.push('Nome da feature não pode estar vazio');
    } else if (feature.name.length > 100) {
        warnings.push('Nome da feature muito longo (recomendado máximo 100 caracteres)');
    } else {
        // Validação de caracteres seguros para nomes de arquivo
        if (!/^[a-zA-Z0-9\s\-_\u00C0-\u017F]+$/.test(feature.name)) {
            warnings.push('Nome da feature contém caracteres especiais que serão removidos na exportação');
        }
        
        // Verificar se não contém palavras reservadas ou perigosas
        const dangerousWords = ['script', 'eval', 'function', 'constructor', 'prototype'];
        if (dangerousWords.some(word => feature.name.toLowerCase().includes(word))) {
            warnings.push('Nome da feature contém palavras que podem causar conflitos');
        }
    }
    
    // Validação dos cenários
    if (!feature.scenarios || !Array.isArray(feature.scenarios)) {
        errors.push('Feature deve ter pelo menos um cenário');
    } else if (feature.scenarios.length === 0) {
        errors.push('Feature deve ter pelo menos um cenário');
    } else if (feature.scenarios.length > 50) {
        warnings.push('Feature tem muitos cenários (recomendado máximo 50)');
    } else {
        // Verificar nomes duplicados de cenários
        const scenarioNames = feature.scenarios.map(s => s.name).filter(Boolean);
        const duplicateNames = scenarioNames.filter((name, index) => scenarioNames.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            warnings.push(`Nomes de cenários duplicados encontrados: ${duplicateNames.join(', ')}`);
        }
        
        feature.scenarios.forEach((scenario, idx) => {
            const scenarioResult = validateScenarioData(scenario, idx);
            errors.push(...scenarioResult.errors);
            warnings.push(...scenarioResult.warnings);
        });
    }
    
    return { errors, warnings };
}

function validateScenarioData(scenario, scenarioIndex) {
    const errors = [];
    const warnings = [];
    const prefix = `Cenário ${scenarioIndex + 1}`;
    
    // Validação da estrutura básica
    if (!scenario || typeof scenario !== 'object') {
        errors.push(`${prefix}: Deve ser um objeto válido`);
        return { errors, warnings };
    }
    
    // Validação do nome do cenário
    if (!scenario.name || typeof scenario.name !== 'string') {
        errors.push(`${prefix}: Nome é obrigatório e deve ser uma string`);
    } else if (scenario.name.trim().length === 0) {
        errors.push(`${prefix}: Nome não pode estar vazio`);
    } else if (scenario.name.length > 200) {
        warnings.push(`${prefix}: Nome muito longo (recomendado máximo 200 caracteres)`);
    } else {
        // Validação de caracteres seguros
        if (!/^[a-zA-Z0-9\s\-_\u00C0-\u017F.!?]+$/.test(scenario.name)) {
            warnings.push(`${prefix}: Nome contém caracteres especiais que serão ajustados na exportação`);
        }
        
        // Verificar se não contém palavras reservadas ou perigosas
        const dangerousWords = ['script', 'eval', 'function', 'constructor'];
        if (dangerousWords.some(word => scenario.name.toLowerCase().includes(word))) {
            warnings.push(`${prefix}: Nome contém palavras que podem causar conflitos`);
        }
    }
    
    // Validação das interações
    if (!scenario.interactions || !Array.isArray(scenario.interactions)) {
        errors.push(`${prefix}: Deve ter pelo menos uma interação`);
    } else if (scenario.interactions.length === 0) {
        errors.push(`${prefix}: Deve ter pelo menos uma interação`);
    } else if (scenario.interactions.length > 100) {
        warnings.push(`${prefix}: Muitas interações (recomendado máximo 100)`);
    } else {
        // Validar sequência lógica de steps (como aviso, não erro crítico)
        const steps = scenario.interactions.map(i => i.step).filter(Boolean);
        let hasGiven = false, hasWhen = false, hasThen = false;
        
        for (let step of steps) {
            if (step === 'Given') hasGiven = true;
            if (step === 'When' && hasGiven) hasWhen = true;
            if (step === 'Then' && hasWhen) hasThen = true;
        }
        
        if (!hasGiven) {
            warnings.push(`${prefix}: Recomendado ter pelo menos um step "Given"`);
        }
        if (!hasWhen) {
            warnings.push(`${prefix}: Recomendado ter pelo menos um step "When"`);
        }
        if (!hasThen) {
            warnings.push(`${prefix}: Recomendado ter pelo menos um step "Then"`);
        }
        
        scenario.interactions.forEach((interaction, idx) => {
            const interactionResult = validateInteractionData(interaction, scenarioIndex, idx);
            errors.push(...interactionResult.errors);
            warnings.push(...interactionResult.warnings);
        });
    }
    
    return { errors, warnings };
}

function validateInteractionData(interaction, scenarioIndex, interactionIndex) {
    const errors = [];
    const warnings = [];
    const prefix = `Cenário ${scenarioIndex + 1}, Interação ${interactionIndex + 1}`;
    
    // Validação do step (Given, When, Then)
    const validSteps = ['Given', 'When', 'Then'];
    if (!interaction.step || !validSteps.includes(interaction.step)) {
        // Step será definido automaticamente se não estiver presente
        warnings.push(`${prefix}: Step será definido automaticamente (padrão: "When")`);
    }
    
    // Validação da ação
    const validActions = [
        'clica', 'altera', 'preenche', 'seleciona', 'radio', 'caixa', 
        'navega', 'login', 'upload', 'acessa_url',
        'valida_existe', 'valida_nao_existe', 'valida_contem', 'valida_nao_contem',
        'valida_deve_ser', 'valida_nao_deve_ser',
        'espera_segundos', 'espera_elemento', 'espera_nao_existe', 
        'espera_existe', 'espera_habilitado', 'espera_desabilitado'
    ];
    
    if (!interaction.acao) {
        warnings.push(`${prefix}: Ação será definida como "clica" (padrão)`);
    } else if (!validActions.includes(interaction.acao)) {
        warnings.push(`${prefix}: Ação "${interaction.acao}" será convertida para ação válida mais próxima`);
    }
    
    // Validação de seletores CSS/XPath obrigatórios
    if (interaction.acao !== 'acessa_url' && interaction.acao !== 'espera_segundos' && interaction.acao !== 'navega') {
        if (!interaction.cssSelector && !interaction.xpathSelector) {
            warnings.push(`${prefix}: Seletor será gerado automaticamente se não fornecido`);
        }
        
        // Validação da qualidade do seletor CSS
        if (interaction.cssSelector) {
            if (typeof interaction.cssSelector !== 'string' || interaction.cssSelector.trim().length === 0) {
                warnings.push(`${prefix}: Seletor CSS será corrigido na exportação`);
            } else if (interaction.cssSelector.length > 2000) {
                warnings.push(`${prefix}: Seletor CSS muito longo (será truncado se necessário)`);
            } else {
                // Validação básica de sintaxe CSS
                try {
                    // Test se é um seletor CSS válido usando querySelectorAll
                    document.querySelectorAll(interaction.cssSelector);
                } catch (e) {
                    warnings.push(`${prefix}: Seletor CSS com sintaxe inválida será corrigido: "${interaction.cssSelector}"`);
                }
            }
        }
        
        // Validação da qualidade do seletor XPath
        if (interaction.xpathSelector) {
            if (typeof interaction.xpathSelector !== 'string' || interaction.xpathSelector.trim().length === 0) {
                warnings.push(`${prefix}: Seletor XPath será corrigido na exportação`);
            } else if (interaction.xpathSelector.length > 2000) {
                warnings.push(`${prefix}: Seletor XPath muito longo (será truncado se necessário)`);
            } else {
                // Validação básica de sintaxe XPath
                try {
                    document.evaluate(interaction.xpathSelector, document, null, XPathResult.ANY_TYPE, null);
                } catch (e) {
                    warnings.push(`${prefix}: Seletor XPath com sintaxe inválida será corrigido: "${interaction.xpathSelector}"`);
                }
            }
        }
    }
    
    // Validação do nome do elemento
    if (interaction.acao !== 'acessa_url' && interaction.acao !== 'espera_segundos') {
        if (!interaction.nomeElemento || typeof interaction.nomeElemento !== 'string') {
            warnings.push(`${prefix}: Nome do elemento será gerado automaticamente`);
        } else if (interaction.nomeElemento.trim().length === 0) {
            warnings.push(`${prefix}: Nome do elemento vazio será substituído por padrão`);
        } else if (interaction.nomeElemento.length > 300) {
            warnings.push(`${prefix}: Nome do elemento será truncado (máximo 300 caracteres)`);
        } else {
            // Validação de caracteres seguros para identificadores Python
            if (!/^[a-zA-Z][a-zA-Z0-9_\s\-]*$/.test(interaction.nomeElemento)) {
                warnings.push(`${prefix}: Nome do elemento contém caracteres que serão ajustados na exportação`);
            }
        }
    }
    
    // Validações específicas por ação
    if (interaction.acao === 'upload') {
        if (!interaction.nomeArquivo || typeof interaction.nomeArquivo !== 'string') {
            warnings.push(`${prefix}: Nome do arquivo será definido como padrão para upload`);
        } else if (interaction.nomeArquivo.trim().length === 0) {
            warnings.push(`${prefix}: Nome do arquivo vazio será substituído por padrão`);
        } else if (interaction.nomeArquivo.length > 500) {
            warnings.push(`${prefix}: Nome do arquivo será truncado (máximo 500 caracteres)`);
        }
    }
    
    if (interaction.acao === 'preenche' || interaction.acao === 'login') {
        if (interaction.valorPreenchido === undefined || interaction.valorPreenchido === null) {
            warnings.push(`${prefix}: Valor vazio será usado para a ação "${interaction.acao}"`);
        } else if (typeof interaction.valorPreenchido === 'string') {
            if (interaction.valorPreenchido.length > 1000) {
                warnings.push(`${prefix}: Valor preenchido será truncado (máximo 1000 caracteres)`);
            }
            // Validação de caracteres potencialmente perigosos
            if (interaction.valorPreenchido.includes('<script') || interaction.valorPreenchido.includes('javascript:')) {
                warnings.push(`${prefix}: Conteúdo potencialmente perigoso será removido do valor`);
            }
        }
    }
    
    if (interaction.acao === 'acessa_url') {
        // Aceitar URL tanto no campo 'url' quanto no 'nomeElemento'
        const urlValue = interaction.url || interaction.nomeElemento;
        
        if (!urlValue || typeof urlValue !== 'string') {
            errors.push(`${prefix}: URL é obrigatória para ação "acessa_url"`);
        } else if (urlValue.trim().length === 0) {
            errors.push(`${prefix}: URL não pode estar vazia`);
        } else if (urlValue.length > 2000) {
            warnings.push(`${prefix}: URL será truncada (máximo 2000 caracteres)`);
        } else {
            // Validação básica de formato de URL
            try {
                new URL(urlValue);
            } catch (e) {
                // Se não for uma URL válida e não começar com http, tentar adicionar protocolo
                if (!urlValue.startsWith('http')) {
                    try {
                        new URL('https://' + urlValue);
                        warnings.push(`${prefix}: Protocolo https:// será adicionado à URL: "${urlValue}"`);
                    } catch (e2) {
                        warnings.push(`${prefix}: URL com formato inválido será corrigida: "${urlValue}"`);
                    }
                } else {
                    warnings.push(`${prefix}: URL com formato inválido será corrigida: "${urlValue}"`);
                }
            }
        }
    }
    
    if (interaction.acao === 'espera_segundos') {
        if (!interaction.tempoEspera || isNaN(interaction.tempoEspera)) {
            warnings.push(`${prefix}: Tempo de espera será definido como 1 segundo (padrão)`);
        } else if (interaction.tempoEspera < 0 || interaction.tempoEspera > 300) {
            warnings.push(`${prefix}: Tempo de espera será ajustado para faixa válida (0-300 segundos)`);
        }
    }
    
    // Validação de ações de validação (que precisam de texto de comparação)
    const validationActions = ['valida_contem', 'valida_nao_contem', 'valida_deve_ser', 'valida_nao_deve_ser'];
    if (validationActions.includes(interaction.acao)) {
        if (!interaction.valorPreenchido && !interaction.acaoTexto) {
            warnings.push(`${prefix}: Texto de validação vazio será usado para a ação "${interaction.acao}"`);
        }
    }
    
    // Validação de ações de seleção
    if (interaction.acao === 'seleciona') {
        if (!interaction.valorPreenchido) {
            warnings.push(`${prefix}: Valor padrão será usado para seleção`);
        }
    }
    
    return { errors, warnings };
}

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
        // Remove caracteres de controle e não imprimíveis
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Escapa caracteres perigosos para Python strings
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        // Remove scripts e conteúdo potencialmente perigoso
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:text\/html/gi, '')
        .replace(/on\w+\s*=/gi, '')
        // Remove entidades HTML perigosas
        .replace(/&lt;script/gi, '')
        .replace(/&gt;/gi, '')
        .replace(/&#x/gi, '')
        .replace(/&#\d/gi, '')
        // Normaliza quebras de linha
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove múltiplas quebras de linha consecutivas
        .replace(/\n{3,}/g, '\n\n')
        // Remove espaços no início e fim
        .trim()
        // Limita tamanho total para prevenir ataques de DoS
        .substring(0, 5000);
}

function sanitizeSelector(selector) {
    if (typeof selector !== 'string') return '';
    
    return selector
        // Remove caracteres de controle
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Remove conteúdo potencialmente perigoso em seletores
        .replace(/javascript:/gi, '')
        .replace(/expression\(/gi, '')
        .replace(/url\(/gi, '')
        .replace(/@import/gi, '')
        // Normaliza aspas
        .replace(/[""'']/g, '"')
        // Remove múltiplos espaços
        .replace(/\s+/g, ' ')
        .trim()
        // Limita tamanho
        .substring(0, 2000);
}

function sanitizeFeatureForExport(feature) {
    const sanitized = {
        ...feature,
        name: sanitizeString(feature.name) || 'Nova_Feature',
        scenarios: (feature.scenarios || []).map((scenario, scenarioIdx) => ({
            ...scenario,
            name: sanitizeString(scenario.name) || `Cenario_${scenarioIdx + 1}`,
            interactions: (scenario.interactions || []).map((interaction, interactionIdx) => {
                // Definir ação padrão se não existir ou for inválida
                const validActions = [
                    'clica', 'altera', 'preenche', 'seleciona', 'radio', 'caixa', 
                    'navega', 'login', 'upload', 'acessa_url',
                    'valida_existe', 'valida_nao_existe', 'valida_contem', 'valida_nao_contem',
                    'valida_deve_ser', 'valida_nao_deve_ser',
                    'espera_segundos', 'espera_elemento', 'espera_nao_existe', 
                    'espera_existe', 'espera_habilitado', 'espera_desabilitado'
                ];
                
                let acao = interaction.acao;
                if (!acao || !validActions.includes(acao)) {
                    acao = 'clica'; // Ação padrão
                }
                
                const sanitizedInteraction = {
                    ...interaction,
                    acao: acao,
                    
                    // Definir step padrão se não existir
                    step: interaction.step && ['Given', 'When', 'Then'].includes(interaction.step) 
                        ? interaction.step 
                        : 'When',
                    
                    // Sanitizar campos de texto
                    nomeElemento: sanitizeElementName(interaction.nomeElemento || '') || `elemento_${interactionIdx + 1}`,
                    nomeArquivo: sanitizeString(interaction.nomeArquivo || '') || 'arquivo.txt',
                    valorPreenchido: typeof interaction.valorPreenchido === 'string' 
                        ? sanitizeString(interaction.valorPreenchido) 
                        : interaction.valorPreenchido,
                    acaoTexto: sanitizeString(interaction.acaoTexto || ''),
                    url: sanitizeString(interaction.url || '') || 'https://example.com',
                    
                    // Sanitizar seletores
                    cssSelector: sanitizeSelector(interaction.cssSelector || ''),
                    xpathSelector: sanitizeSelector(interaction.xpathSelector || ''),
                    
                    // Garantir que valores numéricos permaneçam numéricos ou tenham padrão
                    tempoEspera: typeof interaction.tempoEspera === 'number' && !isNaN(interaction.tempoEspera)
                        ? Math.max(0, Math.min(300, interaction.tempoEspera))  // Limita entre 0 e 300
                        : 1  // Padrão de 1 segundo
                };
                
                // Gerar seletor padrão se não existir e for necessário
                if (!sanitizedInteraction.cssSelector && !sanitizedInteraction.xpathSelector) {
                    if (acao && acao !== 'acessa_url' && acao !== 'espera_segundos' && acao !== 'navega') {
                        sanitizedInteraction.cssSelector = `[data-testid="${sanitizedInteraction.nomeElemento}"]`;
                    }
                }
                
                // Ajustar URL para ação acessa_url
                if (acao === 'acessa_url') {
                    // Garantir que a URL esteja no campo correto
                    let urlValue = sanitizedInteraction.url || sanitizedInteraction.nomeElemento;
                    
                    // Se a URL está no nomeElemento, mover para o campo url
                    if (!sanitizedInteraction.url && sanitizedInteraction.nomeElemento && 
                        (sanitizedInteraction.nomeElemento.startsWith('http') || sanitizedInteraction.nomeElemento.includes('.'))) {
                        urlValue = sanitizedInteraction.nomeElemento;
                        sanitizedInteraction.nomeElemento = 'página_inicial';
                    }
                    
                    // Se ainda não tem URL, usar a URL atual ou padrão
                    if (!urlValue || urlValue === 'https://example.com') {
                        if (typeof window !== 'undefined' && window.location) {
                            urlValue = window.location.href;
                        } else {
                            urlValue = 'https://example.com';
                        }
                    }
                    
                    // Validar e corrigir a URL
                    try {
                        new URL(urlValue);
                        sanitizedInteraction.url = urlValue;
                    } catch (e) {
                        // Se não for válida e não começar com http, tentar adicionar protocolo
                        if (!urlValue.startsWith('http')) {
                            const correctedUrl = 'https://' + urlValue;
                            try {
                                new URL(correctedUrl);
                                sanitizedInteraction.url = correctedUrl;
                            } catch (e2) {
                                sanitizedInteraction.url = 'https://example.com';
                            }
                        } else {
                            sanitizedInteraction.url = 'https://example.com';
                        }
                    }
                    
                    // Garantir que tenha um nome de elemento adequado
                    if (!sanitizedInteraction.nomeElemento || sanitizedInteraction.nomeElemento === '') {
                        sanitizedInteraction.nomeElemento = 'página_inicial';
                    }
                }
                
                // Garantir valor para ações que precisam
                if (['preenche', 'login', 'seleciona'].includes(acao) && !sanitizedInteraction.valorPreenchido) {
                    sanitizedInteraction.valorPreenchido = '';
                }
                
                // Garantir texto para ações de validação
                if (['valida_contem', 'valida_nao_contem', 'valida_deve_ser', 'valida_nao_deve_ser'].includes(acao)) {
                    if (!sanitizedInteraction.valorPreenchido && !sanitizedInteraction.acaoTexto) {
                        sanitizedInteraction.valorPreenchido = 'texto_teste';
                    }
                }
                
                return sanitizedInteraction;
            })
        }))
    };
    
    return sanitized;
}

export function exportSelectedFeatures(selectedIdxs) {
    if (!selectedIdxs || selectedIdxs.length === 0) {
        showFeedback('Nenhuma feature selecionada.', 'error');
        return;
    }

    if (!window.gherkinFeatures || !Array.isArray(window.gherkinFeatures)) {
        showFeedback('Nenhuma feature para exportar!', 'error');
        return;
    }

    const featuresToExport = window.gherkinFeatures.filter((_, idx) => selectedIdxs.includes(idx));
    if (featuresToExport.length === 0) {
        showFeedback('Selecione ao menos uma feature!', 'error');
        return;
    }

    // Validação de consistência geral
    console.log('[EXPORT] Validando consistência geral dos dados...');
    const consistencyResult = validateDataConsistency(featuresToExport);
    let totalErrors = [...consistencyResult.errors];
    let totalWarnings = [...consistencyResult.warnings];
    
    if (consistencyResult.errors.length > 0) {
        console.error('[EXPORT] Erros críticos de consistência:', consistencyResult.errors);
    }
    if (consistencyResult.warnings.length > 0) {
        console.warn('[EXPORT] Avisos de consistência:', consistencyResult.warnings);
    }
    
    // Validação robusta antes da exportação
    const validatedFeatures = [];
    let validationStartTime = Date.now();
    
    console.log(`[EXPORT] Iniciando validação de ${featuresToExport.length} feature(s)...`);
    
    featuresToExport.forEach((feature, idx) => {
        const featureName = feature.name || `Feature ${idx + 1}`;
        console.log(`[EXPORT] Validando feature: "${featureName}"`);
        
        try {
            const validationResult = validateFeatureData(feature);
            if (validationResult.errors.length > 0) {
                totalErrors.push(`Feature "${featureName}":`);
                totalErrors.push(...validationResult.errors.map(err => `  - ${err}`));
                console.warn(`[EXPORT] Erros críticos na feature "${featureName}":`, validationResult.errors);
            } else {
                // Adiciona avisos mas não bloqueia exportação
                if (validationResult.warnings.length > 0) {
                    totalWarnings.push(`Feature "${featureName}":`);
                    totalWarnings.push(...validationResult.warnings.map(warn => `  - ${warn}`));
                    console.warn(`[EXPORT] Avisos na feature "${featureName}":`, validationResult.warnings);
                }
                
                // Sanitiza a feature se passou na validação crítica
                console.log(`[EXPORT] Sanitizando feature: "${featureName}"`);
                const sanitizedFeature = sanitizeFeatureForExport(feature);
                
                // Validação pós-sanitização para garantir integridade
                const postSanitizationResult = validateFeatureData(sanitizedFeature);
                if (postSanitizationResult.errors.length > 0) {
                    totalErrors.push(`Feature "${featureName}" (pós-sanitização):`);
                    totalErrors.push(...postSanitizationResult.errors.map(err => `  - ${err}`));
                    console.error(`[EXPORT] Erros pós-sanitização na feature "${featureName}":`, postSanitizationResult.errors);
                } else {
                    validatedFeatures.push(sanitizedFeature);
                    console.log(`[EXPORT] Feature validada e sanitizada com sucesso: "${featureName}"`);
                }
            }
        } catch (error) {
            console.error(`[EXPORT] Erro inesperado validando feature "${featureName}":`, error);
            totalErrors.push(`Feature "${featureName}": Erro inesperado durante validação - ${error.message}`);
        }
    });
    
    const validationTime = Date.now() - validationStartTime;
    console.log(`[EXPORT] Validação concluída em ${validationTime}ms`);
    
    // Se houver erros críticos, mostra e para a exportação
    if (totalErrors.length > 0) {
        const errorMessage = `Erros críticos encontrados:\n\n${totalErrors.join('\n')}`;
        console.error('[EXPORT] Exportação cancelada devido a erros críticos:', errorMessage);
        
        // Criar modal de erro mais detalhado
        const errorModal = document.createElement('div');
        errorModal.className = 'bdd-modal-overlay';
        errorModal.innerHTML = `
            <div class="bdd-modal-content" style="max-width: 600px; max-height: 70vh; overflow-y: auto;">
                <div class="bdd-modal-header">
                    <h3>❌ Erros Críticos</h3>
                    <button class="bdd-modal-close">&times;</button>
                </div>
                <div class="bdd-modal-body">
                    <p><strong>A exportação foi cancelada devido aos seguintes erros críticos:</strong></p>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">${errorMessage}</pre>
                    <p><em>Corrija os erros críticos e tente novamente. Verifique o console do navegador para mais detalhes.</em></p>
                </div>
                <div class="bdd-modal-footer">
                    <button class="bdd-btn bdd-btn-secondary" onclick="this.closest('.bdd-modal-overlay').remove()">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        errorModal.querySelector('.bdd-modal-close').onclick = () => errorModal.remove();
        
        showFeedback(`Erros críticos encontrados. ${totalErrors.length} erro(s) detectado(s).`, 'error');
        return;
    }
    
    // Mostrar avisos se existirem, mas permitir exportação
    if (totalWarnings.length > 0) {
        const warningMessage = `Avisos encontrados:\n\n${totalWarnings.join('\n')}`;
        console.warn('[EXPORT] Avisos detectados, mas exportação continuará:', warningMessage);
        
        // Criar modal de aviso
        const warningModal = document.createElement('div');
        warningModal.className = 'bdd-modal-overlay';
        warningModal.innerHTML = `
            <div class="bdd-modal-content" style="max-width: 600px; max-height: 70vh; overflow-y: auto;">
                <div class="bdd-modal-header">
                    <h3>⚠️ Avisos Detectados</h3>
                    <button class="bdd-modal-close">&times;</button>
                </div>
                <div class="bdd-modal-body">
                    <p><strong>Os seguintes avisos foram detectados, mas a exportação continuará:</strong></p>
                    <pre style="background: #fff3cd; padding: 10px; border-radius: 4px; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">${warningMessage}</pre>
                    <p><em>Estes avisos indicam possíveis melhorias ou ajustes que serão feitos automaticamente.</em></p>
                </div>
                <div class="bdd-modal-footer">
                    <button class="bdd-btn bdd-btn-primary" onclick="this.closest('.bdd-modal-overlay').remove()">Continuar Exportação</button>
                    <button class="bdd-btn bdd-btn-secondary" onclick="this.closest('.bdd-modal-overlay').remove()">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(warningModal);
        warningModal.querySelector('.bdd-modal-close').onclick = () => warningModal.remove();
    }
    
    // Se chegou até aqui, todos os dados são válidos
    console.log(`[EXPORT] Iniciando exportação de ${validatedFeatures.length} feature(s) válida(s)...`);
    let exportStartTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    try {
        validatedFeatures.forEach((feature, idx) => {
            try {
                console.log(`[EXPORT] Exportando feature ${idx + 1}/${validatedFeatures.length}: "${feature.name}"`);
                exportFeatureFiles(feature);
                successCount++;
            } catch (error) {
                console.error(`[EXPORT] Erro ao exportar feature "${feature.name}":`, error);
                errorCount++;
            }
        });
        
        const exportTime = Date.now() - exportStartTime;
        console.log(`[EXPORT] Exportação concluída em ${exportTime}ms`);
        
        if (errorCount === 0) {
            if (totalWarnings.length > 0) {
                showFeedback(`✅ ${successCount} feature(s) exportada(s) com ${totalWarnings.length} aviso(s)!`, 'success');
            } else {
                showFeedback(`✅ ${successCount} feature(s) exportada(s) com sucesso!`, 'success');
            }
        } else {
            showFeedback(`⚠️ ${successCount} feature(s) exportada(s), ${errorCount} com erro(s). Verifique o console.`, 'warning');
        }
        
    } catch (error) {
        console.error('[EXPORT] Erro inesperado durante a exportação:', error);
        showFeedback('❌ Erro inesperado durante a exportação. Verifique o console.', 'error');
    }
}

function exportFeatureFiles(feature) {
    const featureSlug = slugify(feature.name);

    // 1. Exporta arquivo .feature
    exportFeatureFile(feature, featureSlug);
    
    // 2. Exporta pages.py
    exportPagesFile(feature, featureSlug);
    
    // 3. Exporta steps.py  
    exportStepsFile(feature, featureSlug);
    
    // 4. Exporta environment.py
    exportEnvironmentFile(feature, featureSlug);
    
    // 5. Exporta requirements.txt
    exportRequirementsFile(feature, featureSlug);
    
    // 6. Exporta README.md
    exportReadmeFile(feature, featureSlug);
}

function exportFeatureFile(feature, featureSlug) {
    let featureText = `Feature: ${feature.name}\n\n`;
    
    (feature.scenarios || []).forEach((scenario) => {
        featureText += `  Scenario: ${scenario.name}\n`;
        
        // Garantir que o último step seja sempre "Then"
        const interactions = [...(scenario.interactions || [])];
        if (interactions.length > 0) {
            // Encontrar o último step que não é "Then"
            let lastNonThenIndex = -1;
            for (let i = interactions.length - 1; i >= 0; i--) {
                if (interactions[i].step !== 'Then') {
                    lastNonThenIndex = i;
                    break;
                }
            }
            
            // Se o último step não for "Then", mudar para "Then"
            if (lastNonThenIndex >= 0 && interactions[lastNonThenIndex].step !== 'Then') {
                interactions[lastNonThenIndex] = {
                    ...interactions[lastNonThenIndex],
                    step: 'Then'
                };
            }
        }
        
        interactions.forEach((interaction) => {
            let frase = generateStepText(interaction);
            let stepLabel = interaction.step || 'When';
            featureText += `    ${stepLabel} ${frase}\n`;
        });
        featureText += '\n';
    });

    downloadFile(`${featureSlug}.feature`, featureText);
}

function exportPagesFile(feature, featureSlug) {
    // Coleta todos os locators únicos
    const locatorSet = new Set();
    const locatorMap = {};
    
    (feature.scenarios || []).forEach((scenario) => {
        (scenario.interactions || []).forEach((interaction) => {
            if (interaction.cssSelector) {
                let locatorName = generateLocatorName(interaction);
                
                // Garantir uniqueness
                let baseName = locatorName;
                let count = 1;
                while (locatorSet.has(locatorName)) {
                    locatorName = baseName + '_' + count;
                    count++;
                }
                locatorSet.add(locatorName);
                locatorMap[locatorName] = interaction.cssSelector;
            }
        });
    });

    const className = slugify(feature.name, true); // UpperCamelCase
    
    const pagesPy = `# ${featureSlug}_pages.py gerado automaticamente para a feature "${feature.name}"
# -*- coding: utf-8 -*-
"""
Page Object Model (POM) para a feature "${feature.name}".
Contém classes de locators e métodos de interação para uso nos steps do Behave.
Inclui tratamento de exceções para maior robustez.
"""

from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementNotInteractableException

class Locators${className}:
    """
    Locators para os elementos da feature "${feature.name}".
    """
${locatorSet.size === 0
    ? `    # Nenhum locator identificado`
    : Array.from(locatorSet).map(key => `    ${key} = (By.CSS_SELECTOR, '${locatorMap[key]}')`).join('\n')
}

class Page${className}:
    """
    Classe de Page Object para interações genéricas da feature "${feature.name}".
    """

    def __init__(self, driver):
        """
        Inicializa o Page Object com o driver do Selenium.
        """
        self.driver = driver

    def acessar_url(self, url):
        """
        Acessa a URL informada.
        """
        try:
            self.driver.get(url)
        except Exception as e:
            print(f"[ERRO] Falha ao acessar URL '{url}': {e}")
            raise

    def clicar(self, locator):
        """
        Clica no elemento identificado pelo locator.
        """
        try:
            self.driver.find_element(*locator).click()
        except (NoSuchElementException, ElementNotInteractableException) as e:
            print(f"[ERRO] Falha ao clicar no elemento {locator}: {e}")
            raise

    def preencher(self, locator, valor):
        """
        Preenche o campo identificado pelo locator com o valor informado.
        """
        try:
            el = self.driver.find_element(*locator)
            el.clear()
            el.send_keys(valor)
        except NoSuchElementException as e:
            print(f"[ERRO] Elemento {locator} não encontrado: {e}")
            raise
        except ElementNotInteractableException as e:
            print(f"[ERRO] Elemento {locator} não interagível: {e}")
            raise
        except Exception as e:
            print(f"[ERRO] Erro inesperado ao preencher {locator}: {e}")
            raise

    def selecionar(self, locator, valor):
        """
        Seleciona o valor informado em um campo select identificado pelo locator.
        """
        try:
            from selenium.webdriver.support.ui import Select
            select = Select(self.driver.find_element(*locator))
            select.select_by_visible_text(valor)
        except (NoSuchElementException, ElementNotInteractableException) as e:
            print(f"[ERRO] Falha ao selecionar valor '{valor}' em {locator}: {e}")
            raise

    def upload_arquivo(self, locator, caminho_arquivo):
        """
        Realiza upload de arquivo no campo identificado pelo locator.
        """
        try:
            self.driver.find_element(*locator).send_keys(caminho_arquivo)
        except (NoSuchElementException, ElementNotInteractableException) as e:
            print(f"[ERRO] Falha ao fazer upload do arquivo '{caminho_arquivo}' em {locator}: {e}")
            raise

    def esperar_elemento(self, locator, timeout=10):
        """
        Aguarda até que o elemento esteja presente na tela.
        """
        try:
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(locator))
        except TimeoutException as e:
            print(f"[ERRO] Timeout ao esperar elemento {locator}: {e}")
            raise

    def esperar_elemento_desaparecer(self, locator, timeout=10):
        """
        Aguarda até que o elemento desapareça da tela.
        """
        try:
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            WebDriverWait(self.driver, timeout).until_not(EC.presence_of_element_located(locator))
        except TimeoutException as e:
            print(f"[ERRO] Timeout ao esperar desaparecimento do elemento {locator}: {e}")
            raise

    def validar_existencia(self, locator):
        """
        Valida se o elemento identificado pelo locator existe na página.
        """
        try:
            self.driver.find_element(*locator)
            return True
        except NoSuchElementException:
            return False

    # Adicione outros métodos genéricos conforme necessário
`;

    downloadFile(`${featureSlug}_pages.py`, pagesPy);
}

function exportStepsFile(feature, featureSlug) {
    const className = slugify(feature.name, true); // UpperCamelCase
    
    let stepsPy = `# ${featureSlug}_steps.py gerado automaticamente\n`;
    stepsPy += `# -*- coding: utf-8 -*-\n"""\nArquivo de steps do Behave para a feature "${feature.name}".\nUtiliza Page Object Model e locators definidos em pages.py.\n"""\n\n`;
    stepsPy += `from behave import given, when, then\n`;
    stepsPy += `from ${featureSlug}_pages import Page${className}, Locators${className}\n\n`;

    // Step para inicializar o Page Object com URL dinâmica
    stepsPy += `@given('que o usuário acessa a página "{url}"')\ndef step_acessa_pagina_inicial(context, url):\n    context.page = Page${className}(context.driver)\n    context.page.acessar_url(url)\n\n`;

    // Adicionar steps específicos para URLs fixas se existirem
    const urlsUsadas = new Set();
    (feature.scenarios || []).forEach((scenario) => {
        (scenario.interactions || []).forEach((interaction) => {
            if (interaction.acao === 'acessa_url' && interaction.url && !urlsUsadas.has(interaction.url)) {
                urlsUsadas.add(interaction.url);
                stepsPy += `@given('que o usuário acessa "${interaction.url}"')\ndef step_acessa_url_${urlsUsadas.size}(context):\n    context.page = Page${className}(context.driver)\n    context.page.acessar_url("${interaction.url}")\n\n`;
            }
        });
    });

    // Gerar steps dinamicamente para cada interação
    let usedSteps = new Set();
    (feature.scenarios || []).forEach((scenario, cIdx) => {
        (scenario.interactions || []).forEach((interaction, iIdx) => {
            if (interaction.acao === 'acessa_url') return; // Skip URL access, already handled above
            
            let locatorName = generateLocatorName(interaction);
            const stepKey = `${interaction.acao}|${locatorName}|${interaction.step}`;
            
            if (usedSteps.has(stepKey)) return;
            usedSteps.add(stepKey);

            let decorator = '';
            let funcName = '';
            let body = '';
            let frase = generateStepText(interaction);
            let params = '';

            // Define o decorator
            if (interaction.step === 'Given') decorator = '@given';
            else if (interaction.step === 'Then') decorator = '@then';
            else decorator = '@when';

            // Nome da função
            funcName = `step_${interaction.acao}_${locatorName}_${cIdx}_${iIdx}`.replace(/[^a-zA-Z0-9_]/g, '_');

            // Parâmetros e corpo
            if (interaction.acao === 'preenche') {
                params = 'context, valor';
                body = `    context.page.preencher(Locators${className}.${locatorName}, valor)`;
                frase = frase.replace(interaction.valorPreenchido || '<valor>', '{valor}');
            } else if (interaction.acao === 'upload') {
                params = 'context, arquivo';
                body = `    context.page.upload_arquivo(Locators${className}.${locatorName}, arquivo)`;
                frase = frase.replace(interaction.nomeArquivo || '<arquivo>', '{arquivo}');
            } else if (interaction.acao === 'espera_segundos') {
                params = 'context, segundos';
                let tempo = interaction.tempoEspera || 1;
                body = `    import time\n    time.sleep(int(segundos))`;
                frase = frase.replace(tempo.toString(), '{segundos}');
            } else if (interaction.acao === 'espera_elemento') {
                params = 'context';
                body = `    context.page.esperar_elemento(Locators${className}.${locatorName})`;
            } else if (interaction.acao === 'clica') {
                params = 'context';
                body = `    context.page.clicar(Locators${className}.${locatorName})`;
            } else if (interaction.acao && interaction.acao.toLowerCase().includes('valida')) {
                params = 'context';
                body = `    assert context.page.validar_existencia(Locators${className}.${locatorName})`;
            } else {
                params = 'context';
                body = `    # Implemente a ação '${interaction.acao}' para o locator '${locatorName}'`;
            }

            stepsPy += `${decorator}('${frase}')\ndef ${funcName}(${params}):\n${body}\n\n`;
        });
    });

    stepsPy += `# Adicione outros steps conforme necessário, usando os métodos e locators definidos em pages.py\n`;

    downloadFile(`${featureSlug}_steps.py`, stepsPy);
}

function exportEnvironmentFile(feature, featureSlug) {
    const environmentPy = `# environment.py gerado automaticamente para a feature "${feature.name}"
# -*- coding: utf-8 -*-
"""
Arquivo de configuração do Behave para a feature "${feature.name}".
Responsável por inicializar e finalizar o driver do Selenium, além de capturar screenshots em caso de falha.
"""

import os
import logging
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

def before_all(context):
    """
    Inicializa o driver do Selenium antes de todos os testes.
    """
    logging.basicConfig(level=logging.INFO)
    
    # Configuração do driver (Chrome por padrão)
    try:
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless')  # Descomente para execução em modo headless
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        context.driver = webdriver.Chrome(
            service=webdriver.chrome.service.Service(ChromeDriverManager().install()),
            options=options
        )
        context.driver.maximize_window()
        context.driver.implicitly_wait(10)
        logging.info("Driver Chrome inicializado com sucesso.")
    except WebDriverException as e:
        logging.error(f"Erro ao inicializar o driver: {e}")
        raise

def after_scenario(context, scenario):
    """
    Captura screenshot em caso de falha do cenário.
    """
    if scenario.status == "failed":
        try:
            if hasattr(context, 'driver'):
                # Cria diretório de screenshots se não existir
                os.makedirs('screenshots', exist_ok=True)
                
                # Nome do arquivo com timestamp
                import datetime
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"screenshot_{scenario.name}_{timestamp}.png"
                filepath = os.path.join('screenshots', filename)
                
                context.driver.save_screenshot(filepath)
                logging.error(f"Step falhou. Screenshot salvo em: {filepath}")
        except Exception as e:
            logging.error(f"Erro ao salvar screenshot: {e}")

def after_all(context):
    """
    Finaliza o driver após todos os testes.
    """
    try:
        if hasattr(context, 'driver'):
            context.driver.quit()
            logging.info("Driver finalizado com sucesso.")
    except Exception as e:
        logging.error(f"Erro ao finalizar o driver: {e}")
`;

    downloadFile('environment.py', environmentPy);
}

function exportRequirementsFile(feature, featureSlug) {
    const requirementsTxt = `# requirements.txt gerado automaticamente
selenium
behave
webdriver-manager
pytest
python-dotenv
colorama
pytest-bdd
requests
`;

    downloadFile(`requirements_${featureSlug}.txt`, requirementsTxt);
}

function exportReadmeFile(feature, featureSlug) {
    let readme = `# Feature: ${feature.name}\n\n## Descrição do fluxo\nEsta feature cobre o(s) seguinte(s) cenário(s):\n\n`;
    
    (feature.scenarios || []).forEach((scenario) => {
        readme += `### Cenário: ${scenario.name}\n`;
        readme += `**Fluxo resumido:**\n`;
        (scenario.interactions || []).forEach((interaction) => {
            let step = interaction.step || '';
            let acao = interaction.acao || '';
            let elemento = interaction.nomeElemento || '';
            let valor = interaction.valorPreenchido ? ` (valor: "${interaction.valorPreenchido}")` : '';
            let extra = '';
            if (interaction.acao === 'upload' && interaction.nomeArquivo) {
                extra = ` (arquivo: ${interaction.nomeArquivo})`;
            }
            readme += `- ${step} ${acao} em "${elemento}"${valor}${extra}\n`;
        });
        readme += '\n';
    });

    readme += `## Como executar os testes\n\n`;
    
    readme += `### 1. Configuração inicial do ambiente\n`;
    readme += `**1.1. Instale o Python 3.8 ou superior**\n`;
    readme += `- Baixe em: https://www.python.org/downloads/\n`;
    readme += `- Durante a instalação, marque "Add Python to PATH"\n\n`;
    
    readme += `**1.2. Instale as dependências:**\n`;
    readme += '   ```bash\n   pip install -r requirements.txt\n   ```\n\n';
    
    readme += `**1.3. Configure o WebDriver (Chrome)**\n`;
    readme += `- Verifique sua versão do Chrome: Menu > Ajuda > Sobre o Google Chrome\n`;
    readme += `- Baixe o ChromeDriver compatível em: https://chromedriver.chromium.org/\n`;
    readme += `- Extraia o executável e adicione ao PATH do sistema OU\n`;
    readme += `- Coloque o executável na pasta do projeto\n\n`;
    
    readme += `### 2. Estrutura de pastas recomendada\n`;
    readme += `Organize seu projeto da seguinte forma:\n`;
    readme += '```\n';
    readme += `projeto_testes/\n`;
    readme += `├── features/\n`;
    readme += `│   ├── ${featureSlug}.feature\n`;
    readme += `│   └── steps/\n`;
    readme += `│       └── ${featureSlug}_steps.py\n`;
    readme += `├── pages/\n`;
    readme += `│   └── ${featureSlug}_pages.py\n`;
    readme += `├── environment.py\n`;
    readme += `├── requirements.txt\n`;
    readme += `├── README_${featureSlug}.md\n`;
    readme += `└── reports/          # (pasta criada automaticamente)\n`;
    readme += `    └── screenshots/ # (capturas de erro)\n`;
    readme += '```\n\n';
    
    readme += `### 3. Comandos de execução\n`;
    readme += `**3.1. Executar todos os testes:**\n`;
    readme += '   ```bash\n   behave\n   ```\n\n';
    
    readme += `**3.2. Executar apenas esta feature:**\n`;
    readme += `   \`\`\`bash\n   behave features/${featureSlug}.feature\n   \`\`\`\n\n`;
    
    readme += `**3.3. Executar com relatório detalhado:**\n`;
    readme += '   ```bash\n   behave --format=pretty --format=html --outfile=reports/report.html\n   ```\n\n';
    
    readme += `**3.4. Executar em modo debug (sem fechar o navegador):**\n`;
    readme += '   ```bash\n   behave -D debug=true\n   ```\n\n';
    
    readme += `### 4. Configurações importantes\n`;
    readme += `**4.1. Arquivo environment.py**\n`;
    readme += `- Configure a URL base do sistema em \`BASE_URL\`\n`;
    readme += `- Ajuste timeouts se necessário\n`;
    readme += `- Modifique configurações do WebDriver conforme o ambiente\n\n`;
    
    readme += `**4.2. Arquivo de Pages**\n`;
    readme += `- Verifique se os seletores CSS/XPath estão corretos para seu ambiente\n`;
    readme += `- Atualize URLs específicas se necessário\n`;
    readme += `- Customize métodos de interação conforme necessário\n\n`;
    
    readme += `**4.3. Arquivo de Steps**\n`;
    readme += `- Adapte valores de teste (usuários, senhas, dados) para seu ambiente\n`;
    readme += `- Ajuste validações conforme regras de negócio\n`;
    readme += `- Adicione steps customizados se necessário\n\n`;

    readme += `## Pré-requisitos\n`;
    readme += `### Sistema Operacional\n`;
    readme += `- Windows 10/11, macOS 10.14+, ou Linux Ubuntu 18.04+\n\n`;
    
    readme += `### Software\n`;
    readme += `- **Python 3.8+** (obrigatório)\n`;
    readme += `- **Google Chrome** 90+ ou **Firefox** 88+ (recomendado Chrome)\n`;
    readme += `- **Git** (para versionamento, opcional)\n`;
    readme += `- **IDE/Editor** (VS Code, PyCharm, etc.)\n\n`;
    
    readme += `### Acesso\n`;
    readme += `- Acesso ao ambiente de testes\n`;
    readme += `- Credenciais de usuário para testes (se aplicável)\n`;
    readme += `- Conectividade com internet\n\n`;

    readme += `## Estrutura dos arquivos\n`;
    readme += `### Arquivos principais\n`;
    readme += `- **\`${featureSlug}.feature\`** - Cenários em linguagem Gherkin (Given/When/Then)\n`;
    readme += `- **\`${featureSlug}_pages.py\`** - Page Object Model com seletores e métodos de interação\n`;
    readme += `- **\`${featureSlug}_steps.py\`** - Implementação dos steps do Behave em Python\n`;
    readme += `- **\`environment.py\`** - Configuração do ambiente e hooks do Behave\n`;
    readme += `- **\`requirements.txt\`** - Dependências Python necessárias\n\n`;
    
    readme += `### Arquivos de apoio\n`;
    readme += `- **\`README_${featureSlug}.md\`** - Este arquivo com instruções\n`;
    readme += `- **\`reports/\`** - Pasta para relatórios e screenshots (criada automaticamente)\n\n`;

    readme += `## Solução de problemas comuns\n\n`;
    
    readme += `### ❌ "chromedriver not found"\n`;
    readme += `**Solução:**\n`;
    readme += `1. Baixe o ChromeDriver: https://chromedriver.chromium.org/\n`;
    readme += `2. Extraia e adicione ao PATH do sistema OU coloque na pasta do projeto\n`;
    readme += `3. Verifique se a versão é compatível com seu Chrome\n\n`;
    
    readme += `### ❌ "pip: command not found"\n`;
    readme += `**Solução:**\n`;
    readme += `1. Reinstale o Python marcando "Add to PATH"\n`;
    readme += `2. No Windows, use \`py -m pip install -r requirements.txt\`\n`;
    readme += `3. No Mac/Linux, use \`python3 -m pip install -r requirements.txt\`\n\n`;
    
    readme += `### ❌ "Element not found" ou timeouts\n`;
    readme += `**Solução:**\n`;
    readme += `1. Verifique se a URL base está correta no environment.py\n`;
    readme += `2. Confirme que os seletores CSS/XPath são válidos para seu ambiente\n`;
    readme += `3. Aumente os timeouts se a aplicação for lenta\n`;
    readme += `4. Use o modo debug para investigar: \`behave -D debug=true\`\n\n`;
    
    readme += `### ❌ "ModuleNotFoundError"\n`;
    readme += `**Solução:**\n`;
    readme += `1. Certifique-se de estar na pasta correta do projeto\n`;
    readme += `2. Execute novamente: \`pip install -r requirements.txt\`\n`;
    readme += `3. Verifique se está usando a versão correta do Python\n\n`;

    readme += `## Dicas importantes\n\n`;
    readme += `### 🎯 Boas práticas\n`;
    readme += `- **Execute os testes em ambiente isolado** (não em produção)\n`;
    readme += `- **Mantenha dados de teste atualizados** nos arquivos de steps\n`;
    readme += `- **Valide seletores regularmente** - interfaces podem mudar\n`;
    readme += `- **Use o modo headless** para execução em servidores CI/CD\n`;
    readme += `- **Revise screenshots de erro** na pasta reports/screenshots/\n\n`;
    
    readme += `### 🔧 Customizações\n`;
    readme += `- **Seletores:** Adapte CSS/XPath no arquivo \`*_pages.py\`\n`;
    readme += `- **Dados de teste:** Modifique valores no arquivo \`*_steps.py\`\n`;
    readme += `- **Timeouts:** Ajuste no arquivo \`environment.py\`\n`;
    readme += `- **Navegador:** Troque Chrome por Firefox no \`environment.py\`\n`;
    readme += `- **Relatórios:** Configure formatos no comando behave\n\n`;
    
    readme += `### 📊 Monitoramento\n`;
    readme += `- Screenshots automáticos em falhas\n`;
    readme += `- Logs detalhados no terminal\n`;
    readme += `- Relatórios HTML opcionais\n`;
    readme += `- Métricas de tempo de execução\n\n`;

    readme += `## Observações finais\n`;
    readme += `- \`environment.py\` - Configuração do ambiente de testes\n`;
    readme += `- \`requirements.txt\` - Dependências Python\n\n`;

    readme += `## Observações finais\n`;
    readme += `### ⚠️ Importante\n`;
    readme += `- **Adapte os seletores** conforme necessário para o seu ambiente específico\n`;
    readme += `- **Teste em ambiente controlado** antes de usar em produção\n`;
    readme += `- **Mantenha backups** dos arquivos customizados\n`;
    readme += `- **Documente modificações** para facilitar manutenção\n\n`;
    
    readme += `### 📞 Suporte\n`;
    readme += `- Consulte a documentação do Behave: https://behave.readthedocs.io/\n`;
    readme += `- Documentação do Selenium: https://selenium-python.readthedocs.io/\n`;
    readme += `- Para problemas específicos, verifique os logs e screenshots gerados\n\n`;
    
    readme += `### 🔄 Versionamento\n`;
    readme += `- Gerado automaticamente pela extensão Gherkin Generator\n`;
    readme += `- Feature: ${feature.name}\n`;
    readme += `- Data de exportação: ${new Date().toLocaleString('pt-BR')}\n`;
    readme += `- URL base: ${window.location.origin}\n\n`;
    
    readme += `---\n`;
    readme += `**✨ Automatização gerada com Gherkin Generator**\n`;
    readme += `*Ferramenta desenvolvida para facilitar a criação de testes automatizados*\n`;

    downloadFile(`README_${featureSlug}.md`, readme);
}

// Funções auxiliares
function generateStepText(interaction) {
    // Capturar URL corretamente para ação "acessa_url"
    if (interaction.acao === 'acessa_url') {
        // Primeiro tenta pegar da propriedade url, depois do nomeElemento, se não tiver usa URL atual
        let url = interaction.url || interaction.nomeElemento || window.location.href || '<URL>';
        // Se a URL não começar com http, adicionar protocolo padrão
        if (url && !url.startsWith('http')) {
            url = 'https://' + url;
        }
        return `que o usuário acessa a página "${url}"`;
    }
    
    switch (interaction.acao) {
        case 'clica':
            return `o usuário clica no elemento "${interaction.nomeElemento || ''}"`;
        case 'preenche':
            let valor = (interaction.valorPreenchido !== undefined && interaction.valorPreenchido !== null && interaction.valorPreenchido !== '') ? interaction.valorPreenchido : '<valor>';
            return `o usuário preenche o campo "${interaction.nomeElemento || ''}" com "${valor}"`;
        case 'upload':
            let arquivo = (interaction.nomeArquivo !== undefined && interaction.nomeArquivo !== null && interaction.nomeArquivo !== '') ? interaction.nomeArquivo : '<arquivo>';
            return `o usuário faz upload do arquivo "${arquivo}" no campo "${interaction.nomeElemento || ''}"`;
        case 'login':
            return `o usuário faz login com usuário "${interaction.nomeElemento || ''}" e senha "${interaction.valorPreenchido || ''}"`;
        case 'espera_elemento':
            return `o usuário espera o elemento "${interaction.nomeElemento || ''}" aparecer`;
        case 'espera_segundos':
            return `o usuário espera ${interaction.tempoEspera || '<segundos>'} segundos`;
        case 'espera_nao_existe':
            return `o usuário espera o elemento "${interaction.nomeElemento || ''}" desaparecer`;
        case 'valida_existe':
            return `o usuário valida que existe o elemento "${interaction.nomeElemento || ''}"`;
        case 'valida_nao_existe':
            return `o usuário valida que não existe o elemento "${interaction.nomeElemento || ''}"`;
        case 'valida_contem':
            return `o usuário valida que o elemento "${interaction.nomeElemento || ''}" contém "${interaction.valorPreenchido || ''}"`;
        case 'valida_nao_contem':
            return `o usuário valida que o elemento "${interaction.nomeElemento || ''}" não contém "${interaction.valorPreenchido || ''}"`;
        case 'valida_deve_ser':
            return `o usuário valida que o elemento "${interaction.nomeElemento || ''}" deve ser "${interaction.valorPreenchido || ''}"`;
        case 'valida_nao_deve_ser':
            return `o usuário valida que o elemento "${interaction.nomeElemento || ''}" não deve ser "${interaction.valorPreenchido || ''}"`;
        default:
            return `${interaction.acao || 'ação'} no elemento "${interaction.nomeElemento || ''}"`;
    }
}

function generateLocatorName(interaction) {
    let locatorName = '';
    if (interaction.nomeElemento) {
        // Sanitizar nome do elemento: apenas letras, números, espaços, hífens e underscores
        locatorName = interaction.nomeElemento
            .split('|')[0]
            .trim()
            // Remove caracteres inválidos, mantendo apenas letras, números, espaços, hífens e underscores
            .replace(/[^a-zA-Z0-9\s\-_\u00C0-\u017F]/g, '')
            // Substitui espaços e múltiplos hífens/underscores por underscore único
            .replace(/[\s\-]+/g, '_')
            .replace(/_+/g, '_')
            // Remove underscores do início e fim
            .replace(/^_+|_+$/g, '');
    }
    if (!locatorName || locatorName.length === 0) {
        locatorName = 'ELEMENTO_' + Math.random().toString(36).substring(2, 8);
    }
    return locatorName.toUpperCase();
}

function sanitizeElementName(name) {
    if (!name || typeof name !== 'string') return '';
    
    return name
        // Remove caracteres de controle
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Manter apenas letras, números, espaços, hífens e underscores (incluindo acentos)
        .replace(/[^a-zA-Z0-9\s\-_\u00C0-\u017F]/g, '')
        // Normalizar múltiplos espaços, hífens e underscores
        .replace(/\s+/g, ' ')
        .replace(/-+/g, '-')
        .replace(/_+/g, '_')
        // Remove espaços do início e fim
        .trim()
        // Limita tamanho
        .substring(0, 300);
}

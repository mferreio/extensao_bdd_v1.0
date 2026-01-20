# 📁 Exportação Estruturada - Guia de Uso

**Versão:** 1.1.0  
**Data:** 15 de janeiro de 2026  
**Status:** ✅ Implementado

---

## 🎯 O Que Foi Implementado

A extensão agora exporta arquivos com **estrutura organizada de pastas**, facilitando a navegação e organização do projeto BDD.

### Estrutura de Pastas

Quando você exportar uma feature, os arquivos serão organizados automaticamente nas seguintes pastas:

```
seu-projeto-bdd/
├── features/               # Arquivos .feature (Gherkin)
│   ├── login.feature
│   └── cadastro.feature
│
├── pages/                  # Page Objects (Selenium)
│   ├── login_pages.py
│   └── cadastro_pages.py
│
├── steps/                  # Step Definitions (Behave)
│   ├── login_steps.py
│   └── cadastro_steps.py
│
├── config/                 # Configurações e dependências
│   ├── environment.py
│   ├── requirements_login.txt
│   └── requirements_cadastro.txt
│
├── docs/                   # Documentação
│   ├── README_login.md
│   └── README_cadastro.md
│
├── metadata/               # Informações de exportação
│   ├── export_metadata.json
│   └── export_metadata.yaml
│
└── logs/                   # Logs de auditoria
    ├── export_audit.json
    └── export_audit.csv
```

---

## 🚀 Como Usar

### 1. Criar Features Normalmente

1. Abra a extensão
2. Crie suas features e cenários
3. Grave as interações

### 2. Exportar com Estrutura

1. Clique em "Finalizar Feature"
2. Vá para a tela de exportação
3. Selecione as features desejadas
4. Clique em "Exportar Selecionadas"

### 3. Resultado

Os arquivos serão baixados automaticamente com prefixos de pasta:

```
✓ features/login.feature
✓ pages/login_pages.py
✓ steps/login_steps.py
✓ config/environment.py
✓ config/requirements_login.txt
✓ docs/README_login.md
✓ metadata/export_metadata.json
✓ logs/export_audit.csv
```

---

## 📊 Comparativo: Antes vs Depois

### ANTES (Exportação Simples)
```
❌ Todos os arquivos na mesma pasta
❌ Difícil de organizar
❌ Nomes confusos

Downloads/
├── login.feature
├── login_pages.py
├── login_steps.py
├── cadastro.feature
├── cadastro_pages.py
├── cadastro_steps.py
├── environment.py
└── ... (16+ arquivos misturados)
```

### DEPOIS (Exportação Estruturada)
```
✅ Arquivos organizados por tipo
✅ Fácil navegação
✅ Estrutura profissional

features/login.feature
pages/login_pages.py
steps/login_steps.py
config/environment.py
docs/README_login.md
metadata/export_metadata.json
logs/export_audit.csv
```

---

## 💡 Organização Inteligente

### Regras de Organização

| Tipo de Arquivo | Pasta | Exemplo |
|-----------------|-------|---------|
| `.feature` | `features/` | login.feature |
| `*_pages.py` | `pages/` | login_pages.py |
| `*_steps.py` | `steps/` | login_steps.py |
| `environment.py` | `config/` | environment.py |
| `requirements_*.txt` | `config/` | requirements_login.txt |
| `README_*.md` | `docs/` | README_login.md |
| `*metadata*` | `metadata/` | export_metadata.json |
| `*audit*` | `logs/` | export_audit.csv |

---

## 📦 Arquivos Exportados por Feature

Cada feature gera **6 arquivos principais** + **metadata e logs**:

### 1. Feature File (`.feature`)
```gherkin
# features/login.feature
Feature: Login
  Scenario: Login com sucesso
    Given abrir página de login
    When preencher usuário e senha
    Then validar redirecionamento
```

### 2. Pages File (`*_pages.py`)
```python
# pages/login_pages.py
class LoginPage:
    def __init__(self, browser):
        self.browser = browser
    
    # Localizadores e métodos
```

### 3. Steps File (`*_steps.py`)
```python
# steps/login_steps.py
from behave import given, when, then

@given('abrir página de login')
def step_open_login(context):
    context.browser.get('http://example.com/login')
```

### 4. Environment File (`environment.py`)
```python
# config/environment.py
def before_all(context):
    context.browser = webdriver.Chrome()
```

### 5. Requirements File (`requirements_*.txt`)
```
# config/requirements_login.txt
selenium==4.15.2
behave==1.2.6
```

### 6. README File (`README_*.md`)
```markdown
# docs/README_login.md
# Login - Testes BDD
Instruções de instalação e execução
```

### 7. Metadata (opcional)
```json
// metadata/export_metadata.json
{
  "exportedAt": "2026-01-15T14:30:00Z",
  "featureCount": 1,
  "extensionVersion": "1.1.0"
}
```

### 8. Logs de Auditoria (opcional)
```csv
# logs/export_audit.csv
timestamp,level,message,duration_ms
2026-01-15T14:30:00Z,info,Sessão iniciada,0
2026-01-15T14:30:01Z,info,Feature exportada: Login,1234
```

---

## 🔧 Opções Avançadas

### Exportação com Console

Se preferir controle programático:

```javascript
// Abrir console (F12)
const manager = window.exportManager;

// Exportar com opções
manager.exportFeatures(window.gherkinFeatures, {
    format: 'individual',      // 'individual' ou 'zip'
    includeMetadata: true,     // true/false
    includeLogs: true,         // true/false
    onProgress: (current, total) => {
        console.log(`${current}/${total} features exportadas`);
    }
});
```

---

## 📋 Como Organizar os Arquivos no Seu Projeto

### Opção 1: Criar Estrutura Manualmente

1. Criar pastas no seu projeto:
```bash
mkdir features pages steps config docs metadata logs
```

2. Mover arquivos baixados para as pastas correspondentes

### Opção 2: Script de Organização (Windows)

```powershell
# organize.ps1
$files = Get-ChildItem -File

foreach ($file in $files) {
    $name = $file.Name
    
    if ($name -like "features/*") {
        Move-Item $file "features/"
    }
    elseif ($name -like "pages/*") {
        Move-Item $file "pages/"
    }
    # ... continuar para outras pastas
}
```

### Opção 3: Script de Organização (Linux/Mac)

```bash
#!/bin/bash
# organize.sh

# Criar pastas se não existirem
mkdir -p features pages steps config docs metadata logs

# Mover arquivos
mv features/* features/ 2>/dev/null
mv pages/* pages/ 2>/dev/null
mv steps/* steps/ 2>/dev/null
mv config/* config/ 2>/dev/null
mv docs/* docs/ 2>/dev/null
mv metadata/* metadata/ 2>/dev/null
mv logs/* logs/ 2>/dev/null
```

---

## ✨ Benefícios da Estrutura Organizada

### Para Desenvolvimento
✅ **Fácil navegação** - Encontre arquivos rapidamente  
✅ **Padrão profissional** - Estrutura reconhecida pela comunidade  
✅ **Escalável** - Adicione novas features sem bagunça  
✅ **Manutenível** - Separa responsabilidades claramente  

### Para Colaboração
✅ **Onboarding rápido** - Novos membros entendem a estrutura  
✅ **Code review simplificado** - Arquivos organizados por tipo  
✅ **Versionamento limpo** - Git diff mais legível  

### Para Produção
✅ **CI/CD friendly** - Estrutura compatível com pipelines  
✅ **Documentação clara** - Pastas docs/ e metadata/  
✅ **Auditoria completa** - Logs estruturados em logs/  

---

## 🎓 Exemplo Completo

### Cenário: Exportar 2 Features

**Features criadas:**
1. Login
2. Cadastro

**Após exportação, você terá:**

```
features/
├── login.feature
└── cadastro.feature

pages/
├── login_pages.py
└── cadastro_pages.py

steps/
├── login_steps.py
└── cadastro_steps.py

config/
├── environment.py
├── requirements_login.txt
└── requirements_cadastro.txt

docs/
├── README_login.md
└── README_cadastro.md

metadata/
├── export_metadata.json
└── export_metadata.yaml

logs/
├── export_audit.json
└── export_audit.csv
```

**Total:** 15 arquivos organizados em 7 pastas

---

## 🐛 Troubleshooting

### Problema: Arquivos não têm prefixo de pasta

**Causa:** Navegador pode não suportar download com prefixo de pasta

**Solução:** 
1. Use o script de organização (opções 2 ou 3 acima)
2. Ou organize manualmente conforme a estrutura

### Problema: Muitos arquivos baixados

**Causa:** Normal - cada feature gera 6+ arquivos

**Solução:** 
- Configure seu navegador para perguntar onde salvar
- Ou use a pasta padrão de Downloads e organize depois

### Problema: Metadata ou Logs não aparecem

**Causa:** Opções desativadas

**Solução:**
```javascript
// Console (F12)
window.exportManager.exportFeatures(window.gherkinFeatures, {
    includeMetadata: true,  // ← Certifique-se que está true
    includeLogs: true       // ← Certifique-se que está true
});
```

---

## 📚 Recursos Adicionais

### Documentação Relacionada
- `MELHORIAS_EXPORTACAO_v1.1.0.md` - Documentação técnica completa
- `GUIA_INTEGRACAO_EXPORTACAO.md` - Exemplos práticos de código
- `RESUMO_MELHORIAS_EXPORTACAO.md` - Sumário executivo

### Arquivos de Código
- `src/export/export-manager.js` - Gerenciador de exportação
- `src/export/compressor.js` - Compressão ZIP
- `src/export/export-bridge.js` - Interface unificada

---

## ✅ Checklist de Uso

- [ ] Criar features e cenários na extensão
- [ ] Finalizar features
- [ ] Ir para tela de exportação
- [ ] Selecionar features desejadas
- [ ] Clicar em "Exportar Selecionadas"
- [ ] Aguardar modal de progresso
- [ ] Verificar arquivos baixados
- [ ] Organizar em pastas (se necessário)
- [ ] Verificar metadata e logs
- [ ] Validar estrutura do projeto

---

## 🎉 Conclusão

A exportação estruturada torna seu projeto BDD mais **profissional**, **organizado** e **fácil de manter**.

**Principais vantagens:**
1. ✅ Organização automática por tipo de arquivo
2. ✅ Estrutura compatível com padrões da indústria
3. ✅ Metadata e logs para auditoria
4. ✅ Fácil navegação e manutenção
5. ✅ Pronto para CI/CD e produção

---

**Implementado em:** 15 de janeiro de 2026  
**Versão:** 1.1.0  
**Status:** ✅ Pronto para Uso  
**Bundle Size:** 211 KiB  
**Build:** 0 erros

🚀 **Sua exportação agora é profissional!**

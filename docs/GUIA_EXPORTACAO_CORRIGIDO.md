# Guia de Exportação - Sistema Corrigido

## Visão Geral

O sistema de exportação gera automaticamente um projeto completo de testes automatizados em Python usando Selenium e Behave (BDD).

## Estrutura de Arquivos Gerados

```
projeto_exportado/
├── features/                   # Arquivos Gherkin
│   ├── nome_feature.feature    # Arquivo .feature com cenários
│   ├── pages/                  # Page Objects
│   │   └── nome_feature_page.py
│   └── steps/                  # Step Definitions
│       └── nome_feature_steps.py
├── environment.py              # Configuração do Behave
├── requirements.txt            # Dependências Python
└── README.md                   # Instruções de uso
```

## Arquivos Gerados

### 1. Arquivo .feature (Gherkin)
- **Localização**: `features/nome_feature.feature`
- **Conteúdo**: Cenários em linguagem Gherkin (Given, When, Then)
- **Formato**: Texto puro em português com sintaxe Gherkin

### 2. Page Object (nome_feature_page.py)
- **Localização**: `features/pages/nome_feature_page.py`
- **Conteúdo**:
  - Classe de Locators (seletores CSS/XPath)
  - Classe Page com métodos para interação
  - Métodos de alto nível (ex: realizar_login)
- **Padrão**: Page Object Model

### 3. Steps (nome_feature_steps.py)
- **Localização**: `features/steps/nome_feature_steps.py`
- **Conteúdo**:
  - Decoradores @given, @when, @then
  - Implementação dos steps Gherkin
  - Integração com Page Objects

### 4. Environment (environment.py)
- **Localização**: `environment.py` (raiz)
- **Conteúdo**:
  - Configuração do Selenium WebDriver
  - Hooks do Behave (before_all, after_all, etc.)
  - Configuração de screenshots em falhas

### 5. Requirements (requirements.txt)
- **Localização**: `requirements.txt` (raiz)
- **Conteúdo**:
  ```
  selenium==4.15.2
  behave==1.2.6
  webdriver-manager==4.0.1
  ```

### 6. README.md
- **Localização**: `README.md` (raiz)
- **Conteúdo**:
  - Instruções de instalação
  - Como executar os testes
  - Troubleshooting
  - Estrutura do projeto

## Fluxo de Exportação

1. **Captura de Interações**: Usuário interage com a página
2. **Conversão para Gherkin**: Sistema converte em steps Given/When/Then
3. **Geração de Arquivos**: 
   - .feature (Gherkin)
   - *_page.py (Page Object)
   - *_steps.py (Step Definitions)
   - environment.py (Configuração)
   - requirements.txt (Dependências)
   - README.md (Documentação)
4. **Download**: Arquivos são baixados automaticamente

## Regras de Steps

- **Primeiro step**: Sempre "Given" (configuração inicial)
- **Steps intermediários**: "When" (ações do usuário)
- **Último step**: "Then" (validação)

## Exemplo de Exportação

### Feature Capturada
- Nome: "Login no sistema"
- Cenário: "Login com sucesso"
- Interações:
  1. Acessa URL
  2. Preenche usuário
  3. Preenche senha
  4. Clica em entrar
  5. Valida mensagem de sucesso

### Arquivos Gerados

**login_no_sistema.feature**:
```gherkin
# language: pt
Funcionalidade: Login no sistema

  Cenário: Login com sucesso
    Given acessa a URL "https://exemplo.com/login"
    When preenche usuario com "teste@teste.com"
    When preenche senha com "senha123"
    When clica no botao_entrar
    Then valido mensagem de sucesso
```

**features/pages/login_no_sistema_page.py**:
```python
class LoginNoSistemaLocators:
    USUARIO = (By.CSS_SELECTOR, "#usuario")
    SENHA = (By.CSS_SELECTOR, "#senha")
    BOTAO_ENTRAR = (By.CSS_SELECTOR, "button[type='submit']")

class LoginNoSistemaPage:
    def __init__(self, browser):
        self.browser = browser
        self.wait = WebDriverWait(browser, 10)
        self.locators = LoginNoSistemaLocators()
    
    def preencher_usuario(self, texto):
        element = self.wait.until(EC.visibility_of_element_located(self.locators.USUARIO))
        element.clear()
        element.send_keys(texto)
        return self
```

**features/steps/login_no_sistema_steps.py**:
```python
from behave import given, when, then
from features.pages.login_no_sistema_page import LoginNoSistemaPage

@given('acessa a URL "{url}"')
def step_acessa_url(context, url):
    context.browser.get(url)
    context.page = LoginNoSistemaPage(context.browser)

@when('preenche {campo} com "{valor}"')
def step_preenche_campo(context, campo, valor):
    if campo == "usuario":
        context.page.preencher_usuario(valor)
    elif campo == "senha":
        context.page.preencher_senha(valor)
```

## Validação de Dados

O sistema valida:
- Nomes de features e cenários
- Seletores CSS/XPath
- Valores preenchidos
- Estrutura de steps

## Boas Práticas Implementadas

1. **Separação de responsabilidades**:
   - Locators separados das ações
   - Page Objects isolados
   - Steps enxutos e focados

2. **Tratamento de erros**:
   - TimeoutException
   - NoSuchElementException
   - Validações de elementos

3. **Esperas explícitas**:
   - WebDriverWait em todos os elementos
   - Condições de espera apropriadas

4. **Method Chaining**:
   - Métodos retornam `self`
   - Permite encadeamento fluente

5. **Documentação**:
   - Docstrings em todos os métodos
   - Comentários explicativos
   - README completo

## Troubleshooting

### Problema: Arquivos não são baixados
**Solução**: Verificar permissões de download do navegador

### Problema: Seletores inválidos
**Solução**: Sistema sanitiza e valida seletores automaticamente

### Problema: Steps não correspondem ao Gherkin
**Solução**: Verificar formatação dos steps no arquivo *_steps.py

## Status Atual

✅ Geração de .feature (Gherkin)
✅ Geração de Page Objects
✅ Geração de Steps
✅ Geração de environment.py
✅ Geração de requirements.txt
✅ Geração de README.md
✅ Validação de dados
✅ Sanitização de inputs
✅ Tratamento de erros

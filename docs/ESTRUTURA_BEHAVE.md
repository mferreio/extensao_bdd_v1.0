# Estrutura de Exportação Behave

## 📁 Estrutura de Pastas

```
projeto_bdd/
├── features/
│   ├── login.feature
│   ├── cadastro.feature
│   ├── pages/
│   │   ├── __init__.py
│   │   ├── login_page.py
│   │   └── cadastro_page.py
│   └── steps/
│       ├── __init__.py
│       ├── login_steps.py
│       └── cadastro_steps.py
├── environment.py
├── requirements.txt
├── behave.ini
└── .gitignore
```

## 📄 Arquivos Gerados

### 1. **Features** (`*.feature`)
- Localização: `features/`
- Formato: Gherkin em português
- Contém: Cenários e steps em BDD

### 2. **Page Objects** (`*_page.py`)
- Localização: `features/pages/`
- Padrão: Page Object Model
- Contém:
  - Localizadores (By.CSS_SELECTOR)
  - Métodos de interação (clicar, preencher, obter_texto)
  - Waits do Selenium
  - Pattern: Fluent Interface (retorna self)

### 3. **Step Definitions** (`*_steps.py`)
- Localização: `features/steps/`
- Framework: Behave
- Contém:
  - Decoradores: @given, @when, @then
  - Importa os Page Objects
  - Implementa a lógica dos steps

### 4. **Environment** (`environment.py`)
- Localização: Raiz do projeto
- Contém:
  - Configuração do Selenium WebDriver
  - Hooks: before_all, after_all, before_scenario, after_scenario
  - Screenshots automáticos em falhas
  - Limpeza de cookies/storage

### 5. **Requirements** (`requirements.txt`)
- Localização: Raiz do projeto
- Dependências:
  - selenium==4.15.2
  - behave==1.2.6
  - webdriver-manager==4.0.1

### 6. **Configuração Behave** (`behave.ini`)
- Localização: Raiz do projeto
- Configurações de execução dos testes

### 7. **.gitignore**
- Localização: Raiz do projeto
- Ignora: __pycache__, screenshots, venv, etc.

## 🔗 Comunicação Entre Arquivos

### Page Objects → Steps
```python
# features/pages/login_page.py
class LoginPage:
    def preencher_usuario(self, texto):
        # ...código...
        return self

# features/steps/login_steps.py
from features.pages.login_page import LoginPage

@when('preencho o campo usuario com "{texto}"')
def step_preencher_usuario(context, texto):
    context.page.preencher_usuario(texto)
```

### Environment → Context → Steps
```python
# environment.py
def before_all(context):
    context.browser = webdriver.Chrome()
    context.base_url = "http://localhost:8080"

# features/steps/login_steps.py
@given('que estou na página de Login')
def step_abrir_pagina(context):
    context.page = LoginPage(context.browser)
    context.browser.get(context.base_url)
```

## 🚀 Como Executar

```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar todos os testes
behave

# Rodar feature específica
behave features/login.feature

# Rodar com formatação detalhada
behave --format=pretty

# Rodar cenário específico
behave features/login.feature:10
```

## ✨ Características

### Page Objects
- ✅ Localizadores centralizados
- ✅ Métodos reutilizáveis
- ✅ Waits explícitos
- ✅ Fluent interface (encadeamento)
- ✅ Documentação inline

### Steps
- ✅ Imports corretos dos Page Objects
- ✅ Steps genéricos e reutilizáveis
- ✅ Decoradores Behave (@given, @when, @then)
- ✅ Uso do context para compartilhar estado

### Environment
- ✅ Configuração centralizada do WebDriver
- ✅ Screenshots automáticos em falhas
- ✅ Limpeza de cookies/storage entre cenários
- ✅ Variável de ambiente para BASE_URL
- ✅ Hooks para todas as fases dos testes

## 📌 Importante

- Arquivos `__init__.py` são necessários para Python reconhecer as pastas como módulos
- `environment.py` deve estar na raiz do projeto
- `features/` é obrigatório para Behave
- Page Objects e Steps devem estar dentro de `features/`
- Screenshots salvos em pasta `screenshots/` (criada automaticamente)

## 🎯 Próximos Passos

1. Ajustar localizadores nos Page Objects (substituir seletores genéricos)
2. Configurar `BASE_URL` em `environment.py` ou variável de ambiente
3. Instalar dependências: `pip install -r requirements.txt`
4. Executar testes: `behave`

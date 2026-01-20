# Guia Rápido de Uso - Sistema Corrigido

## 🚀 Início Rápido

### 1. Carregar a Extensão
1. Abra `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `C:\Matheus\extensao_bdd_v1.0`

### 2. Gravar Interações
1. Clique no ícone da extensão
2. Informe o nome da Feature (ex: "Login no sistema")
3. Clique em "Iniciar Feature"
4. Informe o nome do Cenário (ex: "Login com sucesso")
5. Clique em "Iniciar Cenário"
6. **Interaja com a página normalmente**:
   - Clique em botões
   - Preencha campos
   - Selecione opções
   - Navegue entre páginas
7. Clique em "Finalizar Gravação"

### 3. Exportar Projeto
1. No painel, clique em "Exportar"
2. Marque as features desejadas
3. Clique em "Exportar Selecionados"
4. Os arquivos serão baixados automaticamente

### 4. Executar Testes

```bash
# Instalar dependências
pip install -r requirements.txt

# Executar todos os testes
behave

# Executar feature específica
behave features/login.feature

# Executar com relatório detalhado
behave --format=pretty --no-capture
```

## 📂 Estrutura Gerada

```
projeto_exportado/
├── features/
│   ├── login.feature          ← Arquivo Gherkin
│   ├── pages/
│   │   └── login_page.py      ← Page Object com seletores
│   └── steps/
│       └── login_steps.py     ← Steps Python
├── environment.py             ← Configuração Behave
├── requirements.txt           ← Dependências
└── README.md                  ← Instruções
```

## ✅ O Que Foi Corrigido

1. ✅ **Erro de carregamento**: Arquivo `__tmp` removido
2. ✅ **Steps genéricos**: Agora são gerados baseados nas interações reais
3. ✅ **Seletores vazios**: Extraídos corretamente das interações
4. ✅ **Estrutura**: Segue padrão Behave correto
5. ✅ **Correspondência**: Steps Gherkin ↔ Steps Python

## 🎯 Exemplo Prático

### Interações Capturadas:
1. Acessa `https://exemplo.com/login`
2. Preenche campo "Usuário" → `#username`
3. Preenche campo "Senha" → `#password`
4. Clica em "Entrar" → `button[type='submit']`

### Arquivo Gerado: `login.feature`
```gherkin
# language: pt
Funcionalidade: Login

  Cenário: Login com sucesso
    Given acessa a URL "https://exemplo.com/login"
    When preenche username com "usuario@teste.com"
    When preenche password com "senha123"
    Then clica no submit
```

### Arquivo Gerado: `features/pages/login_page.py`
```python
class LoginLocators:
    USERNAME = (By.CSS_SELECTOR, "#username")
    PASSWORD = (By.CSS_SELECTOR, "#password")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

class LoginPage:
    def preencher_username(self, texto):
        return self._fill_element(self.locators.USERNAME, texto)
    
    def preencher_password(self, texto):
        return self._fill_element(self.locators.PASSWORD, texto)
    
    def clicar_submit(self):
        return self._click_element(self.locators.SUBMIT)
```

### Arquivo Gerado: `features/steps/login_steps.py`
```python
@given('acessa a URL "{url}"')
def step_acessa_url(context, url):
    context.browser.get(url)
    context.page = LoginPage(context.browser)

@when('preenche username com "{texto}"')
def step_preenche_username(context, texto):
    context.page.preencher_username(texto)

@when('preenche password com "{texto}"')
def step_preenche_password(context, texto):
    context.page.preencher_password(texto)

@then('clica no submit')
def step_clica_submit(context):
    context.page.clicar_submit()
```

## 🎨 Boas Práticas Implementadas

- ✅ **Page Object Model**: Seletores e ações separados
- ✅ **Method Chaining**: Métodos retornam `self`
- ✅ **Esperas Explícitas**: `WebDriverWait` em todos os elementos
- ✅ **Tratamento de Erros**: Try/catch com mensagens descritivas
- ✅ **Código Limpo**: Docstrings, nomes semânticos, comentários

## 📞 Suporte

Em caso de problemas:
1. Verifique se o Chrome está atualizado
2. Verifique se as dependências foram instaladas (`pip install -r requirements.txt`)
3. Consulte `README.md` no projeto exportado
4. Verifique os logs no console da extensão

---

**Sistema 100% Funcional** ✅  
**Última Atualização**: 15/01/2026

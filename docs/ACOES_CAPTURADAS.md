# Ações Capturadas pelo Sistema

## ✅ Todas as Ações Agora Suportadas

### 1. **Cliques** 🖱️
**Evento:** `click`  
**Quando:** Usuário clica em qualquer elemento clicável  
**Elementos:** botões, links, divs clicáveis, etc.

**Interação capturada:**
```javascript
{
  acao: 'clica',
  nomeElemento: 'LOGIN',
  cssSelector: '#btn-login',
  xpath: '//button[@id="btn-login"]'
}
```

**Step gerado:**
```python
@when('clico no LOGIN')
def step_clicar_login(context):
    context.page.clicar_login()
```

---

### 2. **Preenchimento de Campos** ⌨️
**Evento:** `blur` (perda de foco)  
**Quando:** Usuário digita e sai do campo  
**Elementos:** input[text, email, password, tel, url, number], textarea

**Interação capturada:**
```javascript
{
  acao: 'preenche',
  nomeElemento: 'CPF/CNPJ',
  valorPreenchido: '094.712.945-68',
  cssSelector: '#cpf'
}
```

**Step gerado:**
```python
@when('preencho CPF/CNPJ com "{texto}"')
def step_preencher_cpf_cnpj(context, texto):
    context.page.preencher_cpf_cnpj(texto)
```

---

### 3. **Seleção em Dropdown** 📋
**Evento:** `change`  
**Quando:** Usuário seleciona opção em `<select>`  
**Elementos:** select, dropdown

**Interação capturada:**
```javascript
{
  acao: 'seleciona',
  nomeElemento: 'Estado',
  valorPreenchido: 'São Paulo',
  cssSelector: '#estado'
}
```

**Step gerado:**
```python
@when('seleciono "São Paulo" em Estado')
def step_selecionar_estado(context, valor):
    from selenium.webdriver.support.ui import Select
    elemento = context.page.wait.until(...)
    select = Select(elemento)
    select.select_by_visible_text(valor)
```

---

### 4. **Checkbox** ☑️
**Evento:** `change`  
**Quando:** Usuário marca/desmarca checkbox  
**Elementos:** input[type="checkbox"]

**Interação capturada:**
```javascript
{
  acao: 'marca_checkbox', // ou 'desmarca_checkbox'
  nomeElemento: 'Aceitar Termos',
  valorPreenchido: 'marcado',
  cssSelector: '#termos'
}
```

**Step gerado:**
```python
@when('marco o checkbox Aceitar Termos')
def step_marca_checkbox_aceitar_termos(context):
    elemento = context.page.wait.until(...)
    if not elemento.is_selected():
        elemento.click()
```

---

### 5. **Radio Button** 🔘
**Evento:** `change`  
**Quando:** Usuário seleciona radio button  
**Elementos:** input[type="radio"]

**Interação capturada:**
```javascript
{
  acao: 'seleciona_radio',
  nomeElemento: 'Tipo: Pessoa Física',
  valorPreenchido: 'PF',
  cssSelector: '#tipo-pf'
}
```

**Step gerado:**
```python
@when('seleciono o radio Tipo: Pessoa Física')
def step_selecionar_radio_tipo_pessoa_fisica(context):
    elemento = context.page.wait.until(...)
    if not elemento.is_selected():
        elemento.click()
```

---

### 6. **Upload de Arquivo** 📁
**Evento:** `change`  
**Quando:** Usuário seleciona arquivo para upload  
**Elementos:** input[type="file"]

**Interação capturada:**
```javascript
{
  acao: 'upload',
  nomeElemento: 'Anexar Documento',
  valorPreenchido: 'documento.pdf',
  cssSelector: '#arquivo'
}
```

**Step gerado:**
```python
@when('faço upload do arquivo "{caminho}"')
def step_upload_arquivo_anexar_documento(context, caminho):
    import os
    elemento = context.page.wait.until(...)
    caminho_absoluto = os.path.abspath(caminho)
    elemento.send_keys(caminho_absoluto)
```

---

### 7. **Pressionar Enter** ⏎
**Evento:** `keydown`  
**Quando:** Usuário pressiona Enter em campo (geralmente para submit)  
**Elementos:** qualquer elemento focável

**Interação capturada:**
```javascript
{
  acao: 'pressiona_enter',
  nomeElemento: 'Senha',
  valorPreenchido: 'Enter',
  keyPressed: 'Enter'
}
```

**Step gerado:**
```python
@when('pressiono Enter em Senha')
def step_pressionar_enter_senha(context):
    from selenium.webdriver.common.keys import Keys
    elemento = context.page.wait.until(...)
    elemento.send_keys(Keys.ENTER)
```

---

### 8. **Navegação (URL)** 🌐
**Eventos:** `popstate`, `hashchange`, `pushstate`, `replacestate`  
**Quando:** Usuário navega para outra página ou SPA muda URL  
**Elementos:** N/A (navegação do browser)

**Interação capturada:**
```javascript
{
  acao: 'acessa_url',
  nomeElemento: 'página',
  valorPreenchido: 'https://site.com/#/login',
  eventType: 'hashchange'
}
```

**Step gerado:**
```python
@given('acesso a URL "https://site.com/#/login"')
def step_acessar_url_especifica(context):
    context.browser.get("https://site.com/#/login")
    context.page = LoginPage(context.browser)
```

---

## 📊 Resumo: Eventos Monitorados

| Evento DOM | Ação Gerada | Elementos Afetados |
|------------|-------------|-------------------|
| `click` | `clica` | button, a, div[clickable] |
| `blur` | `preenche` | input[text/email/password/tel/url/number], textarea |
| `change` (select) | `seleciona` | select, dropdown |
| `change` (checkbox) | `marca_checkbox` / `desmarca_checkbox` | input[type="checkbox"] |
| `change` (radio) | `seleciona_radio` | input[type="radio"] |
| `change` (file) | `upload` | input[type="file"] |
| `keydown` (Enter) | `pressiona_enter` | qualquer elemento focável |
| `popstate` | `acessa_url` | navegação back/forward |
| `hashchange` | `acessa_url` | mudança de hash (#) |
| `pushstate` | `acessa_url` | navegação SPA (React, Vue, Angular) |
| `replacestate` | `acessa_url` | substituição de URL SPA |

---

## 🔧 Métodos Gerados no Page Object

Para cada elemento interagido, são gerados os seguintes métodos:

```python
class LoginPage:
    CPF_CNPJ = (By.CSS_SELECTOR, "#cpf")
    
    def clicar_cpf_cnpj(self):
        """Clica em CPF/CNPJ"""
        elemento = self.wait.until(EC.element_to_be_clickable(self.CPF_CNPJ))
        elemento.click()
        return self
    
    def preencher_cpf_cnpj(self, texto):
        """Preenche CPF/CNPJ com texto"""
        elemento = self.wait.until(EC.visibility_of_element_located(self.CPF_CNPJ))
        elemento.clear()
        elemento.send_keys(texto)
        return self
    
    def selecionar_cpf_cnpj(self, valor):
        """Seleciona opção (se for dropdown)"""
        from selenium.webdriver.support.ui import Select
        elemento = self.wait.until(EC.presence_of_element_located(self.CPF_CNPJ))
        select = Select(elemento)
        select.select_by_visible_text(valor)
        return self
    
    def marcar_cpf_cnpj(self):
        """Marca checkbox (se for checkbox)"""
        elemento = self.wait.until(EC.element_to_be_clickable(self.CPF_CNPJ))
        if not elemento.is_selected():
            elemento.click()
        return self
    
    def desmarcar_cpf_cnpj(self):
        """Desmarca checkbox (se for checkbox)"""
        elemento = self.wait.until(EC.element_to_be_clickable(self.CPF_CNPJ))
        if elemento.is_selected():
            elemento.click()
        return self
    
    def obter_texto_cpf_cnpj(self):
        """Obtém texto de CPF/CNPJ"""
        elemento = self.wait.until(EC.visibility_of_element_located(self.CPF_CNPJ))
        return elemento.text
    
    def elemento_visivel_cpf_cnpj(self):
        """Verifica se CPF/CNPJ está visível"""
        try:
            elemento = self.wait.until(EC.visibility_of_element_located(self.CPF_CNPJ))
            return True
        except:
            return False
```

---

## 🎯 Fluxo Completo de Captura

1. **Usuário interage com página**
   - Clica, digita, seleciona, navega, etc.

2. **Event Listener captura a ação**
   - `handleClickEvent`, `handleBlurEvent`, `handleChangeEvent`, etc.

3. **Seletores são gerados**
   - CSS Selector e XPath robustos
   - Validação e otimização automática

4. **Interação é armazenada**
   ```javascript
   window.interactions.push({
     acao: 'preenche',
     nomeElemento: 'Email',
     valorPreenchido: 'user@example.com',
     cssSelector: '#email',
     xpath: '//input[@id="email"]'
   });
   ```

5. **Steps BDD são ajustados**
   - Primeiro = `Given`
   - Intermediários = `When`
   - Último = `Then`

6. **Exportação gera arquivos Python**
   - `.feature` (Gherkin)
   - `*_page.py` (Page Objects)
   - `*_steps.py` (Step Definitions)
   - `environment.py` (Config)

---

## 🚀 Build

```
✅ webpack 5.99.9 compiled successfully
📦 Bundle: 221 KiB (+6 KiB)
⚠️ Erros: 0
```

## ✅ Conclusão

**SIM, o sistema agora está configurado para gerar steps para QUALQUER ação executada pelo usuário!**

Todas as interações relevantes são capturadas:
- ✅ Cliques
- ✅ Digitação
- ✅ Seleção (dropdown)
- ✅ Checkbox
- ✅ Radio button
- ✅ Upload
- ✅ Tecla Enter
- ✅ Navegação (URL)

E cada uma gera:
- ✅ Localizadores corretos (CSS + XPath)
- ✅ Page Objects com métodos funcionais
- ✅ Steps implementados (não mais `pass`)
- ✅ Código Python executável

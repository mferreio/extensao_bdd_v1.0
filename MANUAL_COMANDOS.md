# 🛠️ Guia de Comandos do Projeto (BDD Generator Extension)

Este documento lista todos os comandos necessários para desenvolver, compilar e distribuir a extensão.

## 📋 Pré-requisitos

Certifique-se de ter instalado:
*   [Node.js](https://nodejs.org/) (inclui npm)
*   [PowerShell](https://learn.microsoft.com/pt-br/powershell/) (para scripts de empacotamento no Windows)

## 🚀 1. Configuração Inicial

Antes de começar, instale as dependências do projeto:

```bash
npm install
```

Isso baixará o Webpack e outras ferramentas necessárias listadas no `package.json`.

---

## 🔨 2. Compilação (Build)

Sempre que alterar arquivos JS na pasta `src` (exceto `manifest.json`, `styles`, ou arquivos estáticos puros que não passam pelo Webpack), você precisa recompilar.

**Comando:**
```bash
npm run build
```

**O que ele faz:**
*   Processa os arquivos de entrada (definidos no `webpack.config.js`).
*   Gera os arquivos otimizados na pasta `dist/` (ex: `bundle.js`, `options.js`, `background.js`, `export-bridge.js`).

---

## 📦 3. Empacotar para Distribuição / Loja

Para gerar o arquivo `.zip` final para enviar para a Chrome Web Store ou compartilhar com outros dsevolvedores/usuários.

**Comando (PowerShell):**
```powershell
.\pack_extension.ps1
```
*Se houver erro de permissão, execute:* `powershell -ExecutionPolicy Bypass -File pack_extension.ps1`

**O que ele faz:**
1.  Limpa a pasta `release/` (se existir).
2.  Copia apenas os arquivos necessários (`manifest.json`, `src/`, `dist/`, `icons/`, `styles/`, etc.) para `release/`.
3.  Ignora arquivos de desenvolvimento (`node_modules`, `.git`, arquivos `.crx`, etc.).
4.  Gera um arquivo **`GherkinGenerator_Distribuicao.zip`** na raiz do projeto.

---

## 🛒 4. Publicar na Chrome Web Store

1.  Execute o comando de **Build**:
    ```bash
    npm run build
    ```
2.  Execute o comando de **Empacotamento**:
    ```powershell
    .\pack_extension.ps1
    ```
3.  Acesse o [Painel do Desenvolvedor da Chrome Web Store](https://chrome.google.com/webstore/developer/dashboard).
4.  Faça upload do arquivo **`GherkinGenerator_Distribuicao.zip`** gerado.

---

## 🧪 5. Como Testar Localmente (Modo Desenvolvedor)

Para testar suas alterações no Chrome sem precisar gerar um ZIP:

1.  Execute `npm run build` para garantir que o código está atualizado.
2.  Abra o Chrome e vá para `chrome://extensions/`.
3.  Ative o **"Modo do desenvolvedor"** (canto superior direito).
4.  Clique em **"Carregar sem compactação"** (Load Unpacked).
5.  Selecione a pasta raiz do projeto (`c:\Matheus\extensao_bdd_v1.4`).
6.  **Importante:** Sempre que você mudar o código e recompilar (`build`), volte nessa tela e clique no ícone de atualização (🔄) no card da extensão.

---

## 🔢 6. Atualizando a Versão

Sempre que for enviar uma nova versão para a loja, você **PRECISA** atualizar o número da versão, senão a loja rejeita.

1.  Abra o arquivo `manifest.json`.
2.  Altere o campo `"version"` (ex: de `"1.2.0"` para `"1.2.1"`).
3.  Salve o arquivo.
4.  Faça o Build e Empacotamento novamente.

---

## 📂 Estrutura Importante

*   `src/`: Código fonte (Javascript, CSS). Onde você trabalha.
*   `dist/`: Código compilado pelo Webpack. **Não edite aqui**.
*   `manifest.json`: Configuração principal da extensão.
*   `pack_extension.ps1`: Script que monta o ZIP final.

---

## 🚑 Troubleshooting (Solução de Problemas)

*   **Erro "Manifest is not valid"**: Verifique se a sintaxe do `manifest.json` está correta (vírgulas, aspas).
*   **Alteração não aparece**: Esqueceu de rodar `npm run build` ou de clicar em "Atualizar" no `chrome://extensions`.
*   **Erro no PowerShell**: Se o script não rodar, use o comando com bypass:
    `powershell -ExecutionPolicy Bypass -File pack_extension.ps1`

---

## 🔄 Resumo do Fluxo de Trabalho

1.  **Desenvolver**: Edite os arquivos `.js`, `.css`, etc.
2.  **Compilar**: `npm run build`
3.  **Testar**: Recarregue a extensão no navegador (`chrome://extensions/`) pelo botão de atualizar.
4.  **Versionar**: Atualize o `manifest.json`.
5.  **Finalizar**: `.\pack_extension.ps1` para gerar o zip final.

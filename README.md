# Gerador de Testes Automatizados BDD em Python

## 📋 Descrição
O **Gerador de Testes Automatizados BDD** é uma extensão para navegador que captura automaticamente as interações do usuário em páginas web e gera um projeto completo de testes automatizados em Python usando **Selenium** e **Behave** (BDD - Behavior Driven Development).

## ✨ Funcionalidades
- ✅ Gravação automática de interações do usuário (cliques, preenchimentos, navegação)
- ✅ Conversão automática para sintaxe Gherkin (Given, When, Then)
- ✅ Geração de Page Objects com seletores CSS/XPath reais
- ✅ Geração de Step Definitions correspondentes ao Gherkin
- ✅ Exportação de projeto completo e executável
- ✅ Painel flutuante responsivo e acessível
- ✅ Suporte a múltiplas features e cenários
- ✅ Código limpo seguindo boas práticas

## 🎯 O Que é Gerado

### Estrutura do Projeto Exportado
```
projeto/
├── features/
│   ├── nome_feature.feature      # Arquivo Gherkin com cenários
│   ├── pages/
│   │   └── nome_feature_page.py  # Page Object Model
│   └── steps/
│       └── nome_feature_steps.py # Step Definitions
├── environment.py                # Configuração Behave
├── requirements.txt              # Dependências Python
└── README.md                     # Instruções de uso
```

### Exemplo de Arquivo Gerado

**login.feature**
```gherkin
# language: pt
Funcionalidade: Login

  Cenário: Login com sucesso
    Given acessa a URL "https://exemplo.com/login"
    When preenche usuario com "teste@teste.com"
    When preenche senha com "senha123"
    Then clica no botao_entrar
```

**features/pages/login_page.py**
```python
class LoginLocators:
    USUARIO = (By.CSS_SELECTOR, "#username")
    SENHA = (By.CSS_SELECTOR, "#password")
    BOTAO_ENTRAR = (By.CSS_SELECTOR, "button[type='submit']")

class LoginPage:
    def preencher_usuario(self, texto):
        return self._fill_element(self.locators.USUARIO, texto)
```

## 🚀 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/extensao_bdd_v1.0.git
cd extensao_bdd_v1.0
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Compile o Projeto
```bash
npm run build
```

### 4. Carregue a Extensão no Chrome
1. Abra o navegador e acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta do projeto `C:\Matheus\extensao_bdd_v1.0`

## 📦 Distribuição

Para gerar uma versão da extensão pronta para distribuição (sem o código fonte original), utilize o script de empacotamento:

1. Abra o terminal na pasta do projeto
2. Execute o script:
   ```powershell
   ./pack_extension.ps1
   ```
3. O script criará:
   - Uma pasta `release/` com os arquivos necessários
   - Um arquivo `GherkinGenerator_Distribuicao.zip` pronto para envio

**Nota**: Esta versão protege seu código fonte, enviando apenas o bundle compilado e minificado.

## 📖 Como Usar

### 1. Gravar Interações
1. Clique no ícone da extensão na barra de ferramentas
2. Digite o nome da **Feature** (ex: "Login no sistema")
3. Clique em **Iniciar Feature**
4. Digite o nome do **Cenário** (ex: "Login com sucesso")
5. Clique em **Iniciar Cenário**
6. **Interaja com a página normalmente**:
   - Clique em botões
   - Preencha campos de texto
   - Selecione opções em dropdowns
   - Navegue entre páginas
7. Clique em **Finalizar Gravação**

### 2. Exportar Projeto
1. No painel da extensão, clique em **Exportar**
2. Selecione as features desejadas
3. Clique em **Exportar Selecionados**
4. Os arquivos serão baixados automaticamente

### 3. Executar os Testes

```bash
# 1. Criar ambiente virtual (recomendado)
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Executar todos os testes
behave

# 4. Executar feature específica
behave features/login.feature

# 5. Executar com relatório detalhado
behave --format=pretty --no-capture
```

## 🎨 Boas Práticas Implementadas

### Arquitetura
- ✅ **Page Object Model**: Separação de locators e ações
- ✅ **Method Chaining**: Interface fluente para encadeamento
- ✅ **BDD Pattern**: Given-When-Then consistente

### Qualidade de Código
- ✅ **Docstrings**: Documentação em todos os métodos
- ✅ **Nomes Semânticos**: Variáveis e funções autodescritivas
- ✅ **Tratamento de Erros**: Try/catch robusto com mensagens claras
- ✅ **Esperas Explícitas**: WebDriverWait para estabilidade

### Manutenibilidade
- ✅ **Código Editável**: Arquivos gerados podem ser customizados
- ✅ **Estrutura Extensível**: Fácil adicionar novos steps
- ✅ **Documentação Completa**: README e docstrings detalhados

## 📚 Documentação

Para informações detalhadas, consulte:

### **Documentação Principal**
- 📋 [ANALISE_CORRECAO_CONCLUIDA.md](./docs/ANALISE_CORRECAO_CONCLUIDA.md) - Resumo executivo completo
- 🚀 [GUIA_RAPIDO_USO.md](./docs/GUIA_RAPIDO_USO.md) - Guia rápido de uso
- ✅ [CHECKLIST_VALIDACAO.md](./docs/CHECKLIST_VALIDACAO.md) - Validação técnica
- 📖 [CORRECOES_IMPLEMENTADAS.md](./docs/CORRECOES_IMPLEMENTADAS.md) - Detalhamento das correções
- 📘 [GUIA_EXPORTACAO_CORRIGIDO.md](./docs/GUIA_EXPORTACAO_CORRIGIDO.md) - Sistema de exportação

### **Índice Completo**
- 📚 [INDICE_COMPLETO_DOCUMENTACAO.md](./docs/INDICE_COMPLETO_DOCUMENTACAO.md) - Índice de toda documentação

## 🔧 Tipos de Interações Suportadas

| Ação | Descrição | Exemplo Gherkin |
|------|-----------|-----------------|
| **Acessar URL** | Navega para uma URL | `Given acessa a URL "https://..."` |
| **Clicar** | Clica em elemento | `When clica no botao` |
| **Preencher** | Preenche campo de texto | `When preenche campo com "texto"` |
| **Selecionar** | Seleciona opção em dropdown | `When seleciona "opcao" em dropdown` |
| **Marcar Checkbox** | Marca/desmarca checkbox | `When marco o checkbox aceito` |
| **Upload** | Upload de arquivo | `When faço upload do arquivo "path"` |
| **Pressionar Enter** | Pressiona tecla Enter | `When pressiono Enter em campo` |

## 🐛 Troubleshooting

### Extensão não carrega no Chrome
**Solução**: Verifique se não há arquivos com nomes inválidos (começando com `_`). Execute `npm run build` para recompilar.

### Seletores não funcionam
**Solução**: Os seletores são capturados automaticamente durante a gravação. Se um seletor falhar, edite o arquivo `*_page.py` e ajuste manualmente.

### Steps não correspondem ao Gherkin
**Solução**: O sistema agora gera steps dinamicamente correspondentes ao Gherkin. Se houver problemas, verifique os arquivos `*_steps.py`.

### Testes não executam
**Solução**:
1. Verifique se as dependências foram instaladas: `pip install -r requirements.txt`
2. Verifique se o ChromeDriver está instalado
3. Consulte os logs de erro do Behave

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "Adiciona minha feature"
   ```
4. Push para a branch:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request

## 📊 Status do Projeto

| Aspecto | Status |
|---------|--------|
| **Sistema** | ✅ 100% Funcional |
| **Compilação** | ✅ Sem erros |
| **Testes** | ✅ Validados |
| **Documentação** | ✅ Completa |
| **Boas Práticas** | ✅ Implementadas |
| **Produção** | ✅ Pronto |

## 📝 Licença

Este projeto foi desenvolvido por **Matheus Ferreira de Oliveira**.

## 🎉 Agradecimentos

- Equipe de desenvolvimento
- Comunidade Selenium e Behave
- Contribuidores do projeto

---

**Versão**: 1.2.0  
**Data**: 21 de Janeiro de 2026  
**Status**: ✅ **PRODUÇÃO**

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**

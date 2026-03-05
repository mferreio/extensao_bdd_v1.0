---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #f4f7f6
color: #333
---

# 🚀 BDD_PyTech Enterprise
## Automação E2E Low-Code para Scale-Ups e Enterprises
### Simplificando Testes Inteligentes

---

# 🎯 O Problema da Automação Tradicional

- **Curva de Aprendizado Alta:** O time gasta mais tempo aprendendo frameworks (Cypress, Playwright, Selenium) do que testando a aplicação de fato.
- **Manutenção Constante:** O XPath quebra? A classe Page Object precisa ser reescrita na mão do zero? Isso leva horas.
- **Escalabilidade "Zero":** Sem engenharia sólida, os projetos de automação tendem a virar "God Steps" massivos, lentos e repetitivos.
- **Silos de Conhecimento:** QAs seniores são o gargalo. Se o dev Front-end não entende Selenium, a pipeline inteira trava.

---

# 💡 Nossa Solução

Uma Extensão No-Code de Navegador que injeta **Inteligência** na gravação:

1. **Gravação Transparente e Orgânica:**
   - Faça seu teste navegando. A ferramenta rastreia e converte ações reais em passos Gherkin profissionais.
   - Pula elementos "mortos". Captura inputs valiosos (seletores visíveis e XPath complexos).
   
2. **"Dry-Run" Nativo (Em tempo real):**
   - Antes de exportar uma única linha de código, o *motor de Replay Interno* refaz todo o fluxo na página web validando se os seus elementos ainda existem (Spotlight Tracker).

---

# 🏗️ O Poder do Page Object Model (POM)

Muitos gravadores exportam um roteiro frágil "Step-by-Step" misturando Seletores com Lógica. **Nós resolvemos isso!**

No momento de "Exportação Completa", o **BDD Test Engine** decompila o seu fluxo visual e divide tudo estruturalmente nas pastas corretas de um Projeto Real:

* `features/` → Sintaxe do Gherkin Limpa
* `steps/` → Cola que liga os comportamentos do Cucumber nas páginas.
* `pages/` → **Cria a Classe de Página!** Extrai os Locators como propriedades e cria os métodos *Fluentes* reutilizáveis (Clean Code).

---

# 🌐 Ecossistema Multi-Framework (Você no Comando)

Não te obrigamos a usar UMA única linguagem. Sua empresa cresceu e migrou do legadão pro mais moderno? Nossa ferramenta te atende na Exportação em 3 ecossistemas:

1. **🐍 Python + Behave (Selenium):** Para backend clássico, robustez extrema, *expected_conditions*. (Gera BasePage nativo que suporta Timeout).
2. **🟩 Node + Cypress:** Testes reativos para frontends geniais (Javascript). Exportação fluente com `cy.get().type()`.
3. **🎭 Node + Playwright (Microsoft):** Paralelização brutal com suporte à XPath nativo e métodos estritamente assíncronos (`async await page.locator()`).

---

# 🛡️ Utilitários de Resiliência
Construir automação corporativa não é dar cliques básicos. Injetamos **ferramentas vitais no Editor de Passos**.

---

# ⚡ Utilitários Avançados: Performance Audit

- **Auditoria de Performance (Lighthouse):** Não basta funcionar, tem que ser rápido! Selecione um passo estratégico e marque com (⚡). Defina a nota mínima e o sistema injetará automaticamente o código para avaliar Core Web Vitals no seu fluxo de CI/CD.

---

# ⚙️ Editor Refinado & Validação de Seletores

A maior causa de "Testes Flaky" está na quebra de identificadores na tela (como ids dinâmicos de Single Page Applications React / Angular).
Nossa ferramenta combate nativamente a fragilidade:

- O Editor exibe os *5 Melhores Locators* sugeridos para o elemento clicado.
- Adicione um **XPath Customizado In-Line** ao vivo.
- Clique em Testar Elemento (👁️). Se ele piscar e ficar verde na tela principal do seu monitor, a prova final está batida: O script rodará perfeito em QA e Produção.

---

# ✨ Resumo dos Entregáveis do ZIP Exportado

O zip baixado no seu PC não é um script jogado. Ele é o repositório E2E inteiro pronto para pipeline:

✅ **Dependencies Management:** Gera `package.json` (Playwright/Cypress) ou `requirements.txt` (Python).
✅ **Configurations:** Gera `playwright.config.js` e setups de ambiente paralelos (CI mode flags).
✅ **Continuous Execution (C.I.):** Se baixar hoje, pode commitar agora mesmo no Github Actions que tem tudo que o agente necessita para startar seus relatórios Allure ou HTML.

---

# 🚀 Inicie a Transformação na Qualidade!

Chegou a hora de parar de reescrever testes toda sprint.

### **Escalabilidade • Clean Code • Confiabilidade**

*A Extensão BDD_PyTech é a ponte entre o QA Manual Inteligente e a Engenharia de Automação Automatizada.*

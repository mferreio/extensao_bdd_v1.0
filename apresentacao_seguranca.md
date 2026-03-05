---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
color: #1e293b
size: 16:9
style: |
  section {
    padding: 70px 80px;
    font-size: 26px;
  }
  h1 {
    color: #0f766e;
    font-size: 2.1em;
    margin-bottom: 0.1em;
  }
  h2 {
    color: #115e59;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    font-size: 1.3em;
  }
  h3 {
    color: #0f172a;
    font-size: 1.1em;
  }
  p, li {
    line-height: 1.4;
  }
  strong {
    color: #047857;
  }
  .highlight {
    background-color: #d1fae5;
    padding: 0 5px;
    border-radius: 4px;
  }
---

# 🔒 Segurança e Conformidade na Automação
## BDD_PyTech: Projetado para Privacidade e LGPD
### Automação Inteligente Sem Sacrificar a Segurança de Dados

---

# ⚠️ O Dilema de Segurança em Quality Assurance (QA)

À medida que empresas adotam novas ferramentas para acelerar testes E2E (End-to-End), novos vetores de risco surgem para as equipes de Segurança da Informação (InfoSec):

1. **Ferramentas Baseadas em Nuvem (Cloud-Based):** Muitas gravam a tela do usuário ou sincronizam fluxos e dados preenchidos com servidores externos.
2. **"AI-Powered Testing":** Plataformas recentes que enviam o DOM (HTML) e dados corporativos sensíveis para APIs de Inteligência Artificial processarem os testes.
3. **Uso de Dados Reais em Dev/QA:** O hábito perigoso de usar backups de produção com dados reais de clientes (PII) para conseguir rodar testes automatizados sem fricção.

---

# 🛡️ Nossa Abordagem: Zero Trust & Zero Cloud

O **BDD_PyTech** foi arquitetado sob o princípio de "Secure by Design". Nós resolvemos o gargalo da automação sem expor a empresa a riscos de conformidade:

- **100% Execução Local (Client-Side):** A extensão roda **exclusivamente no navegador do engenheiro**. Não existe servidor intermediário. Não existe "Login na Nuvem".
- **Sem Telemetria Oculta:** O que é gravado no seu browser, fica no seu browser.
- **Isolamento de Domínio (Air-gapped friendly):** Pode ser usado em ambientes de rede estritamente fechados (Intranets) de bancos e instituições governamentais de alta segurança.

---

# 🚫 Nenhuma IA Invasiva ou Análise Externa

Enquanto o mercado adota LLMs (Large Language Models) de forma indiscriminada, nós optamos por uma engenharia algorítmica robusta de extração de DOM sem IA.

**O que isso significa na prática?**
Quando seu QA grava um fluxo de "Pagamento de Fatura" na Intranet:

- **Ferramentas Concorrentes:** Enviam a tela ou o código-fonte HTML do botão para o ChatGPT/OpenAI "entender" e tentar gerar um Locator mágico.
- **BDD_PyTech:** Nosso motor interno embarcado *Node-Tree Analyzer* lê a árvore DOM localmente, extrai o XPath em milissegundos e salva na memória RAM do próprio computador. **Nenhum byte cruza seu firewall corporativo.**

---

# ⚖️ Conformidade Total com a LGPD e GDPR

A principal infração de conformidade em times de Engenharia é o vazamento secundário de PII (Personally Identifiable Information) em relatórios de teste.

**A Solução Embarcada:** Código gerado 100% local

Todo o processamento ocorre no navegador do engenheiro, sem envio de dados a servidores externos:
- O QA grava o fluxo normalmente e os dados preenchidos ficam armazenados **exclusivamente na memória local** do navegador.
- Os arquivos `.feature` (Gherkin) exportados podem ser revisados e sanitizados antes de serem commitados no repositório Git. Testes limpos passíveis de auditoria.

---

# 🔐 Arquitetura de "Saída Limpa" (Clean Output)

O formato "Low-Code" não escraviza sua empresa em um painel escuro online SaaS (onde você não sabe como o dado é armazenado).

**Nobreza Tecnológica:** 
O artefato de saída final da nossa ferramenta é estritamente um arquivo de texto `.zip` contendo código (Python ou Playwright).
- O time de *Application Security (AppSec)* e o *SonarQube* podem varrer esse código antes do deploy. 
- O código .zip exportado pode e deve ser armazenado exclusivamente no seu cofre de repositório GIT privado (Gitlab/Bitbucket interno).

---

# ✅ Resumo para a Área de InfoSec:

| Risco Comum de Mercado | Solução mitigadora BDD_PyTech | Risco Residual |
| :--- | :--- | :--- |
| **Exfiltração via Nuvem** | Arquitetura 100% Local / Browser-based. | **Mitigado** |
| **Interceptação por IA** | Lógica de DOM puramente Algorítmica off-line. | **Mitigado** |
| **Violação de PII (LGPD/GDPR)** | Processamento 100% local, sem trânsito de dados sensíveis para servidores externos. | **Mitigado** |
| **Vazamento de Métricas Sensíveis** | Auditoria Lighthouse (Performance) roda 100% no runner local do CI, sem expor notas a dashboards externos SaaS. | **Mitigado** |
| **Vendor Lock-in Obfuscado** | Exportação de dependências Open-Source e código aberto. | **Nenhum** |

> *"Velocidade no Front-End, Auditoria Granular e Controle Absoluto no Backstage."*

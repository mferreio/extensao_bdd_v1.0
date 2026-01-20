# 🔬 QA Testing Plan - v1.1.0

**Objetivo:** Validar que todas as features de Phase 1-3 funcionam corretamente  
**Escopo:** Funcional, Acessibilidade, Mobile, Performance  
**Target:** 0 bugs antes de release  

---

## 📋 Pré-requisitos

### Ferramentas Necessárias
- ✅ Chrome (versão 90+) - Navegador base
- ✅ Chrome DevTools (F12)
- ✅ Axe DevTools (extensão Chrome)
- ✅ Lighthouse (já em DevTools)
- ✅ NVDA (Windows) ou VoiceOver (Mac) - Screen reader
- 📱 Device emulation (Chrome DevTools)

### Preparação
```bash
cd c:\Matheus\extensao_bdd_v1.0
npm run build        # Compilar com webpack
# Resultado esperado: 174 KiB, 0 erros
```

### Carregar Extensão
1. Chrome → `chrome://extensions/`
2. Ativar "Developer mode" (canto superior direito)
3. "Load unpacked" → selecionar `c:\Matheus\extensao_bdd_v1.0`
4. Abrir qualquer página (ex: https://example.com)

---

## ✅ Testes Funcionais

### Teste 1: Dark Mode Toggle ⭐ CRÍTICO

**Objetivo:** Validar que dark mode funciona com persistência

**Passos:**
1. Carregar extensão em página qualquer
2. Procurar botão flutuante **🌙** no canto inferior direito
3. **Visual esperado:**
   - Fundo branco, texto preto (light mode)
   - Botão redondo 44x44px com emoji 🌙
   - Posição: bottom-right (20px margin)
   - Box-shadow visível

**Ação - Clique 1:**
```
Clicar no botão 🌙
```
**Resultado esperado:**
- ✅ Painel Gherkin muda para dark mode (fundo escuro #1a1a1a)
- ✅ Texto muda para claro (#e0e0e0)
- ✅ Botão muda para ☀️ (emoji inverte)
- ✅ Transição suave (~300ms)
- ✅ Sem piscar ou flicker
- ✅ Cores seguem paleta dark:
  - Primary: #4a9eff (azul claro)
  - Success: #4caf50 (verde)
  - Danger: #f44336 (vermelho)
  - Background: #1a1a1a (quase preto)

**Ação - Clique 2:**
```
Clicar no botão ☀️ novamente
```
**Resultado esperado:**
- ✅ Volta para light mode original
- ✅ Botão volta para 🌙

**Ação - Reload:**
```
F5 ou Ctrl+R para recarregar página
```
**Resultado esperado:**
- ✅ Tema anterior persiste (localStorage)
- ✅ Se era dark mode, permanece dark
- ✅ Se era light mode, permanece light

**DevTools Validação:**
```javascript
// Console F12
console.log(localStorage.getItem('gherkin-theme'));
// Esperado: "light" ou "dark"

console.log(document.documentElement.getAttribute('data-theme'));
// Esperado: "light" ou "dark"

// Verificar CSS variables
console.log(getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'));
// Light: " #FFFFFF"
// Dark: " #1a1a1a"
```

**Critério de Sucesso:** ✅ Todas as ações acima funcionam sem erros

---

### Teste 2: Notificações (Toast) ⭐ CRÍTICO

**Objetivo:** Validar que notificações aparecem, desaparecem e têm acessibilidade

**Pré-requisito:** Estar em light mode para visibilidade

**Passos:**
1. Abrir Chrome DevTools Console (F12)
2. Executar cada comando abaixo:

**Teste 2.1 - Success Notification**
```javascript
const notif = window.getNotificationManager?.();
if (!notif) {
  // Tentar importação manual
  import('./src/components/notifications.js').then(m => {
    m.getNotificationManager().success('✅ Tudo certo!');
  });
} else {
  notif.success('✅ Tudo certo!');
}
```
**Resultado esperado:**
- ✅ Toast aparece no topo (slide-in from right)
- ✅ Cor de fundo: #d4edda (verde claro)
- ✅ Texto: preto ou escuro
- ✅ Ícone verde (SVG checkmark) à esquerda
- ✅ Fechar (X) à direita
- ✅ Auto-dismiss em ~4 segundos (suave)
- ✅ ARIA: role="alert" no HTML

**Teste 2.2 - Error Notification**
```javascript
notif.error('❌ Erro ao processar');
```
**Resultado esperado:**
- ✅ Toast com fundo: #f8d7da (vermelho claro)
- ✅ Ícone vermelho (SVG X)
- ✅ Resto idêntico ao sucesso

**Teste 2.3 - Warning Notification**
```javascript
notif.warning('⚠️ Atenção!');
```
**Resultado esperado:**
- ✅ Toast com fundo: #fff3cd (amarelo claro)
- ✅ Ícone laranja (SVG exclamação)

**Teste 2.4 - Info Notification**
```javascript
notif.info('ℹ️ Informação');
```
**Resultado esperado:**
- ✅ Toast com fundo: #d1ecf1 (azul claro)
- ✅ Ícone azul (SVG info)

**Teste 2.5 - Manual Close**
```javascript
notif.success('Feche-me em 1s');
// Clique no X antes de 4 segundos
```
**Resultado esperado:**
- ✅ Clique no X remove toast imediatamente
- ✅ Animação suave de saída (fade-out)

**Critério de Sucesso:** ✅ Todas as notificações funcionam com cores/ícones corretos

---

### Teste 3: Validação de Formulário ⭐ CRÍTICO

**Objetivo:** Validar input validation em tempo real

**Passos:**
1. Console: Criar input validado
```javascript
const FormValidator = window.FormValidator || (await import('./src/components/form-validation.js')).default;

const { container, input } = FormValidator.createValidatedInput({
  placeholder: 'Digite seu nome',
  validate: (value) => value.length > 0,
  errorMessage: 'Nome é obrigatório',
  label: 'Nome',
  required: true
});

document.body.insertBefore(container, document.body.firstChild);
```

**Teste 3.1 - Input Vazio**
```
Input está vazio
```
**Resultado esperado:**
- ✅ Border: vermelha (#DC3545)
- ✅ Indicador: ✕ (SVG X vermelho)
- ✅ Mensagem de erro visível abaixo
- ✅ aria-invalid="true" no input

**Teste 3.2 - Typing**
```
Digitar: "João Silva"
```
**Resultado esperado:**
- ✅ Assim que digita primeiro caractere, border fica verde (#28A745)
- ✅ Indicador muda para ✓ (SVG check verde)
- ✅ Mensagem de erro desaparece
- ✅ aria-invalid="false" no input

**Teste 3.3 - Clear**
```
Apagar o texto novamente
```
**Resultado esperado:**
- ✅ Volta para estado vazio
- ✅ Border vermelha, indicador X, erro visível

**Critério de Sucesso:** ✅ Validação em tempo real funciona sem lag

---

### Teste 4: Diálogos de Confirmação

**Objetivo:** Validar ConfirmDialog com acessibilidade

**Passos:**
```javascript
const ConfirmDialog = window.ConfirmDialog || (await import('./src/components/confirm-dialog.js')).default;

const dialog = new ConfirmDialog({
  title: 'Confirmar ação',
  message: 'Tem certeza que deseja continuar?',
  confirmText: 'Sim, continuar',
  cancelText: 'Não, voltar',
  onConfirm: () => console.log('Confirmado!'),
  onCancel: () => console.log('Cancelado!')
});

dialog.show();
```

**Teste 4.1 - Visual**
```
Modal deve aparecer
```
**Resultado esperado:**
- ✅ Modal com overlay escuro (semi-transparente)
- ✅ Centralizado na tela
- ✅ Título, mensagem, dois botões
- ✅ Botão "Sim" em azul (#0D47A1)
- ✅ Botão "Não" em cinza

**Teste 4.2 - Click Confirmar**
```
Clicar "Sim, continuar"
```
**Resultado esperado:**
- ✅ Console: "Confirmado!"
- ✅ Dialog fecha suavemente

**Teste 4.3 - Click Cancelar**
```
Clicar modal novamente, clicar "Não, voltar"
```
**Resultado esperado:**
- ✅ Console: "Cancelado!"
- ✅ Dialog fecha

**Teste 4.4 - Escape**
```
Clicar modal novamente, pressionar ESC
```
**Resultado esperado:**
- ✅ Dialog fecha
- ✅ onCancel() é chamado

**Teste 4.5 - Keyboard (Tab)**
```
Clicar modal novamente, Tab até "Sim", Enter
```
**Resultado esperado:**
- ✅ Focus visível (outline) no botão
- ✅ Tab circula entre botões
- ✅ Enter ativa botão focused

**Critério de Sucesso:** ✅ Dialog acessível com keyboard + mouse

---

### Teste 5: State Management (Undo/Redo)

**Objetivo:** Validar Store com persistência

**Passos:**
```javascript
const store = window.gherkinStore || (await import('./src/state/store.js')).getStore();

// Limpar estado anterior
store.setState({ features: [], currentFeature: null });

// Feature 1
store.startFeature('Login User');
store.startScenario('Valid Credentials');
store.addInteraction({ type: 'click', selector: 'input[name="email"]' });
store.addInteraction({ type: 'type', value: 'test@example.com' });
store.finishScenario();
store.finishFeature();

console.log(store.getState());
```

**Teste 5.1 - Estado**
```javascript
// Verificar que feature foi criada
const state = store.getState();
console.log(state.features.length); // Esperado: 1
console.log(state.features[0].name); // Esperado: "Login User"
console.log(state.features[0].scenarios[0].interactions.length); // Esperado: 2
```

**Resultado esperado:**
- ✅ Feature criada com nome correto
- ✅ Cenário criado
- ✅ Interações adicionadas

**Teste 5.2 - Undo**
```javascript
store.undo();
console.log(store.getState().features.length); // Esperado: 0
```

**Resultado esperado:**
- ✅ Feature desapareceu (undo removeu último estado)

**Teste 5.3 - Redo**
```javascript
store.redo();
console.log(store.getState().features.length); // Esperado: 1
```

**Resultado esperado:**
- ✅ Feature voltou (redo restaurou estado)

**Teste 5.4 - Persistência (localStorage)**
```javascript
// Recarregar página (F5)
// Após reload:
const store = window.gherkinStore;
console.log(store.getState().features.length); // Esperado: 1
```

**Resultado esperado:**
- ✅ Após F5, estado persiste em localStorage
- ✅ Features continuam lá

**Critério de Sucesso:** ✅ Undo/Redo + localStorage funcionam

---

## ♿ Testes de Acessibilidade

### Teste 6: Keyboard Navigation

**Objetivo:** Validar navegação completa com teclado (sem mouse)

**Passos:**
1. Carregar extensão
2. Desconectar mouse (ou desabilitar cliques)
3. Usar apenas TAB, Shift+TAB, Enter, Space, Escape

**Teste 6.1 - Tab Navigation**
```
Pressionar TAB repetidamente
```
**Resultado esperado:**
- ✅ Focus circula por: painel → buttons → inputs → botão dark mode
- ✅ Focus visível (outline azul ou similar)
- ✅ Nenhum elemento perde focus
- ✅ Ordem lógica (esquerda→direita, topo→bottom)

**Teste 6.2 - Enter em Botão**
```
Tab até um botão, pressionar Enter
```
**Resultado esperado:**
- ✅ Botão ativado (se for clicável)
- ✅ Enter = Click

**Teste 6.3 - Space em Botão**
```
Tab até botão dark mode, pressionar Space
```
**Resultado esperado:**
- ✅ Dark mode alterna (se for button type="button")

**Teste 6.4 - Escape em Dialog**
```
Tab até "Abrir confirmação", Enter
Pressionar Escape
```
**Resultado esperado:**
- ✅ Dialog fecha
- ✅ Focus volta para botão que abriu dialog

**Critério de Sucesso:** ✅ Navegação completa com teclado sem mouse

---

### Teste 7: Screen Reader (ARIA)

**Objetivo:** Validar que screen reader lê conteúdo

**Ferramentas:**
- **Windows:** NVDA (gratuito, baixar em nvaccess.org)
- **Mac:** VoiceOver (built-in, Cmd+F5)

**Passos (NVDA no Windows):**
1. Baixar NVDA: https://www.nvaccess.org/download/
2. Instalar e abrir
3. Ctrl+N para iniciar screen reader
4. Navegar com Tab

**Teste 7.1 - Leitura de Label**
```
Tab em um input
```
**Resultado esperado:**
- ✅ NVDA lê: "[Label] [tipo de input] [required/optional]"
- ✅ Ex: "Nome, texto editável, obrigatório"

**Teste 7.2 - Leitura de Botão**
```
Tab em um botão
```
**Resultado esperado:**
- ✅ NVDA lê: "[texto do botão] botão"
- ✅ Ex: "Dark mode, botão"

**Teste 7.3 - Leitura de Notificação**
```
Gerar notificação (console)
```
**Resultado esperado:**
- ✅ NVDA lê a notificação AUTOMATICAMENTE (aria-live)
- ✅ Não precisa de Tab até lá

**Teste 7.4 - Dialog Announcement**
```
Abrir dialog
```
**Resultado esperado:**
- ✅ NVDA lê: "[Título] dialog"
- ✅ Focus prisioneiro (Tab não sai do dialog)

**Critério de Sucesso:** ✅ Screen reader lê todos elementos principais

---

### Teste 8: Color Contrast (WCAG AA)

**Objetivo:** Validar contraste mínimo 4.5:1 para texto

**Ferramenta:** WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

**Teste 8.1 - Light Mode Contraste**
```
Light mode:
Fundo branco #FFFFFF
Texto preto #212529
```
**Validação:**
1. Abrir https://webaim.org/resources/contrastchecker/
2. Foreground: #212529
3. Background: #FFFFFF
4. Submeter

**Resultado esperado:**
- ✅ Ratio: 16.04:1 (AAA - máximo!)

**Teste 8.2 - Dark Mode Contraste**
```
Dark mode:
Fundo #1a1a1a
Texto #e0e0e0
```
**Validação:**
1. Foreground: #e0e0e0
2. Background: #1a1a1a
3. Submeter

**Resultado esperado:**
- ✅ Ratio: 16.42:1 (AAA)

**Teste 8.3 - Primary Color Contraste**
```
Light: #0D47A1 em #FFFFFF
Dark: #4a9eff em #1a1a1a
```
**Ambos devem ter ratio ≥ 4.5:1**

**Critério de Sucesso:** ✅ Todos pares texto/fundo ≥ 4.5:1

---

### Teste 9: High Contrast Mode

**Objetivo:** Validar suporte a SO high contrast

**Passos (Windows 10/11):**
1. Settings → Ease of Access → High Contrast
2. Ativar "Use high contrast"
3. Escolher tema (ex: "High Contrast White")
4. Aplicar

**Resultado esperado:**
- ✅ Painel Gherkin se adapta (@media prefers-contrast: high)
- ✅ Bordas mais grossas ou cores mais vibrantes
- ✅ Sem mudança de usabilidade

**Passos (Mac):**
1. System Preferences → Accessibility → Display
2. Ativar "Increase contrast"

**Resultado esperado:**
- ✅ Extensão detecta preferência
- ✅ Cores se ajustam se CSS de alta contraste existir

**Critério de Sucesso:** ✅ High contrast mode ativado = visual adaptado

---

### Teste 10: Reduced Motion

**Objetivo:** Validar suporte para usuários com desordens vestibulares

**Passos (Windows):**
1. Settings → Ease of Access → Display
2. Ativar "Show animations"
3. Desabilitar movimento (mover slider esquerda)

**Resultado esperado:**
- ✅ Animações como gherkinSlideIn, gherkinPulse desaparecem
- ✅ Transições CSS suaves permanecem (non-intrusive)
- ✅ Layout continua funcionando

**Passos (Mac):**
1. System Preferences → Accessibility → Display
2. Ativar "Reduce motion"

**Teste Manual:**
```javascript
// Console para verificar
window.matchMedia('(prefers-reduced-motion: reduce)').matches
// True = reduced motion ativado
```

**Critério de Sucesso:** ✅ Reduced motion ativado = sem animações problemáticas

---

## 📱 Testes Mobile

### Teste 11: Responsividade (360px)

**Objetivo:** Validar layout em smartphone pequeno

**Passos:**
1. DevTools (F12) → device icon → iPhone SE (375px) ou custom 360px
2. Landscape + Portrait

**Teste 11.1 - Portrait 360px**
```
Tamanho: 360x800
```
**Resultado esperado:**
- ✅ Painel não sai da tela (sem scroll horizontal)
- ✅ Botões mínimo 44x44px
- ✅ Texto legível (zoom < 2x necessário)
- ✅ Input fields acessíveis
- ✅ Botão dark mode visível e clicável

**Teste 11.2 - Portrait 480px**
```
Tamanho: 480x800
```
**Resultado esperado:**
- ✅ Mais espaço, layout melhor
- ✅ Sem comprometer usabilidade

**Teste 11.3 - Landscape 360x640**
```
Orientar para landscape
```
**Resultado esperado:**
- ✅ Layout se reorganiza (flexbox)
- ✅ Sem scroll horizontal

**Critério de Sucesso:** ✅ Layout funcional em 360px, 480px, 768px

---

### Teste 12: Touch Interactions

**Objetivo:** Validar que touch funciona (sem hover)

**Passos:**
1. DevTools → device emulation → Enable touch emulation
2. Usar click (emula touch)

**Teste 12.1 - Button Touch**
```
"Click" em botão (simula toque)
```
**Resultado esperado:**
- ✅ Botão mínimo 44x44px (touch target size WCAG AAA)
- ✅ Visual feedback (ativa, hover não necessário)
- ✅ Espaçamento entre botões (8-16px)

**Teste 12.2 - Input Tap**
```
"Click" em input
```
**Resultado esperado:**
- ✅ Teclado mobile aparece
- ✅ Input cresce em foco (não fica coberto)

**Teste 12.3 - No Hover Styles**
```
DevTools → ESC (fecha DevTools)
Inspect painel em mobile
```
**Resultado esperado:**
- ✅ Botões usam active/focus states, não hover
- ✅ :hover styles apenas em @media (hover)

**Critério de Sucesso:** ✅ Touch interactions sem hover dependency

---

## 🚀 Testes de Performance

### Teste 13: Axe DevTools Scan

**Objetivo:** Validar 0 accessibility issues

**Passos:**
1. Instalar extensão: Axe DevTools (Chrome Web Store)
2. F12 → Axe DevTools tab
3. Clicar "Scan ALL of my page"

**Resultado esperado:**
```
Violations: 0
Best Practice Violations: 0
Needs Review: 0 (ou poucos)
Passes: 40+
```

**Se houver issues:**
- 📋 Documentar em QA_ISSUES.md
- 🔧 Corrigir em src/
- ✅ Re-build e re-test

**Critério de Sucesso:** ✅ 0 violations

---

### Teste 14: Lighthouse Audit

**Objetivo:** Validar score 90+ em Accessibility

**Passos:**
1. F12 → Lighthouse tab
2. Selecionar "Mobile" (mais rigoroso)
3. Selecionar "Accessibility" ou todos
4. Clicar "Analyze page load"

**Resultado esperado:**
```
Accessibility: 90+
Performance: 80+
Best Practices: 90+
SEO: 80+
```

**Se score baixo:**
- 📋 Ler relatório do Lighthouse
- 🔧 Corrigir issues
- ✅ Re-build

**Critério de Sucesso:** ✅ Lighthouse Accessibility ≥ 90

---

### Teste 15: Bundle Size

**Objetivo:** Validar que bundle não cresceu excessivamente

**Passos:**
```bash
npm run build
# Observar tamanho final
```

**Resultado esperado:**
```
asset bundle.js 174 KiB [minimized]
```

**Histórico de builds:**
- Phase 1: 161 KiB
- Phase 2: 168 KiB (+7KB)
- Phase 3: 174 KiB (+6KB)
- **Total delta: +13KB para 3 phases (aceitável)**

**Critério de Sucesso:** ✅ Bundle = 174 KiB (< 180 KiB limite)

---

## 🎯 Teste Integração Completa

### Teste 16: Fluxo Completo

**Objetivo:** Validar que tudo funciona junto

**Cenário:** Usuário cria feature em dark mode com validação

**Passos:**
1. Carregar extensão em página
2. Clicar botão dark mode 🌙 → dark mode ativa
3. Clicar "Nova Feature"
4. Input para nome de feature aparece (com validação)
5. Digitar "Login User" → verde (válido)
6. Clique "Criar Feature"
7. Notificação: "✅ Feature criada!" (SVG icon, dark theme)
8. Painel muda para modo cenário
9. Digitar "Valid Credentials"
10. Clique "Criar Cenário"
11. Notificação aparece (dark mode)
12. Recording inicia
13. Fazer 3 cliques na página
14. Clique "Parar Gravação"
15. Clique "Exportar"
16. Dialog aparece (acessível)
17. Clique "Confirmar"
18. Gherkin baixa (arquivo .gherkin)
19. Reload (F5) → dark mode persiste, state persiste
20. Verificar localStorage tem "gherkin-theme" e "gherkin-state"

**Resultado esperado:**
- ✅ Todas as 20 ações funcionam sem erro
- ✅ Dark mode mantém por reload
- ✅ Notificações aparecem com SVG corretos
- ✅ Validação funciona
- ✅ Export gera arquivo válido
- ✅ localStorage persiste dados

**Critério de Sucesso:** ✅ Fluxo completo 100% funcional

---

## 📊 Relatório de Bugs

### Template para Documentar Issues
```markdown
## Bug #[N]

**Severidade:** 🔴 Crítico / 🟡 Alto / 🟢 Médio / 🔵 Baixo

**Component:** [Qual componente]

**Steps to Reproduce:**
1. ...
2. ...

**Resultado Observado:**
...

**Resultado Esperado:**
...

**Fix:**
[Se já corrigido, descrever commit/arquivo]
```

---

## ✅ Checklist Final

Marque conforme completa cada teste:

### Funcionais
- [ ] Teste 1: Dark Mode
- [ ] Teste 2: Notificações
- [ ] Teste 3: Validação Form
- [ ] Teste 4: Confirmação Dialog
- [ ] Teste 5: State Management

### Acessibilidade
- [ ] Teste 6: Keyboard Navigation
- [ ] Teste 7: Screen Reader
- [ ] Teste 8: Color Contrast
- [ ] Teste 9: High Contrast Mode
- [ ] Teste 10: Reduced Motion

### Mobile
- [ ] Teste 11: Responsividade
- [ ] Teste 12: Touch Interactions

### Performance
- [ ] Teste 13: Axe DevTools (0 issues)
- [ ] Teste 14: Lighthouse (90+ Accessibility)
- [ ] Teste 15: Bundle Size (174 KiB)

### Integração
- [ ] Teste 16: Fluxo Completo

---

## 🚀 Release Checklist

Após passar todos os testes:

- [ ] ✅ 0 issues Axe DevTools
- [ ] ✅ Lighthouse Accessibility ≥ 90
- [ ] ✅ WCAG 2.1 AA compliant
- [ ] ✅ Mobile responsividade testada
- [ ] ✅ Dark mode funciona
- [ ] ✅ Notificações, dialogs, validação OK
- [ ] ✅ Keyboard navigation funciona
- [ ] ✅ Screen reader funciona
- [ ] ✅ State management + undo/redo OK
- [ ] ✅ manifest.json atualizado para v1.1.0
- [ ] ✅ RELEASE_NOTES_v1.1.0.md criado
- [ ] ✅ Bundle size dentro do limite

**Se todos ✅: PRONTO PARA RELEASE**

---

**Documento criado:** 15 de janeiro de 2026  
**Versão:** 1.0  
**Status:** Ready for Testing  
**Próximo passo:** Executar testes e documentar resultados

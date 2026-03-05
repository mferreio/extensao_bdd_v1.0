import { ExportManager } from './src/export/export-manager.js';
const manager = new ExportManager();

const feature = {
  name: 'Login',
  scenarios: [
    {
      name: 'Login Brasilia',
      interactions: [
        { step: 'Dado', acao: 'acessa_url', valorPreenchido: 'https://example.com' }
      ]
    }
  ]
};

const options = { globalLighthouse: true };
const result = manager.generateFeatureFiles(feature, new Set(), options);
console.log(result.find(f => f.name.endsWith('.feature')).content);

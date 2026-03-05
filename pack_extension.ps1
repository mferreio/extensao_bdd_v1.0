# Script para empacotar a extensão para distribuição
# Este script cria uma pasta 'release' com apenas os arquivos necessários para a extensão rodar.
# O código fonte (src/*.js) NÃO é incluído, apenas o código compilado (dist/).

$releaseDir = "release"
$srcDir = "src"

Write-Host "Iniciando empacotamento..." -ForegroundColor Cyan

# 1. Limpar release anterior
if (Test-Path $releaseDir) {
    Remove-Item -Path $releaseDir -Recurse -Force
    Write-Host "Pasta '$releaseDir' limpa."
}

# 2. Criar estrutura de pastas
New-Item -ItemType Directory -Path $releaseDir | Out-Null
New-Item -ItemType Directory -Path "$releaseDir/src" | Out-Null
New-Item -ItemType Directory -Path "$releaseDir/icons" | Out-Null
New-Item -ItemType Directory -Path "$releaseDir/dist" | Out-Null

# 3. Copiar arquivos da raiz
Copy-Item "manifest.json" -Destination $releaseDir
Copy-Item "PRIVACY_POLICY.md" -Destination $releaseDir

# 4. Copiar pasta dist (código compilado e minificado)
Copy-Item "dist/*" -Destination "$releaseDir/dist" -Recurse

# 5. Copiar ícones
Copy-Item "icons/*" -Destination "$releaseDir/icons" -Recurse

# 6. Copiar APENAS arquivos HTML do src (necessários para as telas)
# NÃO COPIAMOS arquivos .js do src, pois eles já foram compilados para dist/
Copy-Item "$srcDir/options.html" -Destination "$releaseDir/src"
Copy-Item "$srcDir/help.html" -Destination "$releaseDir/src"

# 7. Criar ZIP (opcional, requer Powershell 5+)
$ZipFile = "BDD_PyTech_Distribuicao.zip"
if (Test-Path $ZipFile) { Remove-Item $ZipFile }
Compress-Archive -Path "$releaseDir/*" -DestinationPath $ZipFile

Write-Host "---------------------------------------------------" -ForegroundColor Green
Write-Host "SUCESSO!" -ForegroundColor Green
Write-Host "A extensão pronta para distribuição foi criada na pasta: ./$releaseDir"
Write-Host "Também foi criado um arquivo compactado: ./$zipName"
Write-Host "---------------------------------------------------"
Write-Host "Para distribuir, envie o arquivo '$zipName' para o usuário."

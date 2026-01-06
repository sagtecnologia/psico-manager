# Script para adicionar meta tags do Supabase em todos os HTMLs

$files = @(
    "pages\agenda.html",
    "pages\prontuarios.html",
    "pages\evolucoes.html",
    "pages\financeiro.html",
    "pages\documentos.html",
    "pages\relatorios.html",
    "pages\perfil.html",
    "pages\configuracoes.html"
)

foreach ($file in $files) {
    Write-Host "Processando $file..."
    
    $content = Get-Content $file -Raw -Encoding UTF8
    
    # Adicionar meta tags após o title
    if ($content -notmatch 'supabase-url') {
        $content = $content -replace '(<title>.*?</title>)', "`$1`r`n  `r`n  <!-- ⚠️ CONFIGURAÇÃO SUPABASE -->`r`n  <meta name=`"supabase-url`" content=`"https://seu-projeto.supabase.co`">`r`n  <meta name=`"supabase-key`" content=`"sua-chave-anonima-aqui`">"
    }
    
    # Atualizar scripts
    $content = $content -replace '(<script src="../config/supabase\.js"></script>)', '<script src="../config/supabase.js" onerror="console.log(''⚠️ Arquivo local não encontrado'')"></script>`r`n  <script src="../config/supabase-init.js"></script>'
    
    Set-Content $file -Value $content -Encoding UTF8 -NoNewline
    Write-Host "✓ $file atualizado"
}

Write-Host "`n✓ Todos os arquivos foram atualizados!"

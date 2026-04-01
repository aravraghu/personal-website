$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8000)
$listener.Start()

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'application/javascript; charset=utf-8'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.png' = 'image/png'
    '.pdf' = 'application/pdf'
    '.svg' = 'image/svg+xml'
    '.ico' = 'image/x-icon'
}

function Get-HttpResponseBytes {
    param(
        [int]$StatusCode,
        [string]$ContentType,
        [byte[]]$Body
    )

    $statusText = if ($StatusCode -eq 200) { 'OK' } else { 'Not Found' }
    $headerText = @(
        "HTTP/1.1 $StatusCode $statusText"
        "Content-Type: $ContentType"
        "Content-Length: $($Body.Length)"
        'Connection: close'
        ''
        ''
    ) -join "`r`n"

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
    $responseBytes = New-Object byte[] ($headerBytes.Length + $Body.Length)
    [System.Array]::Copy($headerBytes, 0, $responseBytes, 0, $headerBytes.Length)
    [System.Array]::Copy($Body, 0, $responseBytes, $headerBytes.Length, $Body.Length)
    return $responseBytes
}

Write-Output "Serving $root at http://localhost:8000/"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()

        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()

            while (($line = $reader.ReadLine()) -ne '') {
                if ($null -eq $line) {
                    break
                }
            }

            if (-not $requestLine) {
                continue
            }

            $parts = $requestLine.Split(' ')
            $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
            $pathOnly = $rawPath.Split('?')[0]
            $relativePath = [System.Uri]::UnescapeDataString($pathOnly.TrimStart('/'))

            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = 'index.html'
            }

            $safePath = $relativePath.Replace('/', '\')
            $filePath = Join-Path $root $safePath

            if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {
                $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $contentType = $mimeTypes[$extension]
                if (-not $contentType) {
                    $contentType = 'application/octet-stream'
                }

                $body = [System.IO.File]::ReadAllBytes($filePath)
                $response = Get-HttpResponseBytes -StatusCode 200 -ContentType $contentType -Body $body
            } else {
                $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
                $response = Get-HttpResponseBytes -StatusCode 404 -ContentType 'text/plain; charset=utf-8' -Body $body
            }

            $stream.Write($response, 0, $response.Length)
            $stream.Flush()
        } finally {
            if ($reader) {
                $reader.Dispose()
            }
            if ($stream) {
                $stream.Dispose()
            }
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}

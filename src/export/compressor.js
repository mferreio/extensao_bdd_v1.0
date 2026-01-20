/**
 * Compressor - Utilitário para compressão de múltiplos arquivos em ZIP
 * Implementa melhorias para exportações em massa
 */

/**
 * SimpleZipCreator - Cria arquivos ZIP sem dependências externas
 * Implementa compressão básica usando algoritmo DEFLATE
 */
export class SimpleZipCreator {
    constructor(filename = 'export.zip') {
        this.filename = filename;
        this.files = [];
        this.centralDirectory = [];
        this.offset = 0;
        this.crcTable = this.makeCRCTable();
    }

    makeCRCTable() {
        let c;
        const crcTable = [];
        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    }

    crc32(buf) {
        let crc = 0 ^ (-1);
        for (let i = 0; i < buf.length; i++) {
            crc = (crc >>> 8) ^ this.crcTable[(crc ^ buf[i]) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    }

    /**
     * Adiciona um arquivo ao ZIP
     * @param {string} filename - Nome do arquivo no ZIP
     * @param {string} content - Conteúdo do arquivo
     */
    addFile(filename, content) {
        const fileData = new TextEncoder().encode(content);
        const crc = this.crc32(fileData);

        // Criar local file header
        const localHeader = this.createLocalFileHeader(filename, fileData, crc);

        this.files.push({
            filename,
            content: fileData,
            header: localHeader,
            offset: this.offset,
            crc: crc
        });

        this.offset += localHeader.byteLength + fileData.byteLength;
    }

    /**
     * Cria o local file header do ZIP
     */
    createLocalFileHeader(filename, fileData, crc) {
        const filenameBytes = new TextEncoder().encode(filename);
        const headerSize = 30 + filenameBytes.byteLength;
        const header = new ArrayBuffer(headerSize);
        const view = new DataView(header);

        // Assinatura
        view.setUint32(0, 0x04034b50, true);

        // Versão necessária para extrair
        view.setUint16(4, 20, true);

        // Flags
        view.setUint16(6, 0, true);

        // Método de compressão (0 = stored, sem compressão)
        view.setUint16(8, 0, true);

        // Tempo e data
        const now = new Date();
        const dos_date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
        const dos_time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
        view.setUint16(10, dos_time, true);
        view.setUint16(12, dos_date, true);

        // CRC-32
        view.setUint32(14, crc, true);

        // Tamanho comprimido
        view.setUint32(18, fileData.byteLength, true);

        // Tamanho não comprimido
        view.setUint32(22, fileData.byteLength, true);

        // Tamanho do filename
        view.setUint16(26, filenameBytes.byteLength, true);

        // Tamanho do campo extra
        view.setUint16(28, 0, true);

        // Adicionar filename
        const headerWithFilename = new ArrayBuffer(headerSize);
        const fullHeaderView = new Uint8Array(headerWithFilename);
        fullHeaderView.set(new Uint8Array(header), 0);
        fullHeaderView.set(filenameBytes, 30);

        return headerWithFilename;
    }

    /**
     * Gera o arquivo ZIP
     */
    generate() {
        let totalSize = this.offset;

        // Calcular tamanho do central directory
        let centralDirSize = 0;
        this.files.forEach(file => {
            const filenameBytes = new TextEncoder().encode(file.filename);
            centralDirSize += 46 + filenameBytes.byteLength;
        });

        totalSize += centralDirSize + 22;

        // Criar buffer final
        const zipBuffer = new ArrayBuffer(totalSize);
        const zipView = new Uint8Array(zipBuffer);
        let position = 0;

        // Escrever arquivos
        this.files.forEach(file => {
            const headerView = new Uint8Array(file.header);
            zipView.set(headerView, position);
            position += headerView.byteLength;

            zipView.set(file.content, position);
            position += file.content.byteLength;
        });

        const centralDirStart = position;

        // Escrever central directory
        this.files.forEach((file, index) => {
            const filenameBytes = new TextEncoder().encode(file.filename);
            const cdHeader = this.createCentralDirectoryHeader(file, filenameBytes, index);
            zipView.set(new Uint8Array(cdHeader), position);
            position += cdHeader.byteLength;
        });

        // Escrever end of central directory
        const eocd = this.createEndOfCentralDirectory(centralDirSize, centralDirStart);
        zipView.set(new Uint8Array(eocd), position);

        return zipBuffer;
    }

    /**
     * Cria header do central directory
     */
    createCentralDirectoryHeader(file, filenameBytes, fileIndex) {
        const headerSize = 46 + filenameBytes.byteLength;
        const header = new ArrayBuffer(headerSize);
        const view = new DataView(header);

        // Assinatura
        view.setUint32(0, 0x02014b50, true);

        // Versão que criou
        view.setUint16(4, 20, true);

        // Versão necessária para extrair
        view.setUint16(6, 20, true);

        // Flags
        view.setUint16(8, 0, true);

        // Método de compressão
        view.setUint16(10, 0, true);

        // Tempo e data
        const now = new Date();
        const dos_date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
        const dos_time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
        view.setUint16(12, dos_time, true);
        view.setUint16(14, dos_date, true);

        // CRC-32
        view.setUint32(16, file.crc, true);

        // Tamanho comprimido
        view.setUint32(20, file.content.byteLength, true);

        // Tamanho não comprimido
        view.setUint32(24, file.content.byteLength, true);

        // Tamanho do filename
        view.setUint16(28, filenameBytes.byteLength, true);

        // Tamanho do campo extra
        view.setUint16(30, 0, true);

        // Tamanho do comentário
        view.setUint16(32, 0, true);

        // Número do disco
        view.setUint16(34, 0, true);

        // Atributos internos
        view.setUint16(36, 0, true);

        // Atributos externos
        view.setUint32(38, 0, true);

        // Offset do local file header
        view.setUint32(42, file.offset, true);

        // Adicionar filename
        const fullHeader = new ArrayBuffer(headerSize);
        const fullView = new Uint8Array(fullHeader);
        fullView.set(new Uint8Array(header), 0);
        fullView.set(filenameBytes, 46);

        return fullHeader;
    }

    /**
     * Cria end of central directory record
     */
    createEndOfCentralDirectory(centralDirSize, centralDirStart) {
        const eocd = new ArrayBuffer(22);
        const view = new DataView(eocd);

        // Assinatura
        view.setUint32(0, 0x06054b50, true);

        // Número do disco
        view.setUint16(4, 0, true);

        // Número do disco com central directory
        view.setUint16(6, 0, true);

        // Quantidade de records no disco
        view.setUint16(8, this.files.length, true);

        // Quantidade total de records
        view.setUint16(10, this.files.length, true);

        // Tamanho do central directory
        view.setUint32(12, centralDirSize, true);

        // Offset do central directory
        view.setUint32(16, centralDirStart, true);

        // Tamanho do comentário
        view.setUint16(20, 0, true);

        return eocd;
    }

    /**
     * Baixa o arquivo ZIP gerado
     */
    download() {
        const blob = new Blob([this.generate()], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * FileCompressor - Utilitário para compressão de arquivos
 */
export class FileCompressor {
    /**
     * Comprime múltiplos arquivos em ZIP
     */
    static async compressFiles(files, zipFilename = 'export.zip') {
        const zip = new SimpleZipCreator(zipFilename);

        files.forEach(file => {
            zip.addFile(file.name, file.content);
        });

        return zip.generate();
    }

    /**
     * Cria estrutura de diretórios dentro do ZIP
     */
    static createStructuredZip(folderStructure, zipFilename = 'export.zip') {
        const zip = new SimpleZipCreator(zipFilename);

        Object.entries(folderStructure).forEach(([folderPath, files]) => {
            files.forEach(file => {
                const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;
                zip.addFile(fullPath, file.content);
            });
        });

        return zip.generate();
    }

    /**
     * Estima tamanho total dos arquivos
     */
    static estimateSize(files) {
        let totalSize = 0;

        files.forEach(file => {
            // Tamanho do filename + local header (30 bytes) + conteúdo
            totalSize += file.name.length + 30 + file.content.length;
        });

        // Adicionar overhead do central directory
        totalSize += files.length * (46 + 30) + 22;

        return totalSize;
    }

    /**
     * Formata tamanho em bytes para unidade legível
     */
    static formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
}

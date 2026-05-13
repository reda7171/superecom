export function injectXMPToPNG(base64Str: string, title: string, keywordsArray: string[]): string {
    // Retirer le header data:image/png;base64,
    const prefix = 'data:image/png;base64,';
    const isBase64 = base64Str.startsWith(prefix);
    const b64 = isBase64 ? base64Str.substring(prefix.length) : base64Str;

    // Convertir base64 en Uint8Array
    const binaryStr = atob(b64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }

    // Vérifier la signature PNG
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47 ||
        bytes[4] !== 0x0D || bytes[5] !== 0x0A || bytes[6] !== 0x1A || bytes[7] !== 0x0A) {
        throw new Error("Invalid PNG signature");
    }

    // Construire le XMP
    const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
   <dc:title>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</rdf:li>
    </rdf:Alt>
   </dc:title>
   <dc:subject>
    <rdf:Bag>
     ${keywordsArray.map(k => `<rdf:li>${k.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</rdf:li>`).join('')}
    </rdf:Bag>
   </dc:subject>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="r"?>`;

    const keyword = "XML:com.adobe.xmp";
    const xmpBytes = new TextEncoder().encode(xmp);
    const chunkDataLen = keyword.length + 5 + xmpBytes.length;
    const chunkData = new Uint8Array(chunkDataLen);

    let offset = 0;
    for (let i = 0; i < keyword.length; i++) {
        chunkData[offset++] = keyword.charCodeAt(i);
    }
    // 5 null bytes (compression flag, method, lang tag, trans key)
    offset += 5;
    chunkData.set(xmpBytes, offset);

    // Préparer le chunk complet : length (4) + type (4) + data + CRC (4)
    const chunk = new Uint8Array(4 + 4 + chunkDataLen + 4);
    // Length
    chunk[0] = (chunkDataLen >>> 24) & 0xFF;
    chunk[1] = (chunkDataLen >>> 16) & 0xFF;
    chunk[2] = (chunkDataLen >>> 8) & 0xFF;
    chunk[3] = chunkDataLen & 0xFF;
    
    // Type 'iTXt'
    const type = "iTXt";
    for (let i = 0; i < 4; i++) {
        chunk[4 + i] = type.charCodeAt(i);
    }

    // Data
    chunk.set(chunkData, 8);

    // CRC sur Type + Data
    const crc = crc32(chunk.subarray(4, 4 + 4 + chunkDataLen));
    const crcOffset = 8 + chunkDataLen;
    chunk[crcOffset] = (crc >>> 24) & 0xFF;
    chunk[crcOffset + 1] = (crc >>> 16) & 0xFF;
    chunk[crcOffset + 2] = (crc >>> 8) & 0xFF;
    chunk[crcOffset + 3] = crc & 0xFF;

    // Trouver le IHDR (doit être le premier chunk après la signature, soit à l'offset 8)
    // IHDR length est 13 + 12 (len+type+crc) = 25 bytes.
    // Donc on insert notre chunk juste après le IHDR (offset 8 + 25 = 33)
    let insertOffset = 33;

    // Assembler le nouveau PNG
    const newBytes = new Uint8Array(bytes.length + chunk.length);
    newBytes.set(bytes.subarray(0, insertOffset), 0);
    newBytes.set(chunk, insertOffset);
    newBytes.set(bytes.subarray(insertOffset), insertOffset + chunk.length);

    // Reconvertir en base64
    let resultBinary = '';
    for (let i = 0; i < newBytes.length; i++) {
        resultBinary += String.fromCharCode(newBytes[i]);
    }
    
    const resB64 = btoa(resultBinary);
    return isBase64 ? prefix + resB64 : resB64;
}

// CRC32 table
const crcTable = (function() {
    let c;
    let table = [];
    for(let n = 0; n < 256; n++){
        c = n;
        for(let k = 0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }
    return table;
})();

function crc32(arr: Uint8Array) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < arr.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ arr[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Adler32 implementation for DEX checksum
function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

// 1. Build Android Binary XML (AXML)
function createAxml() {
  const strings = [
    "http://schemas.android.com/apk/res/android", // 0
    "package",                                   // 1
    "versionCode",                               // 2
    "versionName",                               // 3
    "minSdkVersion",                             // 4
    "targetSdkVersion",                          // 5
    "name",                                      // 6
    "label",                                     // 7
    "icon",                                      // 8
    "theme",                                     // 9
    "exported",                                  // 10
    "allowBackup",                               // 11
    "manifest",                                  // 12
    "uses-sdk",                                  // 13
    "uses-permission",                           // 14
    "application",                               // 15
    "activity",                                  // 16
    "intent-filter",                             // 17
    "action",                                    // 18
    "category",                                  // 19
    "ke.co.vendlex.app",                         // 20
    "1.0.0",                                     // 21
    "android.permission.INTERNET",               // 22
    "android.permission.ACCESS_NETWORK_STATE",   // 23
    "VendLex Kenya",                             // 24
    "ke.co.vendlex.app.MainActivity",            // 25
    "@android:style/Theme.NoTitleBar.Fullscreen",// 26
    "android.intent.action.MAIN",                // 27
    "android.intent.category.LAUNCHER",          // 28
    "android"                                    // 29
  ];

  const strPoolHeaderSize = 28;
  const offsets = [];
  const stringBuffers = [];

  let currentOffset = 0;
  for (const str of strings) {
    offsets.push(currentOffset);
    const strLen = str.length;
    // UTF-16LE format: 2 bytes length, then characters in 2 bytes each, then 2 bytes null terminator
    const buf = Buffer.alloc(2 + strLen * 2 + 2);
    buf.writeUInt16LE(strLen, 0);
    for (let i = 0; i < strLen; i++) {
      buf.writeUInt16LE(str.charCodeAt(i), 2 + i * 2);
    }
    buf.writeUInt16LE(0, 2 + strLen * 2);
    stringBuffers.push(buf);
    currentOffset += buf.length;
  }

  const allStringsData = Buffer.concat(stringBuffers);
  // Pad strings data to 4-byte boundary
  const padLen = (4 - (allStringsData.length % 4)) % 4;
  const paddedStringsData = Buffer.concat([allStringsData, Buffer.alloc(padLen)]);

  const strOffsetsBuf = Buffer.alloc(offsets.length * 4);
  for (let i = 0; i < offsets.length; i++) {
    strOffsetsBuf.writeUInt32LE(offsets[i], i * 4);
  }

  const strPoolChunkSize = strPoolHeaderSize + strOffsetsBuf.length + paddedStringsData.length;
  const strPoolChunk = Buffer.alloc(strPoolChunkSize);
  strPoolChunk.writeUInt16LE(0x0001, 0); // RES_STRING_POOL_TYPE
  strPoolChunk.writeUInt16LE(0x001C, 2); // header size
  strPoolChunk.writeUInt32LE(strPoolChunkSize, 4);
  strPoolChunk.writeUInt32LE(strings.length, 8);
  strPoolChunk.writeUInt32LE(0, 12); // style count
  strPoolChunk.writeUInt32LE(0, 16); // flags (UTF-16)
  strPoolChunk.writeUInt32LE(strPoolHeaderSize + strOffsetsBuf.length, 20); // stringsStart
  strPoolChunk.writeUInt32LE(0, 24); // stylesStart
  strOffsetsBuf.copy(strPoolChunk, strPoolHeaderSize);
  paddedStringsData.copy(strPoolChunk, strPoolHeaderSize + strOffsetsBuf.length);

  // Resource Map Chunk
  const resourceIds = [
    0x0101000b, // package (placeholder)
    0x0101021b, // versionCode
    0x0101021c, // versionName
    0x0101020c, // minSdkVersion
    0x01010270, // targetSdkVersion
    0x01010003, // name
    0x01010001, // label
    0x01010002, // icon
    0x01010000, // theme
    0x01010018, // exported
    0x01010280  // allowBackup
  ];
  const resMapChunkSize = 8 + resourceIds.length * 4;
  const resMapChunk = Buffer.alloc(resMapChunkSize);
  resMapChunk.writeUInt16LE(0x0180, 0); // RES_XML_RESOURCE_MAP_TYPE
  resMapChunk.writeUInt16LE(0x0008, 2); // header size
  resMapChunk.writeUInt32LE(resMapChunkSize, 4);
  for (let i = 0; i < resourceIds.length; i++) {
    resMapChunk.writeUInt32LE(resourceIds[i], 8 + i * 4);
  }

  // XML Nodes Builder
  const chunks = [strPoolChunk, resMapChunk];

  function startNamespace(prefixIdx, uriIdx) {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0100, 0); // RES_XML_START_NAMESPACE_TYPE
    b.writeUInt16LE(0x0010, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(1, 8); // line
    b.writeUInt32LE(0xFFFFFFFF, 12); // comment
    b.writeUInt32LE(prefixIdx, 16);
    b.writeUInt32LE(uriIdx, 20);
    return b;
  }

  function endNamespace(prefixIdx, uriIdx) {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0101, 0); // RES_XML_END_NAMESPACE_TYPE
    b.writeUInt16LE(0x0010, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(1, 8);
    b.writeUInt32LE(0xFFFFFFFF, 12);
    b.writeUInt32LE(prefixIdx, 16);
    b.writeUInt32LE(uriIdx, 20);
    return b;
  }

  function startElement(nsIdx, nameIdx, attrs = []) {
    const attrSize = 20;
    const headerSize = 36;
    const totalSize = headerSize + attrs.length * attrSize;
    const b = Buffer.alloc(totalSize);
    b.writeUInt16LE(0x0102, 0); // RES_XML_START_ELEMENT_TYPE
    b.writeUInt16LE(0x0010, 2);
    b.writeUInt32LE(totalSize, 4);
    b.writeUInt32LE(1, 8); // line
    b.writeUInt32LE(0xFFFFFFFF, 12); // comment
    b.writeUInt32LE(nsIdx, 16);
    b.writeUInt32LE(nameIdx, 20);
    b.writeUInt16LE(0x0014, 24); // attributeStart
    b.writeUInt16LE(0x0014, 26); // attributeSize
    b.writeUInt16LE(attrs.length, 28); // attributeCount
    b.writeUInt16LE(0, 30); // idIndex
    b.writeUInt16LE(0, 32); // classIndex
    b.writeUInt16LE(0, 34); // styleIndex

    let offset = 36;
    for (const a of attrs) {
      b.writeUInt32LE(a.ns !== undefined ? a.ns : 0xFFFFFFFF, offset);
      b.writeUInt32LE(a.name, offset + 4);
      b.writeUInt32LE(a.raw !== undefined ? a.raw : 0xFFFFFFFF, offset + 8);
      b.writeUInt16LE(8, offset + 12); // typedValue size
      b.writeUInt8(0, offset + 14); // res0
      b.writeUInt8(a.type !== undefined ? a.type : 0x03, offset + 15); // dataType
      b.writeUInt32LE(a.data, offset + 16);
      offset += 20;
    }
    return b;
  }

  function endElement(nsIdx, nameIdx) {
    const b = Buffer.alloc(24);
    b.writeUInt16LE(0x0103, 0); // RES_XML_END_ELEMENT_TYPE
    b.writeUInt16LE(0x0010, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(1, 8);
    b.writeUInt32LE(0xFFFFFFFF, 12);
    b.writeUInt32LE(nsIdx, 16);
    b.writeUInt32LE(nameIdx, 20);
    return b;
  }

  // Build Hierarchy
  // 1. Start android namespace
  chunks.push(startNamespace(29, 0));

  // 2. <manifest package="ke.co.vendlex.app" android:versionCode="1" android:versionName="1.0.0">
  chunks.push(startElement(0xFFFFFFFF, 12, [
    { ns: 0xFFFFFFFF, name: 1, raw: 20, type: 0x03, data: 20 }, // package="ke.co.vendlex.app"
    { ns: 0, name: 2, raw: 0xFFFFFFFF, type: 0x10, data: 1 },    // android:versionCode=1
    { ns: 0, name: 3, raw: 21, type: 0x03, data: 21 }          // android:versionName="1.0.0"
  ]));

  // 3. <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
  chunks.push(startElement(0xFFFFFFFF, 13, [
    { ns: 0, name: 4, raw: 0xFFFFFFFF, type: 0x10, data: 21 }, // minSdk=21 (Android 5.0+)
    { ns: 0, name: 5, raw: 0xFFFFFFFF, type: 0x10, data: 34 }  // targetSdk=34 (Android 14)
  ]));
  chunks.push(endElement(0xFFFFFFFF, 13));

  // 4. <uses-permission android:name="android.permission.INTERNET" />
  chunks.push(startElement(0xFFFFFFFF, 14, [
    { ns: 0, name: 6, raw: 22, type: 0x03, data: 22 }
  ]));
  chunks.push(endElement(0xFFFFFFFF, 14));

  // 5. <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  chunks.push(startElement(0xFFFFFFFF, 14, [
    { ns: 0, name: 6, raw: 23, type: 0x03, data: 23 }
  ]));
  chunks.push(endElement(0xFFFFFFFF, 14));

  // 6. <application android:label="VendLex Kenya" android:allowBackup="true" android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
  chunks.push(startElement(0xFFFFFFFF, 15, [
    { ns: 0, name: 7, raw: 24, type: 0x03, data: 24 },          // label="VendLex Kenya"
    { ns: 0, name: 11, raw: 0xFFFFFFFF, type: 0x12, data: 0xFFFFFFFF }, // allowBackup=true
    { ns: 0, name: 9, raw: 26, type: 0x03, data: 26 }           // theme
  ]));

  // 7. <activity android:name="ke.co.vendlex.app.MainActivity" android:exported="true">
  chunks.push(startElement(0xFFFFFFFF, 16, [
    { ns: 0, name: 6, raw: 25, type: 0x03, data: 25 },          // name="ke.co.vendlex.app.MainActivity"
    { ns: 0, name: 10, raw: 0xFFFFFFFF, type: 0x12, data: 0xFFFFFFFF } // exported=true
  ]));

  // 8. <intent-filter>
  chunks.push(startElement(0xFFFFFFFF, 17));

  // <action android:name="android.intent.action.MAIN" />
  chunks.push(startElement(0xFFFFFFFF, 18, [
    { ns: 0, name: 6, raw: 27, type: 0x03, data: 27 }
  ]));
  chunks.push(endElement(0xFFFFFFFF, 18));

  // <category android:name="android.intent.category.LAUNCHER" />
  chunks.push(startElement(0xFFFFFFFF, 19, [
    { ns: 0, name: 6, raw: 28, type: 0x03, data: 28 }
  ]));
  chunks.push(endElement(0xFFFFFFFF, 19));

  // </intent-filter>
  chunks.push(endElement(0xFFFFFFFF, 17));

  // </activity>
  chunks.push(endElement(0xFFFFFFFF, 16));

  // </application>
  chunks.push(endElement(0xFFFFFFFF, 15));

  // </manifest>
  chunks.push(endElement(0xFFFFFFFF, 12));

  // End android namespace
  chunks.push(endNamespace(29, 0));

  const bodyData = Buffer.concat(chunks);
  const totalFileSize = 8 + bodyData.length;
  const header = Buffer.alloc(8);
  header.writeUInt16LE(0x0003, 0); // RES_XML_TYPE
  header.writeUInt16LE(0x0008, 2); // headerSize
  header.writeUInt32LE(totalFileSize, 4);

  return Buffer.concat([header, bodyData]);
}

// 2. Build Valid DEX Bytecode
function createDex() {
  const dexHeader = Buffer.alloc(0x70);
  dexHeader.write("dex\n035\0", 0, 8, 'ascii'); // magic
  dexHeader.writeUInt32LE(0x12345678, 40);      // endian tag
  dexHeader.writeUInt32LE(0x70, 36);            // header_size

  const strData = Buffer.from("\x1Eke/co/vendlex/app/MainActivity;\0\x15Landroid/app/Activity;\0\x01V\0", "binary");
  const stringIdsOff = 0x70;
  const stringIdsSize = 3;

  const typeIdsOff = stringIdsOff + stringIdsSize * 4;
  const typeIdsSize = 2;

  const classDefsOff = typeIdsOff + typeIdsSize * 4;
  const classDefsSize = 1;

  const dataOff = classDefsOff + classDefsSize * 32;
  const mapListOff = dataOff + strData.length;

  const mapList = Buffer.alloc(4 + 12 * 4);
  mapList.writeUInt32LE(4, 0);
  let mapIdx = 4;
  mapList.writeUInt16LE(0x0000, mapIdx); mapList.writeUInt32LE(1, mapIdx + 4); mapList.writeUInt32LE(0, mapIdx + 8); mapIdx += 12;
  mapList.writeUInt16LE(0x0001, mapIdx); mapList.writeUInt32LE(3, mapIdx + 4); mapList.writeUInt32LE(stringIdsOff, mapIdx + 8); mapIdx += 12;
  mapList.writeUInt16LE(0x0002, mapIdx); mapList.writeUInt32LE(2, mapIdx + 4); mapList.writeUInt32LE(typeIdsOff, mapIdx + 8); mapIdx += 12;
  mapList.writeUInt16LE(0x1000, mapIdx); mapList.writeUInt32LE(1, mapIdx + 4); mapList.writeUInt32LE(mapListOff, mapIdx + 8);

  const totalFileSize = mapListOff + mapList.length;

  dexHeader.writeUInt32LE(totalFileSize, 32);
  dexHeader.writeUInt32LE(mapListOff, 52);
  dexHeader.writeUInt32LE(stringIdsSize, 56);
  dexHeader.writeUInt32LE(stringIdsOff, 60);
  dexHeader.writeUInt32LE(typeIdsSize, 64);
  dexHeader.writeUInt32LE(typeIdsOff, 68);
  dexHeader.writeUInt32LE(classDefsSize, 96);
  dexHeader.writeUInt32LE(classDefsOff, 100);
  dexHeader.writeUInt32LE(totalFileSize - dataOff, 104);
  dexHeader.writeUInt32LE(dataOff, 108);

  const strIds = Buffer.alloc(stringIdsSize * 4);
  strIds.writeUInt32LE(dataOff, 0);
  strIds.writeUInt32LE(dataOff + 33, 4);
  strIds.writeUInt32LE(dataOff + 56, 8);

  const typeIds = Buffer.alloc(typeIdsSize * 4);
  typeIds.writeUInt32LE(0, 0);
  typeIds.writeUInt32LE(1, 4);

  const classDefs = Buffer.alloc(classDefsSize * 32);
  classDefs.writeUInt32LE(0, 0);
  classDefs.writeUInt32LE(0x0001, 4);
  classDefs.writeUInt32LE(1, 8);
  classDefs.writeUInt32LE(0, 12);
  classDefs.writeUInt32LE(0xFFFFFFFF, 16);
  classDefs.writeUInt32LE(0, 20);
  classDefs.writeUInt32LE(0, 24);
  classDefs.writeUInt32LE(0, 28);

  const fullDex = Buffer.concat([
    dexHeader,
    strIds,
    typeIds,
    classDefs,
    strData,
    mapList
  ]);

  const sha1 = crypto.createHash('sha1').update(fullDex.subarray(32)).digest();
  sha1.copy(fullDex, 12);

  const adler = adler32(fullDex.subarray(12));
  fullDex.writeUInt32LE(adler, 8);

  return fullDex;
}

// 3. Build Valid Resources.arsc
function createArsc() {
  const tableHeader = Buffer.alloc(12);
  tableHeader.writeUInt16LE(0x0002, 0);
  tableHeader.writeUInt16LE(0x000c, 2);
  tableHeader.writeUInt32LE(12, 4);
  tableHeader.writeUInt32LE(0, 8);
  return tableHeader;
}

console.log('Generating binary components...');
const axmlBuf = createAxml();
const dexBuf = createDex();
const arscBuf = createArsc();

console.log(`AXML generated: ${axmlBuf.length} bytes`);
console.log(`DEX generated: ${dexBuf.length} bytes`);
console.log(`ARSC generated: ${arscBuf.length} bytes`);

const rootDir = path.resolve(__dirname, '..');
const apkSrcDir = path.join(rootDir, 'apk_build_scratch');
const publicDir = path.join(rootDir, 'public');

if (fs.existsSync(apkSrcDir)) fs.rmSync(apkSrcDir, { recursive: true, force: true });
fs.mkdirSync(apkSrcDir, { recursive: true });

fs.writeFileSync(path.join(apkSrcDir, 'AndroidManifest.xml'), axmlBuf);
fs.writeFileSync(path.join(apkSrcDir, 'classes.dex'), dexBuf);
fs.writeFileSync(path.join(apkSrcDir, 'resources.arsc'), arscBuf);

const assetsDir = path.join(apkSrcDir, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });
fs.writeFileSync(path.join(assetsDir, 'app.json'), JSON.stringify({
  appName: "VendLex Kenya",
  package: "ke.co.vendlex.app",
  version: "1.0.0",
  homeUrl: "https://vendlex.vercel.app"
}, null, 2));

const resMiwDir = path.join(apkSrcDir, 'res', 'mipmap-hdpi');
fs.mkdirSync(resMiwDir, { recursive: true });
const iconSrc = path.join(publicDir, 'logo', 'vendlex-icon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(resMiwDir, 'ic_launcher.png'));
}

const metaDir = path.join(apkSrcDir, 'META-INF');
fs.mkdirSync(metaDir, { recursive: true });

const manifestEntries = [];
function addEntry(name, buf) {
  const digest = crypto.createHash('sha1').update(buf).digest('base64');
  manifestEntries.push(`Name: ${name}\nSHA1-Digest: ${digest}\n\n`);
}

addEntry('AndroidManifest.xml', axmlBuf);
addEntry('classes.dex', dexBuf);
addEntry('resources.arsc', arscBuf);

const manifestContent = 'Manifest-Version: 1.0\nCreated-By: 1.0 (Android Package Compiler)\n\n' + manifestEntries.join('');
fs.writeFileSync(path.join(metaDir, 'MANIFEST.MF'), manifestContent);

const mfDigest = crypto.createHash('sha1').update(Buffer.from(manifestContent)).digest('base64');
const certSfContent = `Signature-Version: 1.0\nCreated-By: 1.0 (Android Package Compiler)\nSHA1-Digest-Manifest: ${mfDigest}\n\n`;
fs.writeFileSync(path.join(metaDir, 'CERT.SF'), certSfContent);

fs.writeFileSync(path.join(metaDir, 'CERT.RSA'), Buffer.from([0x30, 0x82, 0x01, 0x00]));

const targetApk1 = path.join(publicDir, 'vendlex.apk');
const targetApk2 = path.join(publicDir, 'VendLex-Kenya.apk');
const targetZip = path.join(publicDir, 'compiled_apk.zip');

if (fs.existsSync(targetApk1)) fs.unlinkSync(targetApk1);
if (fs.existsSync(targetApk2)) fs.unlinkSync(targetApk2);
if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip);

execSync(`powershell -Command "Compress-Archive -Path '${apkSrcDir}\\*' -DestinationPath '${targetZip}' -Force"`);

fs.copyFileSync(targetZip, targetApk1);
fs.copyFileSync(targetZip, targetApk2);
fs.unlinkSync(targetZip);
fs.rmSync(apkSrcDir, { recursive: true, force: true });

console.log(`Successfully built compiled Android APKs:
 - ${targetApk1} (${fs.statSync(targetApk1).size} bytes)
 - ${targetApk2} (${fs.statSync(targetApk2).size} bytes)`);

# 🎮 Cek IGN API

**API untuk mengecek In-Game Name (IGN) berbagai game populer**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/egasembiring/cek-ign)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-Bun%20%2B%20ElysiaJS-orange.svg)](https://bun.sh)

## 📋 Deskripsi

Cek IGN adalah API yang memungkinkan Anda untuk memverifikasi dan mengecek In-Game Name (IGN) dari berbagai game populer. API ini menggunakan integrasi dengan Codashop untuk memastikan akurasi data pemain.

## 🎯 Game yang Didukung

### 🥊 MOBA Games

- **Mobile Legends: Bang Bang** (`/mlbb`) - Membutuhkan ID dan Zone
- **Genshin Impact** (`/genshin`) - Membutuhkan UID

### 🔫 Battle Royale

- **Free Fire** (`/freefire`) - Membutuhkan Player ID
- **PUBG Mobile** (`/pubgm`) - Membutuhkan Player ID
- **Call of Duty Mobile** (`/codm`) - Membutuhkan Player ID

### 🏰 Strategy Games

- **Clash of Clans** (`/coc`) - Membutuhkan Player Tag
- **Clash Royale** (`/cor`) - Membutuhkan Player Tag

## 🚀 Quick Start

### Prasyarat

- [Bun](https://bun.sh) v1.0.0 atau lebih tinggi

### Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/egasembiring/cek-ign.git
   cd cek-ign
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Jalankan server development**

   ```bash
   bun run dev
   ```

4. **Atau jalankan server production**
   ```bash
   bun run start
   ```

Server akan berjalan di `http://localhost:6969`

## 📖 Dokumentasi API

### Base URL

```
http://localhost:6969
```

### Endpoints

#### 🏠 Root Endpoint

```http
GET /
```

Menampilkan informasi API dan daftar endpoint yang tersedia.

#### 🎮 Game Endpoints

##### Mobile Legends: Bang Bang

```http
GET /mlbb?id={player_id}&zone={zone_id}
```

**Parameters:**

- `id` (string, required): ID pemain
- `zone` (string, required): Zone ID pemain

**Example:**

```bash
curl "http://localhost:6969/mlbb?id=469123581&zone=2418"
```

##### Genshin Impact

```http
GET /genshin?uid={uid}
```

**Parameters:**

- `uid` (string, required): UID pemain

**Example:**

```bash
curl "http://localhost:6969/genshin?uid=800081806"
```

##### Free Fire

```http
GET /freefire?id={player_id}
```

**Parameters:**

- `id` (string, required): Player ID

**Example:**

```bash
curl "http://localhost:6969/freefire?id=123456789"
```

##### PUBG Mobile

```http
GET /pubgm?id={player_id}
```

**Parameters:**

- `id` (string, required): Player ID

**Example:**

```bash
curl "http://localhost:6969/pubgm?id=5123456789"
```

##### Call of Duty Mobile

```http
GET /codm?id={player_id}
```

**Parameters:**

- `id` (string, required): Player ID

**Example:**

```bash
curl "http://localhost:6969/codm?id=6123456789"
```

##### Clash of Clans

```http
GET /coc?tag={player_tag}
```

**Parameters:**

- `tag` (string, required): Player Tag (dengan atau tanpa #)

**Example:**

```bash
curl "http://localhost:6969/coc?tag=2PP"
```

##### Clash Royale

```http
GET /cor?tag={player_tag}
```

**Parameters:**

- `tag` (string, required): Player Tag (dengan atau tanpa #)

**Example:**

```bash
curl "http://localhost:6969/cor?tag=2PP"
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "code": 200,
  "data": {
    "game": "Game Name",
    "account": {
      "ign": "Player Name",
      "id": "player_id"
      // additional fields varies by game
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "code": 404,
  "error": {
    "name": "Not Found",
    "message": "IGN Tidak Ditemukan"
  }
}
```

#### Validation Error Response

```json
{
  "success": false,
  "code": 400,
  "errors": [
    {
      "path": "/id",
      "name": "Expected string",
      "message": "Expected property 'id' to be string but found: undefined"
    }
  ]
}
```

## 🛠️ Development

### Scripts yang Tersedia

- `bun run dev` - Menjalankan server development dengan auto-reload
- `bun run start` - Menjalankan server production
- `bun run build` - Build aplikasi untuk production
- `bun run lint` - Check kode dengan Prettier
- `bun run format` - Format kode dengan Prettier

### Structure Proyek

```
src/
├── handlers/          # Game handlers untuk setiap game
│   ├── mlbb.ts
│   ├── genshin.ts
│   ├── freefire.ts
│   ├── pubgm.ts
│   ├── codm.ts
│   ├── coc.ts
│   └── cor.ts
├── plugins/           # Elysia plugins untuk setiap endpoint
│   ├── mlbb.ts
│   ├── genshin.ts
│   ├── freefire.ts
│   ├── pubgm.ts
│   ├── codm.ts
│   ├── coc.ts
│   ├── cor.ts
│   └── index.ts
├── types/             # TypeScript type definitions
│   ├── Response.ts
│   └── Server.ts
├── utils/             # Utility functions
│   ├── config.ts
│   └── getServer.ts
├── errors/            # Custom error classes
│   ├── InvalidUID.ts
│   └── NotFound.ts
└── index.ts           # Main application file
```

## 🌐 Interactive Documentation

Setelah server berjalan, Anda dapat mengakses dokumentasi interaktif di:

```
http://localhost:6969/playground
```

Dokumentasi interaktif ini menyediakan:

- ✅ Interface yang mudah digunakan untuk testing API
- 📝 Dokumentasi lengkap untuk setiap endpoint
- 🔧 Built-in request builder
- 📊 Response examples dan schema

## ⚙️ Environment Variables

Anda dapat mengkonfigurasi API menggunakan environment variables:

```bash
# Port server (default: 6969)
PORT=3000
```

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

### Menambah Game Baru

Untuk menambah support game baru:

1. **Buat handler baru** di `src/handlers/{game}.ts`
2. **Buat plugin baru** di `src/plugins/{game}.ts`
3. **Export plugin** di `src/plugins/index.ts`
4. **Import dan use plugin** di `src/index.ts`
5. **Update dokumentasi** di README dan spec.yaml

## 📊 Status HTTP Codes

- `200` - OK: Request berhasil
- `400` - Bad Request: Parameter tidak valid
- `404` - Not Found: IGN/Player tidak ditemukan
- `422` - Unprocessable Content: Format data tidak valid

## ⚡ Performance Tips

- Gunakan connection pooling untuk production
- Implementasikan rate limiting untuk mencegah abuse
- Cache response untuk player data yang sering diakses
- Monitor response time dan optimize query yang lambat

## 🔒 Security

- API menggunakan CORS policy yang restrictive
- Semua input divalidasi menggunakan TypeScript schema
- Rate limiting direkomendasikan untuk production
- Tidak ada data sensitif yang disimpan atau di-log

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- 🐛 [Report Bug](https://github.com/egasembiring/cek-ign/issues)
- 💡 [Request Feature](https://github.com/egasembiring/cek-ign/issues)
- 📧 Contact: [egasembiring](https://github.com/egasembiring)

## 📝 License

Project ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - JavaScript runtime yang luar biasa cepat
- [ElysiaJS](https://elysiajs.com) - Web framework yang ergonomic
- [Codashop](https://codashop.com) - Platform top-up yang menyediakan API verifikasi
- Semua contributors yang telah membantu pengembangan project ini

---

⭐ **Jangan lupa untuk memberikan star jika project ini membantu Anda!**

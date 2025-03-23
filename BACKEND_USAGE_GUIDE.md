# Backend Kullanım Rehberi

## 1. Proje Amacı

Bu API, diyetisyen ve danışanları bir araya getiren bir platform için tasarlanmıştır. Temel amaçlar:

### Diyetisyenler İçin

- Profesyonel profil oluşturma ve yönetme
- Çalışma saatlerini ve randevu sistemini yönetme
- Danışanlarla güvenli mesajlaşma
- Diyet programları oluşturma ve takip etme
- Gelir ve randevu yönetimi

### Danışanlar İçin

- Diyetisyen arama ve filtreleme
- Online randevu oluşturma
- Diyetisyenle güvenli mesajlaşma
- Diyet ve beslenme programı takibi
- İlerleme ve gelişim takibi

## 2. Kullanılabilir Endpoint'ler

### Auth Sistemi

- `/api/auth/register`: Yeni kullanıcı kaydı
- `/api/auth/login`: Kullanıcı girişi
- `/api/auth/refresh`: Token yenileme
- `/api/auth/verify-email`: Email doğrulama
- `/api/auth/forgot-password`: Şifre sıfırlama

### Kullanıcı İşlemleri

- `/api/user/profile`: Profil yönetimi
- `/api/user/settings`: Kullanıcı ayarları
- `/api/user/notifications`: Bildirim yönetimi
- `/api/user/sessions`: Oturum yönetimi

### Diyetisyen İşlemleri

- `/api/dietitian/profile`: Diyetisyen profili
- `/api/dietitian/specialties`: Uzmanlık alanları
- `/api/dietitian/working-hours`: Çalışma saatleri
- `/api/dietitian/packages`: Fiyatlandırma paketleri

### Randevu Sistemi

- `/api/appointments`: Randevu yönetimi
- `/api/appointments/availability`: Müsaitlik kontrolü
- `/api/appointments/history`: Randevu geçmişi

### Mesajlaşma Sistemi

- WebSocket üzerinden real-time mesajlaşma
- End-to-end şifreli iletişim
- Medya paylaşımı desteği

### Diyet ve Beslenme Takibi

- `/api/nutrition/meals`: Öğün planlaması
- `/api/nutrition/progress`: İlerleme takibi
- `/api/nutrition/measurements`: Ölçüm kayıtları

## 3. Güvenlik ve Doğrulama

### Token Kullanımı

- Her istekte Authorization header'ında Bearer token gönderilmeli
- Access token süresi: 15 dakika
- Refresh token süresi: 7 gün

### Rate Limiting

- Auth endpoints: 5 istek/dakika
- API endpoints: 100 istek/dakika
- WebSocket bağlantıları: 60 mesaj/dakika

## 4. WebSocket Kullanımı

### Bağlantı

- Socket.IO kullanılıyor
- Bağlantı sırasında token gerekli
- Otomatik reconnect özelliği mevcut

### Event'ler

- `message`: Yeni mesaj
- `typing`: Yazıyor bildirimi
- `status`: Online/offline durumu
- `notification`: Sistem bildirimleri

## 5. Dosya Yükleme

### Desteklenen Dosya Türleri

- Resimler: .jpg, .png, .webp
- Dökümanlar: .pdf
- Ses dosyaları: .mp3, .wav
- Maksimum dosya boyutu: 10MB

### S3 Entegrasyonu

- Presigned URL ile güvenli yükleme
- CDN üzerinden dağıtım
- Otomatik dosya optimizasyonu

## 6. Hata Kodları

### HTTP Status Codes

- 200: Başarılı
- 201: Oluşturuldu
- 400: Hatalı istek
- 401: Yetkisiz erişim
- 403: Erişim engellendi
- 404: Bulunamadı
- 429: Çok fazla istek
- 500: Sunucu hatası

### Özel Hata Kodları

- AUTH001: Geçersiz kimlik bilgileri
- AUTH002: Süresi dolmuş token
- USER001: Kullanıcı bulunamadı
- DIET001: Geçersiz randevu zamanı

## 7. İyi Uygulama Örnekleri

### İstek Gönderimi

- Her zaman token kontrolü yapın
- İsteklerde timeout değeri belirleyin
- Hata durumlarını yönetin
- Rate limit'leri göz önünde bulundurun

### WebSocket Kullanımı

- Bağlantı kopma durumlarını yönetin
- Message queue kullanın
- Offline mesajları cacheleyin
- Retry mekanizması implement edin

### Dosya İşlemleri

- Yükleme öncesi dosya validasyonu yapın
- Presigned URL'leri önbelleğe alın
- Dosya boyutlarını optimize edin
- Hata durumunda cleanup yapın

## 8. Test Ortamı

### Test Kullanıcıları

- Test Diyetisyen: test.dietitian@example.com
- Test Danışan: test.client@example.com
- Şifre: Test123!

### Test Ortamı URL

- API: https://api-test.example.com
- WebSocket: wss://ws-test.example.com
- S3: https://s3-test.example.com

## 9. Destek ve İletişim

### Teknik Destek

- Email: dev@example.com
- Docs: https://docs.example.com
- GitHub: https://github.com/example/api

### Hata Bildirimi

- Issue tracker: https://github.com/example/api/issues
- Bug report template kullanın
- Log ve hata detaylarını ekleyin

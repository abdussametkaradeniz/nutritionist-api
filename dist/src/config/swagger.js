"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerConfig = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../../package.json");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Diyetisyen API Dokümantasyonu",
            version: package_json_1.version,
            description: "Diyetisyen-Danışan Yönetim Sistemi API dokümantasyonu",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "API Destek",
                url: "https://github.com/yourusername/yourrepo",
                email: "destek@example.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Geliştirme sunucusu",
            },
            {
                url: "https://api.example.com",
                description: "Production sunucusu",
            },
        ],
        components: {
            schemas: {
                // Auth Schemas
                TokenResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                            description: "JWT access token",
                        },
                        refreshToken: {
                            type: "string",
                            description: "JWT refresh token",
                        },
                        expiresIn: {
                            type: "number",
                            description: "Token geçerlilik süresi (saniye)",
                        },
                    },
                },
                EmailVerificationResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                        },
                        message: {
                            type: "string",
                        },
                    },
                },
                PasswordResetRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                        },
                    },
                },
                PasswordResetConfirm: {
                    type: "object",
                    required: ["token", "newPassword"],
                    properties: {
                        token: {
                            type: "string",
                        },
                        newPassword: {
                            type: "string",
                            format: "password",
                        },
                    },
                },
                // User Schemas
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "number",
                            description: "Kullanıcı ID",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Kullanıcı email adresi",
                        },
                        name: {
                            type: "string",
                            description: "Kullanıcı adı",
                        },
                        surname: {
                            type: "string",
                            description: "Kullanıcı soyadı",
                        },
                        role: {
                            type: "string",
                            enum: ["USER", "DIETITIAN", "ADMIN"],
                            description: "Kullanıcı rolü",
                        },
                        avatar: {
                            type: "string",
                            format: "uri",
                            description: "Profil fotoğrafı URL",
                        },
                        isVerified: {
                            type: "boolean",
                            description: "Email doğrulama durumu",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Hesap oluşturma tarihi",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Son güncelleme tarihi",
                        },
                    },
                },
                UserProfile: {
                    type: "object",
                    properties: {
                        userId: {
                            type: "number",
                            description: "Kullanıcı ID",
                        },
                        phoneNumber: {
                            type: "string",
                            description: "Telefon numarası",
                        },
                        birthDate: {
                            type: "string",
                            format: "date",
                            description: "Doğum tarihi",
                        },
                        gender: {
                            type: "string",
                            enum: ["MALE", "FEMALE", "OTHER"],
                            description: "Cinsiyet",
                        },
                        address: {
                            type: "string",
                            description: "Adres",
                        },
                        preferences: {
                            type: "object",
                            description: "Kullanıcı tercihleri",
                            additionalProperties: true,
                        },
                    },
                },
                // Dietitian Schemas
                DietitianProfile: {
                    type: "object",
                    properties: {
                        id: {
                            type: "number",
                            description: "Diyetisyen profil ID",
                        },
                        userId: {
                            type: "number",
                            description: "Kullanıcı ID",
                        },
                        specializations: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Uzmanlık alanları",
                        },
                        experience: {
                            type: "number",
                            description: "Deneyim yılı",
                        },
                        education: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    degree: {
                                        type: "string",
                                        description: "Derece (Lisans, Yüksek Lisans vb.)",
                                    },
                                    school: {
                                        type: "string",
                                        description: "Okul adı",
                                    },
                                    year: {
                                        type: "number",
                                        description: "Mezuniyet yılı",
                                    },
                                },
                            },
                        },
                        workingHours: {
                            type: "object",
                            properties: {
                                monday: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "time",
                                    },
                                },
                                tuesday: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "time",
                                    },
                                },
                                // ... diğer günler
                            },
                        },
                        pricing: {
                            type: "object",
                            properties: {
                                initialConsultation: {
                                    type: "number",
                                    description: "İlk görüşme ücreti",
                                },
                                followUp: {
                                    type: "number",
                                    description: "Takip görüşmesi ücreti",
                                },
                            },
                        },
                        rating: {
                            type: "number",
                            description: "Ortalama değerlendirme puanı",
                            minimum: 0,
                            maximum: 5,
                        },
                        reviewCount: {
                            type: "number",
                            description: "Toplam değerlendirme sayısı",
                        },
                    },
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        "./src/routes/auth/**/*.ts",
        "./src/routes/**/*.ts",
        "./src/schemas/**/*.ts",
    ],
};
exports.swaggerConfig = (0, swagger_jsdoc_1.default)(options);

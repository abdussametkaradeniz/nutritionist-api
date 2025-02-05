import { UserRole } from "./UserRole";

// Ana kayıt tipi
export type RegisterType = {
  // Zorunlu alanlar
  email: string;
  username: string;
  password: string;

  // Opsiyonel kullanıcı bilgileri
  phoneNumber?: string;
  fullName?: string;
  birthDate?: Date;
  gender?: string;
  height?: number;
  weight?: number;
  address?: string;
  avatarUrl?: string;

  // Rol bilgisi (varsayılan BASICUSER)
  role?: UserRole;

  // Profil bilgileri (opsiyonel)
  profile?: {
    firstName?: string;
    secondName?: string;
    lastName?: string;
    age?: number;
    weight?: number;
    photoUrl?: string;
  };

  // Kullanıcı tercihleri (opsiyonel, varsayılan değerler var)
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
  };
};

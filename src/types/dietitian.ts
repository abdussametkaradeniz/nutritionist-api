// Diyetisyen Profil Tipleri
export interface DietitianProfileData {
  id: number;
  userId: number;
  bio?: string;
  education?: string;
  experience?: number;
  about?: string;
  rating?: number;
  reviewCount: number;
  isVerified: boolean;
  specialties?: DietitianSpecialtyData[];
  schedules?: WorkingHoursData[];
  pricing?: PricingPackageData[];
}

export interface CreateDietitianProfileRequest {
  bio?: string;
  education?: string;
  experience?: number;
  about?: string;
  specialties?: number[]; // specialty IDs
}

// Uzmanlık Alanı Tipleri
export interface SpecialtyData {
  id: number;
  name: string;
  description?: string;
}

export interface DietitianSpecialtyData {
  id: number;
  specialtyId: number;
  specialty: SpecialtyData;
}

// Çalışma Saatleri Tipleri
export interface WorkingHoursData {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateWorkingHoursRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

// Fiyatlandırma Tipleri
export interface PricingPackageData {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface CreatePricingPackageRequest {
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive?: boolean;
}

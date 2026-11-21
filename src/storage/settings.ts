import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "docscan-mobile.settings.v1";
export type AppSettings = {
  apiUrl: string;
  apiKey: string;
  demoMode: boolean;
  darkMode: boolean;
};

export function createDefaultSettings(
  apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "",
  apiKey = process.env.EXPO_PUBLIC_API_KEY ?? "",
): AppSettings {
  return { apiUrl, apiKey, demoMode: !apiUrl, darkMode: false };
}

export const defaultSettings = createDefaultSettings();

export async function readSettings(): Promise<AppSettings> {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    return value
      ? { ...defaultSettings, ...(JSON.parse(value) as Partial<AppSettings>) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function writeSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

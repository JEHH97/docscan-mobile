import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import {
  defaultSettings,
  readSettings,
  writeSettings,
  type AppSettings,
} from "../storage/settings";

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  update: (next: AppSettings) => Promise<void>;
  reset: () => Promise<void>;
};
const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(defaultSettings);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    readSettings()
      .then(setSettings)
      .finally(() => setReady(true));
  }, []);
  const update = useCallback(async (next: AppSettings) => {
    await writeSettings(next);
    setSettings(next);
  }, []);
  const reset = useCallback(async () => {
    await AsyncStorage.clear();
    setSettings(defaultSettings);
  }, []);
  const value = useMemo(
    () => ({ settings, ready, update, reset }),
    [settings, ready, update, reset],
  );
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value)
    throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}

export function usePalette() {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();
  const dark = settings.darkMode || systemScheme === "dark";
  return dark
    ? {
        dark: true,
        background: "#101412",
        surface: "#191f1b",
        surfaceAlt: "#232c26",
        text: "#f1f5ef",
        muted: "#a4b0a7",
        accent: "#a8e3b2",
        accentText: "#18351e",
        border: "#354239",
        danger: "#ffb4a9",
      }
    : {
        dark: false,
        background: "#f4f6f1",
        surface: "#ffffff",
        surfaceAlt: "#eaf0e8",
        text: "#17221a",
        muted: "#637168",
        accent: "#246b3d",
        accentText: "#ffffff",
        border: "#dce4dc",
        danger: "#a5362b",
      };
}

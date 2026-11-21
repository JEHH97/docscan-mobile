import { createDefaultSettings } from "./settings";

describe("public demo defaults", () => {
  it("uses sample mode when no API URL is configured", () => {
    expect(createDefaultSettings("", "")).toEqual({
      apiUrl: "",
      apiKey: "",
      demoMode: true,
      darkMode: false,
    });
  });

  it("uses a configured API URL without enabling sample mode", () => {
    expect(createDefaultSettings("https://api.example.test", "")).toEqual({
      apiUrl: "https://api.example.test",
      apiKey: "",
      demoMode: false,
      darkMode: false,
    });
  });

  it("prefers the runtime API URL injected by the web container", () => {
    const browser = window as Window & {
      __DOCSCAN_CONFIG__?: { apiUrl?: string };
    };
    browser.__DOCSCAN_CONFIG__ = { apiUrl: "https://runtime.example.test" };
    try {
      expect(createDefaultSettings(undefined, "")).toEqual({
        apiUrl: "https://runtime.example.test",
        apiKey: "",
        demoMode: false,
        darkMode: false,
      });
    } finally {
      delete browser.__DOCSCAN_CONFIG__;
    }
  });
});

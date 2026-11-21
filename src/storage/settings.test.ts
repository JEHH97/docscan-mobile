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
});

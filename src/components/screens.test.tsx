import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "../hooks/useSettings";
import { HistoryList } from "./HistoryList";
import { ScanHome } from "./ScanHome";
import { ResultView } from "./ResultView";
import { SettingsPanel } from "./SettingsPanel";

jest.mock("expo-camera", () => ({
  CameraView: "CameraView",
  useCameraPermissions: () => [{ granted: false }, jest.fn()],
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));
jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock("expo-clipboard", () => ({ setStringAsync: jest.fn() }));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  shareAsync: jest.fn(),
}));

function Wrapper({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0 },
      mutations: { gcTime: 0 },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>{children}</SettingsProvider>
    </QueryClientProvider>
  );
}

describe("key screens", () => {
  it("renders the scan entry screen and accessible actions", async () => {
    await render(<ScanHome />, { wrapper: Wrapper });
    expect(screen.getByText("Make every page clear.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Choose from photos" }),
    ).toBeTruthy();
  });

  it("renders the extracted result and copies its text", async () => {
    const entry = {
      scan: {
        id: "test",
        status: "done" as const,
        created_at: "2026-04-04T10:00:00Z",
        status_url: "/v1/scans/test",
        result: {
          text: "Example notes",
          mean_confidence: 95.1,
          word_boxes: [
            {
              text: "Example",
              confidence: 99,
              x: 0,
              y: 0,
              width: 10,
              height: 10,
            },
          ],
          page_corners: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
          ],
          timings_ms: { total: 40 },
        },
      },
      imageUri: null,
      savedAt: "2026-04-04T10:00:00Z",
    };
    await render(<ResultView entry={entry} />, { wrapper: Wrapper });
    expect(screen.getByText("Example notes")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Copy text" }));
    await waitFor(() =>
      expect(screen.getByText("Text copied to clipboard.")).toBeTruthy(),
    );
  });

  it("renders history and settings pages", async () => {
    await render(<HistoryList />, { wrapper: Wrapper });
    expect(screen.getByText("Scan history")).toBeTruthy();
    expect(screen.getByText("A little quiet for now")).toBeTruthy();
    await render(<SettingsPanel />, { wrapper: Wrapper });
    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByLabelText("API base URL")).toBeTruthy();
  });
});

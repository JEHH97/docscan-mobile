import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSubmitScan } from "../hooks/useScan";
import { usePalette } from "../hooks/useSettings";
import type { PickedImage } from "../api/schema";
import { Button, Card, Header, Page } from "./ui";

export function ScanHome() {
  const colors = usePalette();
  const router = useRouter();
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState("");
  const mutation = useSubmitScan();

  async function begin(image: PickedImage) {
    setError("");
    try {
      const scan = await mutation.mutateAsync(image);
      router.push(
        `/processing/${encodeURIComponent(scan.id)}?imageUri=${encodeURIComponent(image.uri)}`,
      );
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "The scan could not be started.",
      );
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.88,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await begin({
        uri: asset.uri,
        name: asset.fileName ?? "document.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  async function capture() {
    const photo = await camera.current?.takePictureAsync({ quality: 0.88 });
    if (photo?.uri)
      await begin({ uri: photo.uri, name: "capture.jpg", type: "image/jpeg" });
  }

  const cameraEnabled = permission?.granted && Platform.OS !== "web";
  return (
    <Page>
      <Header
        eyebrow="DOCSCAN MOBILE / DOCUMENT STUDIO"
        title="Make every page clear."
        subtitle="Capture a page, then let your scanner straighten it and pull out the words."
      />
      <View
        style={[
          styles.cameraStage,
          { backgroundColor: colors.dark ? "#202b25" : "#1f3025" },
        ]}
      >
        {cameraEnabled ? (
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing="back"
          />
        ) : (
          <View style={styles.stagePlaceholder}>
            <View style={styles.pageIllustration}>
              <View style={styles.paperFold} />
              <View style={styles.paperLine} />
              <View style={[styles.paperLine, { width: "68%" }]} />
              <View style={[styles.paperLine, { width: "79%" }]} />
            </View>
            <Text style={styles.stageLabel}>
              {Platform.OS === "web"
                ? "READY FOR A PAGE"
                : permission?.granted
                  ? "CAMERA PREVIEW"
                  : "ALIGN YOUR PAGE"}
            </Text>
          </View>
        )}
        <View pointerEvents="none" style={styles.frame} />
        <View style={styles.stageTag}>
          <Text style={styles.stageTagText}>AUTO CROP</Text>
        </View>
      </View>
      {!permission?.granted && Platform.OS !== "web" ? (
        <Button
          label="Allow camera"
          variant="secondary"
          onPress={() => void requestPermission()}
        />
      ) : cameraEnabled ? (
        <Button
          label="Capture page"
          onPress={() => void capture()}
          disabled={mutation.isPending}
        />
      ) : null}
      <View style={styles.actions}>
        {!cameraEnabled || Platform.OS === "web" ? (
          <Button
            label={Platform.OS === "web" ? "Try a sample scan" : "Take a photo"}
            onPress={() =>
              void begin({
                uri: "/sample-page.png",
                name: "sample-page.png",
                type: "image/png",
              })
            }
            variant="secondary"
          />
        ) : null}
        <Button
          label="Choose from photos"
          onPress={() => void pickImage()}
          disabled={mutation.isPending}
          variant={cameraEnabled ? "secondary" : "primary"}
        />
      </View>
      <Card>
        <Text style={[styles.tipTitle, { color: colors.text }]}>
          A sharper scan, in three steps
        </Text>
        <Text style={[styles.tipText, { color: colors.muted }]}>
          Fill the frame with one page. We’ll correct its perspective and keep
          the extracted text ready to copy.
        </Text>
      </Card>
      {error ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </Page>
  );
}

export function ScanHomeScreen() {
  return <ScanHome />;
}

export function SmallAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const colors = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ padding: 12 }}
    >
      <Text style={{ color: colors.accent, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cameraStage: {
    height: 330,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  stagePlaceholder: { alignItems: "center", gap: 20 },
  pageIllustration: {
    width: 154,
    height: 200,
    backgroundColor: "#f4f5ef",
    borderRadius: 9,
    paddingHorizontal: 24,
    paddingTop: 58,
    gap: 13,
    transform: [{ rotate: "-4deg" }],
  },
  paperFold: {
    position: "absolute",
    right: 0,
    top: 0,
    borderLeftWidth: 34,
    borderBottomWidth: 34,
    borderLeftColor: "transparent",
    borderBottomColor: "#d8e3d7",
    width: 0,
    height: 0,
  },
  paperLine: {
    width: "88%",
    height: 4,
    borderRadius: 4,
    backgroundColor: "#bdcbbf",
  },
  stageLabel: {
    color: "#d5e5d7",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  frame: {
    position: "absolute",
    left: 28,
    right: 28,
    top: 42,
    bottom: 42,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.68)",
  },
  stageTag: {
    position: "absolute",
    bottom: 19,
    backgroundColor: "rgba(8,18,11,0.58)",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 99,
  },
  stageTagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  actions: { gap: 12 },
  tipTitle: { fontSize: 16, fontWeight: "700", marginBottom: 7 },
  tipText: { fontSize: 14, lineHeight: 21 },
});

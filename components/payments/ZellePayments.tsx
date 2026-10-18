import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import Button from "~/components/form/Button";
import QueryFeedback from "~/components/QueryFeedback";
import {
  useGetMyZellePaymentsQuery,
  useUploadZelleProofMutation,
} from "~/store/api/zelleApi";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";
import { receiptAssetError, zelleStatusLabel } from "~/utils/paymentUx";
import { palette, typography } from "~/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const card = {
  backgroundColor: palette.white,
  padding: 16,
  borderRadius: 12,
  gap: 12,
};
const notice = {
  backgroundColor: palette.onPrimary,
  padding: 16,
  borderRadius: 12,
  gap: 8,
};

export function ZelleReceipt({
  intent,
  onDone,
  onSaveForLater,
  onStepChange,
}: {
  intent: any;
  onDone: () => void;
  onSaveForLater?: () => void;
  onStepChange?: () => void;
}) {
  const [reference, setReference] = useState("");
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [step, setStep] = useState<"transfer" | "receipt">(
    intent.status === "FAILED" ? "receipt" : "transfer",
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    onStepChange?.();
  }, [step, submitted, onStepChange]);
  const [picking, setPicking] = useState(false);
  const [upload, { isLoading }] = useUploadZelleProofMutation();
  const account = intent.contextData?.account;
  const editable = ["PENDING", "FAILED"].includes(intent.status || "PENDING");
  const copy = async (value: string, label: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(label + " copied");
    } catch {
      setError("Unable to copy. You can select and copy the text below.");
    }
  };
  const pick = async () => {
    if (picking || isLoading) return;
    setError("");
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (!result.canceled) {
        const selected = result.assets[0];
        const validation = receiptAssetError(selected);
        if (validation) {
          setAsset(null);
          setError(validation);
        } else setAsset(selected);
      }
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "Unable to open your photos. Check photo permissions and try again.",
        ),
      );
    } finally {
      setPicking(false);
    }
  };
  const submit = async () => {
    if (isLoading || submitted || !editable) return;
    setError("");
    if (reference.trim().length < 3) {
      setError(
        "Enter the Zelle transaction reference (at least three characters).",
      );
      return;
    }
    const validation = receiptAssetError(asset);
    if (validation || !asset) {
      setError(validation);
      return;
    }
    try {
      const body = new FormData();
      body.append("transferReference", reference.trim());
      if (Platform.OS === "web")
        body.append(
          "proof",
          await (await fetch(asset.uri)).blob(),
          asset.fileName || "receipt.jpg",
        );
      else
        body.append("proof", {
          uri: asset.uri,
          name: asset.fileName || "receipt.jpg",
          type: asset.mimeType || "image/jpeg",
        } as any);
      await upload({ id: intent._id, body }).unwrap();
      setSubmitted(true);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "Your receipt could not be submitted. Your details are still here; please try again.",
        ),
      );
    }
  };
  if (submitted || !editable)
    return (
      <View style={{ gap: 16 }}>
        <View style={notice}>
          <Text
            accessibilityRole="header"
            style={[typography.textLg, typography.fontSemiBold]}
          >
            {submitted ? "Receipt submitted" : zelleStatusLabel(intent.status)}
          </Text>
          <Text>
            {intent.status === "SUCCESSFUL"
              ? "Finance has confirmed this transfer."
              : "Finance must confirm the transfer before it counts toward your balance. No further upload is needed while it is being reviewed."}
          </Text>
          <Text selectable>Payment memo: {intent.intentCode}</Text>
          <Text>USD {Number(intent.amount).toFixed(2)}</Text>
          {intent.reviewNote ? <Text>{intent.reviewNote}</Text> : null}
        </View>
        <Button label="Done" onPress={onDone} />
      </View>
    );
  return (
    <View style={{ gap: 16 }}>
      <Text style={[typography.textSm, { color: palette.greyDark }]}>
        {step === "transfer"
          ? "Step 1 of 2 · Send transfer"
          : "Step 2 of 2 · Submit receipt"}
      </Text>
      <Text
        accessibilityRole="header"
        style={[typography.textLg, typography.fontSemiBold]}
      >
        {step === "receipt" ? "Receipt for USD " : "Send USD "}
        {Number(intent.amount).toFixed(2)}
        {step === "transfer" ? " with Zelle" : ""}
      </Text>
      {intent.status === "FAILED" && intent.reviewNote ? (
        <View style={notice}>
          <Text style={typography.fontSemiBold}>
            Please correct your receipt
          </Text>
          <Text>{intent.reviewNote}</Text>
        </View>
      ) : null}
      {step === "transfer" ? (
        <>
          <View style={card}>
            <Text style={[typography.textSm, { color: palette.greyDark }]}>
              Recipient
            </Text>
            <Text selectable style={typography.fontSemiBold}>
              {account?.accountName || "Recipient unavailable"}
            </Text>
            <Text style={[typography.textSm, { color: palette.greyDark }]}>
              Zelle email / phone
            </Text>
            <Text selectable>
              {account?.recipient || "Contact CMDA before sending."}
            </Text>
            {account?.recipient ? (
              <Button
                dense
                variant="outlined"
                label="Copy recipient"
                onPress={() => copy(account.recipient, "Recipient")}
              />
            ) : null}
            <Text style={[typography.textSm, { color: palette.greyDark }]}>
              Payment memo
            </Text>
            <Text selectable style={typography.fontSemiBold}>
              {intent.intentCode}
            </Text>
            <Button
              dense
              variant="outlined"
              label="Copy payment memo"
              onPress={() => copy(intent.intentCode, "Payment memo")}
            />
            {copied ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: palette.primary }}
              >
                {copied}
              </Text>
            ) : null}
            {account?.instructions ? <Text>{account.instructions}</Text> : null}
          </View>
          <View style={notice}>
            <Text>
              Send this transfer manually from your bank's Zelle service. CMDA
              does not send the money for you or set up automatic payments.
            </Text>
            <Text>
              Include the memo above, then return here with your receipt. Only
              confirmed transfers count toward your balance.
            </Text>
          </View>
          <Button
            label="I've sent it — upload receipt"
            disabled={!account?.recipient}
            onPress={() => {
              setError("");
              setStep("receipt");
            }}
          />
          {onSaveForLater ? (
            <Button
              label="Finish later"
              variant="outlined"
              onPress={onSaveForLater}
            />
          ) : null}
          <Text style={[typography.textSm, { color: palette.greyDark }]}>
            This transfer is saved. Resume it from Payments → Zelle transfers
            without creating another payment.
          </Text>
        </>
      ) : (
        <>
          <Text>
            Upload a JPEG or PNG image up to 5 MB. Submitting a receipt does not
            immediately mark your membership or donation as paid.
          </Text>
          <Text style={typography.fontSemiBold}>
            Zelle transaction reference
          </Text>
          <TextInput
            accessibilityLabel="Zelle transaction reference"
            value={reference}
            onChangeText={setReference}
            maxLength={120}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            placeholder="Reference shown by your bank"
            style={{
              borderWidth: 1,
              borderColor: palette.greyLight,
              borderRadius: 8,
              padding: 12,
              minHeight: 52,
              backgroundColor: palette.white,
              color: palette.black,
            }}
          />
          <Button
            variant="outlined"
            label={asset ? "Change receipt image" : "Choose receipt image"}
            loading={picking}
            disabled={isLoading}
            onPress={pick}
          />
          {asset ? (
            <View style={card}>
              <Image
                accessibilityLabel="Selected receipt preview"
                source={{ uri: asset.uri }}
                resizeMode="contain"
                style={{ height: 180, width: "100%" }}
              />
              <Text numberOfLines={2}>
                {asset.fileName || "Receipt selected"}
              </Text>
            </View>
          ) : null}
          <Button
            label="Submit receipt for review"
            disabled={!asset || reference.trim().length < 3 || picking}
            loading={isLoading}
            onPress={submit}
          />
          <Button
            label="Back to transfer details"
            variant="outlined"
            disabled={isLoading}
            onPress={() => setStep("transfer")}
          />
        </>
      )}
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: palette.error }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function ZellePayments({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const {
    currentData: data,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMyZellePaymentsQuery(page, {
    skip: !visible,
    refetchOnMountOrArgChange: true,
  });
  const [selected, setSelected] = useState<any>(null);
  const scroll = useRef<ScrollView>(null);
  const scrollTop = useCallback(
    () => scroll.current?.scrollTo({ y: 0, animated: false }),
    [],
  );
  const inset = useSafeAreaInsets();
  const close = () => {
    setSelected(null);
    onClose();
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: palette.background,
          paddingTop: inset.top,
          paddingBottom: inset.bottom,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <Text
            accessibilityRole="header"
            style={[typography.textLg, typography.fontSemiBold, { flex: 1 }]}
          >
            Zelle transfers
          </Text>
          <Button dense label="Close" variant="outlined" onPress={close} />
        </View>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          {selected ? (
            <>
              <ZelleReceipt
                onStepChange={scrollTop}
                key={selected._id}
                intent={selected}
                onDone={() => {
                  setSelected(null);
                  refetch();
                }}
                onSaveForLater={() => setSelected(null)}
              />
              <Button
                label="Back to transfers"
                variant="outlined"
                onPress={() => setSelected(null)}
              />
            </>
          ) : (
            <>
              <Text>
                Resume a transfer, upload a receipt, or check finance's review.
                Start a new membership payment or donation from Payments.
              </Text>
              <QueryFeedback
                label="Zelle transfers"
                loading={isFetching && !data}
                error={isError ? error : undefined}
                empty={!isFetching && !isError && !data?.items?.length}
                onRetry={refetch}
              />
              {data?.items?.map((item: any) => (
                <View key={item._id} style={card}>
                  <Text style={typography.fontSemiBold}>
                    USD {Number(item.amount).toFixed(2)} ·{" "}
                    {item.context === "SUBSCRIPTION"
                      ? "Membership"
                      : "Donation"}
                  </Text>
                  <Text selectable>{item.intentCode}</Text>
                  <Text>{zelleStatusLabel(item.status)}</Text>
                  {item.reviewNote ? <Text>{item.reviewNote}</Text> : null}
                  <Button
                    label={
                      ["PENDING", "FAILED"].includes(item.status)
                        ? "Resume transfer / upload receipt"
                        : "View transfer status"
                    }
                    variant="outlined"
                    onPress={() => setSelected(item)}
                  />
                </View>
              ))}
              {(data?.meta?.totalPages || 0) > 1 ? (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    dense
                    label="Previous"
                    disabled={page === 1 || isFetching}
                    onPress={() => setPage((previous) => previous - 1)}
                  />
                  <Text>
                    Page {page} of {data.meta.totalPages}
                  </Text>
                  <Button
                    dense
                    label="Next"
                    disabled={page >= data.meta.totalPages || isFetching}
                    onPress={() => setPage((previous) => previous + 1)}
                  />
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Button from "~/components/form/Button";
import {
  useGetMyZellePaymentsQuery,
  useUploadZelleProofMutation,
} from "~/store/api/zelleApi";
import { getApiErrorMessage } from "~/utils/getApiErrorMessage";
import { palette, typography } from "~/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ZelleReceipt({
  intent,
  onDone,
}: {
  intent: any;
  onDone: () => void;
}) {
  const [reference, setReference] = useState("");
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [upload, { isLoading }] = useUploadZelleProofMutation();
  const account = intent.contextData?.account;
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled) setAsset(result.assets[0]);
  };
  const submit = async () => {
    if (reference.trim().length < 3 || !asset) {
      Alert.alert(
        "Complete the receipt",
        "Enter the Zelle transaction reference and choose a receipt.",
      );
      return;
    }
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert(
        "Receipt too large",
        "Choose a JPEG or PNG image up to 5 MB.",
      );
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
      Alert.alert(
        "Receipt submitted",
        "Your payment is awaiting review. Your balance updates after finance confirms receipt.",
      );
      onDone();
    } catch (e) {
      Alert.alert("Unable to submit receipt", getApiErrorMessage(e));
    }
  };
  return (
    <View style={{ gap: 14 }}>
      <Text style={[typography.textLg, typography.fontSemiBold]}>
        Send USD {Number(intent.amount).toFixed(2)} with Zelle
      </Text>
      <Text selectable>Account: {account?.accountName}</Text>
      <Text selectable>Zelle email / phone: {account?.recipient}</Text>
      <Text selectable>Payment memo: {intent.intentCode}</Text>
      <Text>{account?.instructions}</Text>
      <Text>
        After sending, upload a JPEG or PNG receipt up to 5 MB. Your payment
        counts after finance confirms it.
      </Text>
      <Text>Zelle transaction reference</Text>
      <TextInput
        accessibilityLabel="Zelle transaction reference"
        value={reference}
        onChangeText={setReference}
        maxLength={120}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: palette.greyLight,
          borderRadius: 8,
          padding: 12,
          minHeight: 48,
        }}
      />
      <Button
        variant="outlined"
        label={asset ? "Change receipt image" : "Choose receipt image"}
        onPress={pick}
      />
      {asset && (
        <Text numberOfLines={2}>{asset.fileName || "Receipt selected"}</Text>
      )}
      <Button
        label="Submit receipt for review"
        loading={isLoading}
        onPress={submit}
      />
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
  const { data, isLoading, isError, refetch } = useGetMyZellePaymentsQuery(
    page,
    { skip: !visible, refetchOnMountOrArgChange: true },
  );
  const [selected, setSelected] = useState<any>(null);
  const inset = useSafeAreaInsets();
  const labels: Record<string, string> = {
    PENDING: "Awaiting transfer / receipt",
    AWAITING_REVIEW: "Awaiting review",
    REVIEWING: "Under review",
    SUCCESSFUL: "Confirmed",
    FAILED: "Rejected",
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: palette.background,
          paddingTop: inset.top,
          paddingBottom: inset.bottom,
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Text style={[typography.textLg, typography.fontSemiBold]}>
            Zelle transfers
          </Text>
          <Button
            variant="outlined"
            label="Close"
            onPress={() => {
              setSelected(null);
              onClose();
            }}
          />
          {selected ? (
            <>
              <ZelleReceipt
                key={selected._id}
                intent={selected}
                onDone={() => {
                  setSelected(null);
                  refetch();
                }}
              />
              <Button
                label="Back to transfers"
                variant="outlined"
                onPress={() => setSelected(null)}
              />
            </>
          ) : (
            <>
              {isLoading && <Text>Loading transfers...</Text>}
              {isError && (
                <Button label="Retry loading transfers" onPress={refetch} />
              )}
              {!isLoading && !isError && !data?.items?.length && (
                <Text>
                  No Zelle transfers yet. Choose Zelle when making a USD
                  membership payment or donation.
                </Text>
              )}
              {data?.items?.map((item: any) => (
                <View
                  key={item._id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 16,
                    gap: 8,
                  }}
                >
                  <Text style={typography.fontSemiBold}>
                    USD {Number(item.amount).toFixed(2)} ·{" "}
                    {item.context === "SUBSCRIPTION"
                      ? "Membership"
                      : "Donation"}
                  </Text>
                  <Text selectable>{item.intentCode}</Text>
                  <Text>{labels[item.status] || item.status}</Text>
                  {item.reviewNote && <Text>{item.reviewNote}</Text>}
                  {['PENDING', 'FAILED'].includes(item.status) && (
                    <Button
                      label="View details / upload receipt"
                      variant="outlined"
                      onPress={() => setSelected(item)}
                    />
                  )}
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                <Button
                  label="Previous"
                  disabled={page === 1}
                  onPress={() => setPage(page - 1)}
                />
                <Button
                  label="Next"
                  disabled={page >= (data?.meta?.totalPages || 1)}
                  onPress={() => setPage(page + 1)}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

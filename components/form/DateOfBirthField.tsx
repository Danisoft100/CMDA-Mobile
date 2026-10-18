import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Controller } from "react-hook-form";
import Button from "./Button";
import { palette } from "~/theme";

export default function DateOfBirthField({ control }: { control: any }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const now = new Date(),
    maxYear = now.getFullYear();
  const days =
    year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const iso =
    year && month && day
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "";
  const valid = Boolean(
    iso && Number(day) <= days && new Date(`${iso}T00:00:00`) <= now,
  );
  return (
    <Controller
      control={control}
      name="dateOfBirth"
      render={({ field }) => (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "600" }}>Date of Birth (optional)</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose date of birth"
            onPress={() => setOpen(true)}
            style={{
              borderWidth: 1,
              borderColor: palette.greyLight,
              borderRadius: 10,
              minHeight: 52,
              justifyContent: "center",
              padding: 12,
            }}
          >
            <Text>{field.value || "Choose your date of birth"}</Text>
          </TouchableOpacity>
          <Modal
            visible={open}
            transparent
            animationType="slide"
            onRequestClose={() => setOpen(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                padding: 20,
                backgroundColor: "#0006",
              }}
            >
              <View
                accessibilityViewIsModal
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  gap: 14,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  Choose date of birth
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Picker
                    accessibilityLabel="Birth year"
                    style={{ flex: 1 }}
                    selectedValue={year}
                    onValueChange={(value) => setYear(String(value))}
                  >
                    <Picker.Item label="Year" value="" />
                    {Array.from({ length: 121 }, (_, i) => maxYear - i).map(
                      (y) => (
                        <Picker.Item
                          key={y}
                          label={String(y)}
                          value={String(y)}
                        />
                      ),
                    )}
                  </Picker>
                  <Picker
                    accessibilityLabel="Birth month"
                    style={{ flex: 1 }}
                    selectedValue={month}
                    onValueChange={(value) => setMonth(String(value))}
                  >
                    <Picker.Item label="Month" value="" />
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <Picker.Item
                        key={m}
                        label={String(m)}
                        value={String(m)}
                      />
                    ))}
                  </Picker>
                  <Picker
                    accessibilityLabel="Birth day"
                    style={{ flex: 1 }}
                    selectedValue={day}
                    onValueChange={(value) => setDay(String(value))}
                  >
                    <Picker.Item label="Day" value="" />
                    {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                      <Picker.Item
                        key={d}
                        label={String(d)}
                        value={String(d)}
                      />
                    ))}
                  </Picker>
                </View>
                {!valid && iso ? (
                  <Text style={{ color: palette.error }}>
                    Choose a valid date that is not in the future.
                  </Text>
                ) : null}
                <Button
                  label="Use this date"
                  disabled={!valid}
                  onPress={() => {
                    field.onChange(iso);
                    setOpen(false);
                  }}
                />
                <Button
                  label="Leave blank"
                  variant="outlined"
                  onPress={() => {
                    field.onChange("");
                    setOpen(false);
                  }}
                />
                <Button
                  label="Cancel"
                  variant="outlined"
                  onPress={() => setOpen(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
    />
  );
}

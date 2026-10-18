import React, { useState, useRef, useEffect } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { palette, typography } from "~/theme";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange }) => {
  const [otp, setOTP] = useState(Array(length).fill(""));
  const inputsRef = useRef<TextInput[]>([]);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    // Do not collapse empty cells when the parent echoes our incomplete value.
    if (value !== lastEmitted.current) {
      setOTP(Array.from({ length }, (_, index) => value[index] || ""));
    }
  }, [value, length]);

  const handleOTPChange = (newValue: string, index: number) => {
    const newOTP = [...otp];
    const digits = newValue.replace(/\D/g, "").slice(0, length - index);
    if (digits)
      [...digits].forEach((digit, offset) => {
        newOTP[index + offset] = digit;
      });
    else newOTP[index] = "";
    setOTP(newOTP);
    lastEmitted.current = newOTP.every(Boolean) ? newOTP.join("") : "";
    onChange(lastEmitted.current);

    if (index < length - 1 && newValue !== "") {
      inputsRef.current[Math.min(index + digits.length, length - 1)]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    const newOTP = [...otp];
    newOTP[index] = "";
    setOTP(newOTP);
    lastEmitted.current = "";
    onChange("");

    if (index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(length)].map((_, index) => (
        <TextInput
          key={index}
          ref={(ref: TextInput | null) => {
            if (ref) inputsRef.current[index] = ref;
          }}
          style={styles.input}
          value={otp[index]}
          onChangeText={(newValue) => handleOTPChange(newValue, index)}
          maxLength={length}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
          selectTextOnFocus
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace") {
              handleBackspace(index);
            }
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  input: {
    width: 48,
    textAlign: "center",
    backgroundColor: palette.white,
    paddingHorizontal: 10,
    borderRadius: 8,
    paddingVertical: 8,
    color: palette.black,
    ...typography.textXl,
    lineHeight: typography.textXl.fontSize + 6,
    ...typography.fontSemiBold,
    borderWidth: 1.5,
    borderColor: palette.greyLight,
    minHeight: 52,
  },
});

export default OTPInput;

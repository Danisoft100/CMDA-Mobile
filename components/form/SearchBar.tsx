import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (inputValue: string) => void; // function that handles the search with inputValue as a param
}

const SearchBar = ({
  placeholder = "Search...",
  onSearch = console.log, // default function to log inputValue
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={inputValue ? palette.primary : palette.greyDark}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChangeText={(text) => setInputValue(text)}
          onSubmitEditing={() => onSearch(inputValue)} // handle submission via keyboard
          returnKeyType="search"
        />
        {inputValue ? (
          <TouchableOpacity
            onPress={() => {
              setInputValue("");
              onSearch("");
            }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close" size={20} color={palette.grey} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    borderWidth: 1.5,
    borderColor: palette.greyLight,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: palette.black,
    ...typography.textBase,
    lineHeight: typography.textBase.lineHeight - 4,
  },
  clearButton: {
    padding: 5,
  },
});

export default SearchBar;

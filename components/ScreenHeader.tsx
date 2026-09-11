import { StyleSheet, View } from "react-native";
import { Wordmark } from "./Wordmark";
import { colors, spacing } from "../theme";

export function ScreenHeader() {
  return (
    <View style={styles.header}>
      <Wordmark width={168} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.paperCream,
  },
});

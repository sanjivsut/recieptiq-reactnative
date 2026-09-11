import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "./Icon";
import { colors, fonts, radius, spacing } from "../theme";

/** A modal warning popup — dimmed backdrop, centered card, alert icon, and an
 *  explicit Close button — for real failures the user needs to acknowledge. */
export function WarningModal({
  visible,
  message,
  onClose,
}: {
  visible: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icon name="alert" size={22} color={colors.stampRed} />
          </View>
          <Text style={styles.title}>Scan failed</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(27, 42, 65, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1.5,
    borderColor: colors.stampRed,
    borderRadius: radius,
    backgroundColor: colors.paperWhite,
    padding: spacing.lg,
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.stampRed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: colors.stampRed,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.inkNavy,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  closeBtn: {
    alignSelf: "stretch",
    backgroundColor: colors.stampRed,
    borderRadius: radius,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  closeText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: colors.paperWhite,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

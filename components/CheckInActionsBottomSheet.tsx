import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Alert,
} from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckIn } from "@/types";
import { useCheckIns } from "@/lib/checkIns";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCheckInForm } from "@/hooks/useCheckInForm";
import { usePhotoPicker } from "@/hooks/usePhotoPicker";
import { deleteLocalCheckIn, updateLocalCheckIn } from "@/lib/localCheckIns";
import * as Haptics from "expo-haptics";
import { Id } from "@/convex/_generated/dataModel";

interface CheckInActionsBottomSheetProps {
	visible: boolean;
	onClose: () => void;
	checkIn: CheckIn | null;
	onDeleted?: () => void;
	onEdited?: () => void;
}

// Stable snap points to prevent re-renders
const MODAL_SNAP_POINTS = ["90%"];

export function CheckInActionsBottomSheet({
	visible,
	onClose,
	checkIn,
	onDeleted,
	onEdited,
}: CheckInActionsBottomSheetProps) {
	const { colors, isDark } = useTheme();
	const { userId } = useAuthContext();
	const { archiveCheckIn, updateCheckIn } = useCheckIns();
	const form = useCheckInForm();
	const photoPicker = usePhotoPicker((uri: string) => form.setPhoto(uri));
	const [showPhotoOptions, setShowPhotoOptions] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const noteInputRef = useRef<TextInput>(null);

	// Initialize form with existing check-in data
	useEffect(() => {
		if (checkIn && visible) {
			form.setNote(checkIn.note || "");
			form.setPhoto(checkIn.photo || null);
		} else if (!visible) {
			// Reset form when modal closes
			form.reset();
			setShowPhotoOptions(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkIn?.id, visible]);

	if (!checkIn) return null;

	// Check if this is the user's own check-in
	const checkInUserId = checkIn.userId ? String(checkIn.userId).trim() : "";
	const currentUserId = userId ? String(userId).trim() : "";

	// A check-in is "own" if:
	// 1. It's a local check-in ("local" means created by current user when not logged in)
	// 2. OR the userId matches the current logged-in user
	const isOwnCheckIn =
		checkInUserId === "local" ||
		(checkInUserId !== "" &&
			currentUserId !== "" &&
			checkInUserId === currentUserId);

	if (!isOwnCheckIn) {
		return (
			<BottomSheet visible={visible} onClose={onClose} snapPoints={MODAL_SNAP_POINTS}>
				<View style={styles.container}>
					<Text style={[styles.title, { color: colors.textSecondary }]}>
						You can only edit your own check-ins
					</Text>
				</View>
			</BottomSheet>
		);
	}

	const handleSave = async () => {
		if (isSaving) return;

		// Check if there are any changes
		const hasChanges =
			form.note !== (checkIn.note || "") ||
			form.photo !== (checkIn.photo || null);

		if (!hasChanges) {
			Alert.alert("No Changes", "You haven't made any changes to save.");
			return;
		}

		setIsSaving(true);
		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			// Handle local check-ins vs server check-ins
			if (checkInUserId === "local") {
				console.log("[CheckInActionsBottomSheet] Updating local check-in:", {
					id: checkIn.id,
					photo: form.photo ? "has photo" : "no photo",
					note: form.note || "no note",
				});
				// Update local check-in
				await updateLocalCheckIn(checkIn.id, {
					photo: form.photo || null,
					note: form.note.trim() || null,
				});
				console.log("[CheckInActionsBottomSheet] Local check-in updated successfully");
			} else {
				// Update server check-in
				// Convert empty strings to undefined for Convex schema
				const photoValue = form.photo && form.photo.trim() ? form.photo : undefined;
				const noteValue = form.note && form.note.trim() ? form.note.trim() : undefined;

				console.log("[CheckInActionsBottomSheet] Updating server check-in:", {
					checkInId: checkIn.id,
					photo: photoValue ? "has photo" : "no photo",
					note: noteValue || "no note",
				});

				await updateCheckIn({
					checkInId: checkIn.id as Id<"checkIns">,
					photo: photoValue,
					note: noteValue,
				});
				console.log("[CheckInActionsBottomSheet] Server check-in updated successfully");
			}

			onEdited?.();
			onClose();
		} catch (error: any) {
			console.error("[CheckInActionsBottomSheet] Error updating check-in:", error);
			Alert.alert(
				"Error",
				error.message || "Failed to update check-in. Please try again."
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = () => {
		Alert.alert(
			"Delete Check-in",
			"Are you sure you want to delete this check-in? This will undo your streak for this day.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setIsDeleting(true);
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

							// Handle local check-ins vs server check-ins
							if (checkInUserId === "local") {
								// Delete local check-in
								await deleteLocalCheckIn(checkIn.id);
							} else {
								// Archive server check-in
								await archiveCheckIn({
									checkInId: checkIn.id as Id<"checkIns">,
								});
							}

							onDeleted?.();
							onClose();
						} catch (error: any) {
							Alert.alert(
								"Error",
								error.message || "Failed to delete check-in. Please try again."
							);
						} finally {
							setIsDeleting(false);
						}
					},
				},
			]
		);
	};

	const handleClose = () => {
		Keyboard.dismiss();
		form.reset();
		setShowPhotoOptions(false);
		onClose();
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={handleClose}
			snapPoints={MODAL_SNAP_POINTS}
			enablePanDownToClose={true}
		>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={0}
			>
				{/* Header */}
				<View style={[styles.header, { borderBottomColor: colors.border }]}>
					<Text style={[styles.title, { color: colors.text }]}>
						Edit Check-in
					</Text>
					<Text style={[styles.subtitle, { color: colors.textTertiary }]}>
						Update your workout details
					</Text>
				</View>

				{/* Scrollable Content */}
				<ScrollView
					ref={scrollViewRef}
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={true}
					bounces={true}
					scrollEnabled={true}
					keyboardDismissMode="interactive"
					nestedScrollEnabled={false}
				>
					{/* Photo Section */}
					<View style={styles.section}>
						<Text style={[styles.sectionLabel, { color: colors.text }]}>
							Photo
						</Text>
						{form.photo ? (
							<View style={styles.photoContainer}>
								<Image
									source={{ uri: form.photo }}
									style={styles.photo}
									resizeMode="cover"
								/>
								<TouchableOpacity
									onPress={() => {
										form.setPhoto(null);
										setShowPhotoOptions(false);
									}}
									style={[
										styles.removePhotoButton,
										{ backgroundColor: colors.error || "#EF4444" },
									]}
								>
									<Text style={styles.removePhotoText}>Remove Photo</Text>
								</TouchableOpacity>
							</View>
						) : (
							<View>
								<TouchableOpacity
									onPress={() => setShowPhotoOptions(true)}
									style={[
										styles.photoButton,
										{
											backgroundColor: colors.cardSecondary,
											borderColor: colors.border,
										},
									]}
								>
									<Text style={styles.photoButtonIcon}>📷</Text>
									<Text
										style={[
											styles.photoButtonText,
											{ color: colors.textSecondary },
										]}
									>
										Add Photo
									</Text>
								</TouchableOpacity>

								{showPhotoOptions && (
									<View style={styles.photoOptionsContainer}>
										<TouchableOpacity
											onPress={async () => {
												await photoPicker.takePhoto();
												setShowPhotoOptions(false);
											}}
											style={[
												styles.photoOptionButton,
												{ backgroundColor: colors.primary },
											]}
										>
											<Text style={styles.photoOptionIcon}>📸</Text>
											<Text style={styles.photoOptionButtonText}>
												Camera
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={async () => {
												await photoPicker.pickFromLibrary();
												setShowPhotoOptions(false);
											}}
											style={[
												styles.photoOptionButton,
												{ backgroundColor: colors.primary },
											]}
										>
											<Text style={styles.photoOptionIcon}>🖼️</Text>
											<Text style={styles.photoOptionButtonText}>
												Gallery
											</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						)}
					</View>

					{/* Note Section */}
					<View style={styles.section}>
						<Text style={[styles.sectionLabel, { color: colors.text }]}>
							Note
							<Text style={{ color: colors.textTertiary }}> (optional)</Text>
						</Text>
						<TextInput
							ref={noteInputRef}
							style={[
								styles.noteInput,
								{
									backgroundColor: colors.cardSecondary,
									borderColor: colors.border,
									color: colors.text,
								},
							]}
							placeholder="How did your workout go?"
							placeholderTextColor={colors.textTertiary}
							value={form.note}
							onChangeText={form.setNote}
							onFocus={() => {
								scrollViewRef.current?.scrollToEnd({ animated: true });
							}}
							multiline
							textAlignVertical="top"
							blurOnSubmit={false}
							returnKeyType="default"
							keyboardType="default"
							autoCorrect={true}
							autoCapitalize="sentences"
						/>
					</View>

					{/* Save Button */}
					<View style={[styles.buttonContainer, { backgroundColor: colors.surface }]}>
						<Button
							title="Save Changes"
							onPress={() => {
								Keyboard.dismiss();
								handleSave();
							}}
							fullWidth={true}
							loading={isSaving}
							disabled={isSaving}
						/>
					</View>

					{/* Delete Button */}
					<View style={styles.deleteButtonContainer}>
						<Pressable
							onPress={handleDelete}
							disabled={isDeleting}
							style={({ pressed }) => [
								styles.deleteButton,
								{
									backgroundColor: isDark
										? "rgba(239, 68, 68, 0.15)"
										: "rgba(239, 68, 68, 0.1)",
									opacity: pressed || isDeleting ? 0.7 : 1,
								},
							]}
						>
							<Text style={styles.deleteButtonText}>
								{isDeleting ? "Deleting..." : "Delete Check-in"}
							</Text>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: Theme.spacing.xl,
		paddingTop: Theme.spacing.md,
		paddingBottom: Theme.spacing.lg,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	title: {
		fontSize: Theme.typography.fontSize["2xl"],
		fontWeight: Theme.typography.fontWeight.bold,
		marginBottom: Theme.spacing.xs,
	},
	subtitle: {
		fontSize: Theme.typography.fontSize.sm,
		marginTop: Theme.spacing.xs,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: Theme.spacing.xl,
		paddingBottom: Theme.spacing.xl * 3,
	},
	section: {
		marginBottom: Theme.spacing.xl,
	},
	sectionLabel: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.semibold,
		marginBottom: Theme.spacing.md,
	},
	photoContainer: {
		gap: Theme.spacing.md,
	},
	photo: {
		width: "100%",
		height: 240,
		borderRadius: Theme.borderRadius.lg,
	},
	removePhotoButton: {
		paddingVertical: Theme.spacing.sm,
		paddingHorizontal: Theme.spacing.md,
		borderRadius: Theme.borderRadius.md,
		alignSelf: "flex-start",
	},
	removePhotoText: {
		color: "#FFFFFF",
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.semibold,
	},
	photoButton: {
		borderWidth: 2,
		borderStyle: "dashed",
		borderRadius: Theme.borderRadius.lg,
		padding: Theme.spacing.xl,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 100,
	},
	photoButtonIcon: {
		fontSize: 40,
		marginBottom: Theme.spacing.xs,
	},
	photoButtonText: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.medium,
	},
	photoOptionsContainer: {
		flexDirection: "row",
		gap: Theme.spacing.md,
		marginTop: Theme.spacing.md,
	},
	photoOptionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Theme.spacing.md,
		paddingHorizontal: Theme.spacing.md,
		borderRadius: Theme.borderRadius.md,
		gap: Theme.spacing.xs,
	},
	photoOptionIcon: {
		fontSize: 20,
	},
	photoOptionButtonText: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.semibold,
		color: "#FFFFFF",
	},
	noteInput: {
		borderWidth: 1,
		borderRadius: Theme.borderRadius.md,
		padding: Theme.spacing.md,
		fontSize: Theme.typography.fontSize.base,
		minHeight: 100,
		maxHeight: 150,
		textAlignVertical: "top",
	},
	buttonContainer: {
		paddingTop: Theme.spacing.lg,
		paddingBottom: Theme.spacing.md,
	},
	deleteButtonContainer: {
		paddingTop: Theme.spacing.md,
		paddingBottom: Theme.spacing.xl,
	},
	deleteButton: {
		paddingVertical: Theme.spacing.md,
		paddingHorizontal: Theme.spacing.lg,
		borderRadius: Theme.borderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	deleteButtonText: {
		color: "#EF4444",
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.bold,
	},
});

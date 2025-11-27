import React, { useState, useRef } from "react";
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
} from "react-native";
import { Button } from "@/components/Button";
import { BottomSheet } from "@/components/BottomSheet";
import { Theme } from "@/constants/Theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useCheckInForm } from "@/hooks/useCheckInForm";
import { usePhotoPicker } from "@/hooks/usePhotoPicker";
import { Id } from "@/convex/_generated/dataModel";

interface CheckInModalProps {
	visible: boolean;
	groups: Array<{ _id: Id<"groups">; name: string }>;
	onClose: () => void;
	onSubmit: (data: {
		note: string;
		photo: string | null;
		groupIds: Id<"groups">[];
	}) => void;
	loading?: boolean;
}

// Stable snap points to prevent re-renders
const MODAL_SNAP_POINTS = ['90%'];

export function CheckInModal({
	visible,
	groups,
	onClose,
	onSubmit,
	loading = false,
}: CheckInModalProps) {
	const { colors } = useTheme();
	const form = useCheckInForm();
	const photoPicker = usePhotoPicker((uri: string) => form.setPhoto(uri));
	const [showPhotoOptions, setShowPhotoOptions] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const noteInputRef = useRef<TextInput>(null);

	const handleSubmit = () => {
		if (!form.note.trim() && !form.photo) {
			return;
		}

		// Allow submission even without groups (personal check-in)
		onSubmit({
			note: form.note,
			photo: form.photo,
			groupIds: form.selectedGroups,
		});

		form.reset();
		setShowPhotoOptions(false);
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
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={100}
			>
				{/* Header */}
				<View style={[styles.header, { borderBottomColor: colors.border }]}>
					<Text style={[styles.title, { color: colors.text }]}>
						Log Your Activity
					</Text>
					<Text style={[styles.subtitle, { color: colors.textTertiary }]}>
						Share your workout with your groups
					</Text>
				</View>

				{/* Scrollable Content */}
				<ScrollView
					ref={scrollViewRef}
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					bounces={false}
					scrollEnabled={true}
					keyboardDismissMode="interactive"
				>
						{/* Group Selection Section */}
						{groups.length > 0 && (
							<View style={styles.section}>
								<Text style={[styles.sectionLabel, { color: colors.text }]}>
									Share with
								</Text>
								<View style={styles.groupChipsContainer}>
									<TouchableOpacity
										onPress={() =>
											form.toggleAllGroups(groups.map((g) => g._id))
										}
										style={[
											styles.groupChip,
											{
												backgroundColor:
													form.selectedGroups.length === groups.length
														? colors.primary
														: colors.cardSecondary,
												borderColor:
													form.selectedGroups.length === groups.length
														? colors.primary
														: colors.border,
											},
										]}
									>
										<Text
											style={[
												styles.groupChipText,
												{
													color:
														form.selectedGroups.length === groups.length
															? "#FFFFFF"
															: colors.text,
												},
											]}
										>
											All
										</Text>
									</TouchableOpacity>
									{groups.map((group) => (
										<TouchableOpacity
											key={group._id}
											onPress={() => form.toggleGroup(group._id)}
											style={[
												styles.groupChip,
												{
													backgroundColor: form.selectedGroups.includes(
														group._id
													)
														? colors.primary
														: colors.cardSecondary,
													borderColor: form.selectedGroups.includes(
														group._id
													)
														? colors.primary
														: colors.border,
												},
											]}
										>
											<Text
												style={[
													styles.groupChipText,
													{
														color: form.selectedGroups.includes(group._id)
															? "#FFFFFF"
															: colors.text,
													},
												]}
											>
												{group.name}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}

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
											{ backgroundColor: colors.error || '#EF4444' },
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

					{/* Button inside ScrollView */}
					<View style={[styles.buttonContainer, { backgroundColor: colors.surface }]}>
						<Button
							title="Log Activity"
							onPress={() => {
								Keyboard.dismiss();
								handleSubmit();
							}}
							fullWidth={true}
							loading={loading}
							disabled={loading}
						/>
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
		paddingBottom: Theme.spacing.xl,
	},
	section: {
		marginBottom: Theme.spacing.xl,
	},
	sectionLabel: {
		fontSize: Theme.typography.fontSize.base,
		fontWeight: Theme.typography.fontWeight.semibold,
		marginBottom: Theme.spacing.md,
	},
	groupChipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Theme.spacing.sm,
	},
	groupChip: {
		paddingVertical: Theme.spacing.sm,
		paddingHorizontal: Theme.spacing.lg,
		borderRadius: Theme.borderRadius.full,
		borderWidth: 2,
	},
	groupChipText: {
		fontSize: Theme.typography.fontSize.sm,
		fontWeight: Theme.typography.fontWeight.semibold,
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
		paddingBottom: Theme.spacing.xl,
	},
});

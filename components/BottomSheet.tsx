import React, { useEffect, useMemo, useRef } from 'react';
import {
	StyleSheet,
	Modal,
	View,
	TouchableWithoutFeedback,
	Dimensions,
	Platform,
} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/constants/Theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
	visible: boolean;
	onClose: () => void;
	children: React.ReactNode;
	snapPoints?: string[] | number[];
	enablePanDownToClose?: boolean;
}

export function BottomSheet({
	visible,
	onClose,
	children,
	snapPoints = ['60%', '90%'],
	enablePanDownToClose = true,
}: BottomSheetProps) {
	const { colors, isDark } = useTheme();
	const translateY = useSharedValue(SCREEN_HEIGHT);
	const context = useSharedValue({ y: 0 });
	const wasVisible = useRef(false);

	// Convert snap points to pixel values - memoize with stringified snapPoints to avoid reference issues
	const snapPointsKey = JSON.stringify(snapPoints);
	const snapPointValues = useMemo(() => {
		return snapPoints.map((point) => {
			if (typeof point === 'string') {
				const percentage = parseFloat(point.replace('%', ''));
				return SCREEN_HEIGHT * (percentage / 100);
			}
			return point;
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [snapPointsKey]);

	const backdropOpacity = useSharedValue(0);

	useEffect(() => {
		// Only animate when visibility actually changes
		if (visible && !wasVisible.current) {
			wasVisible.current = true;
			// Immediately set initial position
			translateY.value = SCREEN_HEIGHT;
			backdropOpacity.value = 0;
			
			// Animate in after a brief delay to ensure Modal is mounted
			const timer = setTimeout(() => {
				const targetY = SCREEN_HEIGHT - snapPointValues[0];
				translateY.value = withSpring(targetY, {
					damping: 50,
					stiffness: 300,
				});
				backdropOpacity.value = withTiming(1, { 
					duration: 250,
				});
			}, 10);
			
			return () => clearTimeout(timer);
		} else if (!visible && wasVisible.current) {
			wasVisible.current = false;
			// Animate off screen - fade backdrop first, then slide down
			backdropOpacity.value = withTiming(0, { 
				duration: 200,
			});
			translateY.value = withTiming(SCREEN_HEIGHT, {
				duration: 300,
			});
		}
	}, [visible, snapPointValues]);

	const gesture = Gesture.Pan()
		.onStart(() => {
			context.value = { y: translateY.value };
		})
		.onUpdate((event) => {
			// Allow dragging both up and down
			const newY = event.translationY + context.value.y;
			const minY = SCREEN_HEIGHT - Math.max(...snapPointValues);
			const maxY = SCREEN_HEIGHT;
			translateY.value = Math.max(minY, Math.min(maxY, newY));
		})
		.onEnd((event) => {
			const dragVelocity = event.velocityY;
			const currentY = translateY.value;
			const currentHeight = SCREEN_HEIGHT - currentY;

			// Find closest snap point
			let targetHeight = snapPointValues[0];
			let minDistance = Math.abs(currentHeight - snapPointValues[0]);

			for (let i = 0; i < snapPointValues.length; i++) {
				const distance = Math.abs(currentHeight - snapPointValues[i]);
				if (distance < minDistance) {
					minDistance = distance;
					targetHeight = snapPointValues[i];
				}
			}

			// Close if dragged down fast or past threshold
			if (
				enablePanDownToClose &&
				(dragVelocity > 1000 || currentY > SCREEN_HEIGHT * 0.7)
			) {
				backdropOpacity.value = withTiming(0, { duration: 200 });
				translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
					runOnJS(onClose)();
				});
			} else {
				translateY.value = withSpring(SCREEN_HEIGHT - targetHeight, {
					damping: 50,
					stiffness: 300,
				});
			}
		})
		.activeOffsetY([-10, 10])
		.failOffsetX([-50, 50]);

	const animatedBottomSheetStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
		};
	});

	const animatedBackdropStyle = useAnimatedStyle(() => {
		return {
			opacity: backdropOpacity.value,
		};
	});

	const handleBackdropPress = () => {
		if (enablePanDownToClose) {
			backdropOpacity.value = withTiming(0, { duration: 200 });
			translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
				runOnJS(onClose)();
			});
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<GestureHandlerRootView style={styles.container}>
				{/* Backdrop with blur */}
				<TouchableWithoutFeedback onPress={handleBackdropPress}>
					<Animated.View
						style={[
							styles.backdrop,
							animatedBackdropStyle,
						]}
					>
						<BlurView
							intensity={20}
							tint={isDark ? 'dark' : 'light'}
							style={StyleSheet.absoluteFillObject}
						/>
						{/* Subtle dark overlay for better contrast */}
						<Animated.View
							style={[
								StyleSheet.absoluteFillObject,
								{
									backgroundColor: isDark
										? 'rgba(0, 0, 0, 0.2)'
										: 'rgba(0, 0, 0, 0.15)',
								},
								animatedBackdropStyle,
							]}
						/>
					</Animated.View>
				</TouchableWithoutFeedback>

				{/* Bottom Sheet */}
				<Animated.View
					style={[
						styles.bottomSheet,
						{
							backgroundColor: colors.surface,
							borderTopLeftRadius: Theme.borderRadius.xl,
							borderTopRightRadius: Theme.borderRadius.xl,
						},
						animatedBottomSheetStyle,
					]}
				>
					{/* Handle with gesture - larger touch area */}
					<GestureDetector gesture={gesture}>
						<View style={styles.handleContainer}>
							<View
								style={[
									styles.handle,
									{ backgroundColor: colors.border },
								]}
							/>
						</View>
					</GestureDetector>

					{/* Content */}
					<View style={styles.content}>{children}</View>
				</Animated.View>
			</GestureHandlerRootView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	bottomSheet: {
		position: 'absolute',
		height: SCREEN_HEIGHT,
		width: '100%',
		top: 0,
		left: 0,
		right: 0,
		paddingTop: Theme.spacing.md,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: -4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 16,
	},
	handleContainer: {
		paddingVertical: Theme.spacing.md,
		paddingHorizontal: Theme.spacing.xl,
		alignItems: 'center',
		minHeight: 44, // Minimum touch target size
		justifyContent: 'center',
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
	},
	content: {
		flex: 1,
		overflow: 'visible',
	},
});

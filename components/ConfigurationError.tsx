import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme';

interface ConfigurationErrorProps {
	message: string;
	instructions?: string[];
}

export const ConfigurationError: React.FC<ConfigurationErrorProps> = ({
	message,
	instructions = [],
}) => {
	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={true}
			>
				<View style={styles.content}>
					<Text style={styles.title}>⚠️ Error de Configuración</Text>
					<Text style={styles.message}>{message}</Text>
					{instructions.length > 0 && (
						<View style={styles.instructionsContainer}>
							<Text style={styles.instructionsTitle}>Pasos para solucionar:</Text>
							{instructions.map((instruction, index) => (
								<Text key={index} style={styles.instruction}>
									{index + 1}. {instruction}
								</Text>
							))}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Theme.colors.background,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 20,
	},
	content: {
		backgroundColor: Theme.colors.card,
		borderRadius: 12,
		padding: 24,
		margin: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: Theme.colors.error || '#EF4444',
		marginBottom: 16,
		textAlign: 'center',
	},
	message: {
		fontSize: 16,
		color: Theme.colors.text,
		marginBottom: 24,
		lineHeight: 24,
	},
	instructionsContainer: {
		marginTop: 8,
	},
	instructionsTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: Theme.colors.text,
		marginBottom: 12,
	},
	instruction: {
		fontSize: 14,
		color: Theme.colors.textSecondary || Theme.colors.text,
		marginBottom: 8,
		lineHeight: 20,
		paddingLeft: 8,
	},
});


import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, FlipType, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

interface UsePhotoPickerReturn {
  photo: string | null;
  pickFromLibrary: () => Promise<void>;
  takePhoto: () => Promise<void>;
  removePhoto: () => void;
}

export function usePhotoPicker(
  onPhotoSelected?: (uri: string) => void
): UsePhotoPickerReturn {
  const [photo, setPhoto] = useState<string | null>(null);

  const pickFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      onPhotoSelected?.(uri);
    }
  }, [onPhotoSelected]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Camera permission is required to take photos'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Flip the image horizontally to match the camera preview (Instagram style)
      const context = ImageManipulator.manipulate(result.assets[0].uri);
      context.flip(FlipType.Horizontal);
      const manipulatedImage = await context.renderAsync();
      const savedImage = await manipulatedImage.saveAsync({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });

      // Release resources
      context.release();
      manipulatedImage.release();

      setPhoto(savedImage.uri);
      onPhotoSelected?.(savedImage.uri);
    }
  }, [onPhotoSelected]);

  const removePhoto = useCallback(() => {
    setPhoto(null);
  }, []);

  return {
    photo,
    pickFromLibrary,
    takePhoto,
    removePhoto,
  };
}


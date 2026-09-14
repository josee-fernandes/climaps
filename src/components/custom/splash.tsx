import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const BRAND_BLUE = '#204FFF';

export function Splash() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/climaps-horizontal.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Climaps"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_BLUE,
  },
  logo: {
    width: 280,
    height: 140,
  },
});

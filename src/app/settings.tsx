import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingItem } from '@/components/custom/setting-item';
import { ThemeSelector } from '@/components/custom/theme-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OPEN_METEO_SITE_URL } from '@/constants/config';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';
}

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle" accessibilityRole="header">
            Configurações
          </ThemedText>

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Tema
          </ThemedText>
          <ThemeSelector />

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Privacidade
          </ThemedText>
          <SettingItem
            title="Localização"
            description="A localização é utilizada para descobrir as coordenadas da região atual e consultar informações meteorológicas."
          />
          <SettingItem
            title="Sem cadastro"
            description="O Climaps não possui cadastro e não mantém um perfil pessoal do usuário."
          />
          <SettingItem
            title="Dados locais"
            description="A preferência de tema é armazenada localmente no dispositivo."
          />
          <SettingItem
            title="Uso da localização"
            description="Por que pedimos: apenas para saber a região e consultar o clima. Sem servidor próprio para guardar dados pessoais."
          />

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Fonte dos dados
          </ThemedText>
          <SettingItem
            title="Open-Meteo"
            description="Os dados meteorológicos são obtidos através da Open-Meteo."
            icon={ExternalLink}
            onPress={() => {
              void WebBrowser.openBrowserAsync(OPEN_METEO_SITE_URL);
            }}
            right={
              <ExternalLink
                size={18}
                color={colors.primary}
                accessibilityLabel="Abrir site da Open-Meteo"
              />
            }
          />

          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Versão
          </ThemedText>
          <SettingItem title="Climaps" description={getAppVersion()} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
});
